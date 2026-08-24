import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentStatus, SubscriptionPlan } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { computeJobEconomics, decimalToNumber } from '../common/utils/economics.util';
import { CreateCheckoutDto, CreateInvoiceFromJobDto, CreateQuoteFromJobDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secret) {
      this.stripe = new Stripe(secret);
    }
  }

  listQuotes(organizationId: string) {
    return this.prisma.quote.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { job: { select: { id: true, title: true } } },
    });
  }

  listInvoices(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { job: { select: { id: true, title: true } } },
    });
  }

  getSubscription(organizationId: string) {
    return this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuoteFromJob(organizationId: string, dto: CreateQuoteFromJobDto) {
    const job = await this.getJobWithEconomics(organizationId, dto.jobId);
    const number = await this.nextDocumentNumber(organizationId, 'Q');

    return this.prisma.quote.create({
      data: {
        organizationId,
        jobId: dto.jobId,
        number,
        status: DocumentStatus.DRAFT,
        totalAmount: job.economics.revenue,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
      include: { job: { select: { id: true, title: true } } },
    });
  }

  async createInvoiceFromJob(organizationId: string, dto: CreateInvoiceFromJobDto) {
    const job = await this.getJobWithEconomics(organizationId, dto.jobId);
    const number = await this.nextDocumentNumber(organizationId, 'INV');

    return this.prisma.invoice.create({
      data: {
        organizationId,
        jobId: dto.jobId,
        number,
        status: DocumentStatus.DRAFT,
        totalAmount: job.economics.revenue,
        issuedAt: new Date(),
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
      include: { job: { select: { id: true, title: true } } },
    });
  }

  async createCheckoutSession(organizationId: string, dto: CreateCheckoutDto) {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs.',
      );
    }

    const priceId = this.priceIdForPlan(dto.plan);
    if (!priceId) {
      throw new BadRequestException(`No Stripe price configured for plan ${dto.plan}`);
    }

    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    const subscription = await this.getSubscription(organizationId);
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        name: org.name,
        metadata: { organizationId },
      });
      customerId = customer.id;
      if (subscription) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: this.config.get('STRIPE_SUCCESS_URL', 'http://localhost:3000/settings?billing=success'),
      cancel_url: this.config.get('STRIPE_CANCEL_URL', 'http://localhost:3000/settings?billing=cancel'),
      metadata: { organizationId, plan: dto.plan },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe not configured');
    }

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET not configured');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;
        const plan = session.metadata?.plan as SubscriptionPlan | undefined;
        if (organizationId && plan) {
          await this.prisma.organization.update({
            where: { id: organizationId },
            data: { plan },
          });
          await this.prisma.subscription.updateMany({
            where: { organizationId },
            data: {
              plan,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
            },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'cancelled', plan: SubscriptionPlan.FREE },
        });
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private priceIdForPlan(plan: SubscriptionPlan): string | undefined {
    const map: Record<string, string | undefined> = {
      PRO: this.config.get('STRIPE_PRICE_PRO'),
      BUSINESS: this.config.get('STRIPE_PRICE_BUSINESS'),
    };
    return map[plan];
  }

  private async nextDocumentNumber(organizationId: string, prefix: string): Promise<string> {
    const count =
      prefix === 'Q'
        ? await this.prisma.quote.count({ where: { organizationId } })
        : await this.prisma.invoice.count({ where: { organizationId } });
    return `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }

  private async getJobWithEconomics(organizationId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, organizationId },
      include: { items: true, activities: true, materialUsages: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    const economics = computeJobEconomics({
      items: job.items,
      activities: job.activities,
      materialUsages: job.materialUsages,
    });

    return { ...job, economics };
  }
}
