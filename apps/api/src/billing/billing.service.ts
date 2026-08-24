import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentStatus, PaymentProvider, SubscriptionPlan } from '@prisma/client';
import Stripe from 'stripe';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { computeJobEconomics, decimalToNumber } from '../common/utils/economics.util';
import {
  CreateCheckoutDto,
  CreateDocumentLineDto,
  CreateInvoiceFromJobDto,
  CreateQuoteFromJobDto,
} from './dto/billing.dto';

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
      include: {
        job: { select: { id: true, title: true } },
        lines: true,
      },
    });
  }

  async getQuote(organizationId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, organizationId },
      include: { job: { select: { id: true, title: true } }, lines: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  listInvoices(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { id: true, title: true } },
        lines: true,
      },
    });
  }

  async getInvoice(organizationId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: { job: { select: { id: true, title: true } }, lines: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
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
    const lines = this.jobItemsToLines(job.items);

    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          organizationId,
          jobId: dto.jobId,
          number,
          status: DocumentStatus.DRAFT,
          totalAmount: job.economics.revenue,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        },
      });

      if (lines.length > 0) {
        await tx.quoteLine.createMany({
          data: lines.map((line) => ({
            organizationId,
            quoteId: quote.id,
            ...line,
          })),
        });
      }

      return tx.quote.findUnique({
        where: { id: quote.id },
        include: { job: { select: { id: true, title: true } }, lines: true },
      });
    });
  }

  async createInvoiceFromJob(organizationId: string, dto: CreateInvoiceFromJobDto) {
    const job = await this.getJobWithEconomics(organizationId, dto.jobId);
    const number = await this.nextDocumentNumber(organizationId, 'INV');
    const lines = this.jobItemsToLines(job.items);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          jobId: dto.jobId,
          number,
          status: DocumentStatus.DRAFT,
          totalAmount: job.economics.revenue,
          issuedAt: new Date(),
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        },
      });

      if (lines.length > 0) {
        await tx.invoiceLine.createMany({
          data: lines.map((line) => ({
            organizationId,
            invoiceId: invoice.id,
            ...line,
          })),
        });
      }

      return tx.invoice.findUnique({
        where: { id: invoice.id },
        include: { job: { select: { id: true, title: true } }, lines: true },
      });
    });
  }

  async addQuoteLine(organizationId: string, quoteId: string, dto: CreateDocumentLineDto) {
    await this.ensureQuote(organizationId, quoteId);
    const line = await this.prisma.quoteLine.create({
      data: {
        organizationId,
        quoteId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
      },
    });
    await this.recalculateQuoteTotal(organizationId, quoteId);
    return line;
  }

  async addInvoiceLine(organizationId: string, invoiceId: string, dto: CreateDocumentLineDto) {
    await this.ensureInvoice(organizationId, invoiceId);
    const line = await this.prisma.invoiceLine.create({
      data: {
        organizationId,
        invoiceId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
      },
    });
    await this.recalculateInvoiceTotal(organizationId, invoiceId);
    return line;
  }

  async createCheckoutSession(organizationId: string, dto: CreateCheckoutDto) {
    const provider = dto.provider ?? PaymentProvider.STRIPE;
    if (provider === PaymentProvider.LEMONSQUEEZY) {
      return this.createLemonCheckout(organizationId, dto.plan);
    }
    return this.createStripeCheckout(organizationId, dto.plan);
  }

  private async createStripeCheckout(organizationId: string, plan: SubscriptionPlan) {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs.',
      );
    }

    const priceId = this.stripePriceForPlan(plan);
    if (!priceId) {
      throw new BadRequestException(`No Stripe price configured for plan ${plan}`);
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
          data: { stripeCustomerId: customerId, paymentProvider: PaymentProvider.STRIPE },
        });
      }
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: this.config.get('STRIPE_SUCCESS_URL', 'http://localhost:3000/settings?billing=success'),
      cancel_url: this.config.get('STRIPE_CANCEL_URL', 'http://localhost:3000/settings?billing=cancel'),
      metadata: { organizationId, plan },
    });

    return { url: session.url, sessionId: session.id, provider: PaymentProvider.STRIPE };
  }

  async createLemonCheckout(organizationId: string, plan: SubscriptionPlan) {
    const apiKey = this.config.get<string>('LEMONSQUEEZY_API_KEY');
    const storeId = this.config.get<string>('LEMONSQUEEZY_STORE_ID');
    const variantId = this.lemonVariantForPlan(plan);

    if (!apiKey || !storeId || !variantId) {
      throw new ServiceUnavailableException(
        'Lemon Squeezy not configured. Set LEMONSQUEEZY_API_KEY, STORE_ID and variant IDs.',
      );
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: { organizationId, plan },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`Lemon Squeezy checkout failed: ${err}`);
      throw new BadRequestException('Failed to create Lemon Squeezy checkout');
    }

    const json = (await response.json()) as {
      data: { attributes: { url: string } };
    };

    await this.prisma.subscription.updateMany({
      where: { organizationId },
      data: { paymentProvider: PaymentProvider.LEMONSQUEEZY },
    });

    return { url: json.data.attributes.url, provider: PaymentProvider.LEMONSQUEEZY };
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
          await this.activateSubscription(organizationId, plan, {
            paymentProvider: PaymentProvider.STRIPE,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
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

  async handleLemonWebhook(rawBody: Buffer, signature: string | undefined) {
    const secret = this.config.get<string>('LEMONSQUEEZY_WEBHOOK_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
    }

    if (!signature || !this.verifyLemonSignature(rawBody, signature, secret)) {
      throw new BadRequestException('Invalid Lemon Squeezy webhook signature');
    }

    const payload = JSON.parse(rawBody.toString('utf8')) as {
      meta?: { event_name?: string; custom_data?: { organizationId?: string; plan?: SubscriptionPlan } };
      data?: { attributes?: { customer_id?: number; subscription_id?: number } };
    };

    const eventName = payload.meta?.event_name;
    const organizationId = payload.meta?.custom_data?.organizationId;
    const plan = payload.meta?.custom_data?.plan;

    if (eventName === 'subscription_created' && organizationId && plan) {
      await this.activateSubscription(organizationId, plan, {
        paymentProvider: PaymentProvider.LEMONSQUEEZY,
        lemonSqueezyCustomerId: String(payload.data?.attributes?.customer_id ?? ''),
        lemonSqueezySubscriptionId: String(payload.data?.attributes?.subscription_id ?? ''),
      });
    }

    if (eventName === 'subscription_cancelled' && organizationId) {
      await this.prisma.subscription.updateMany({
        where: { organizationId },
        data: { status: 'cancelled', plan: SubscriptionPlan.FREE },
      });
    }

    return { received: true };
  }

  private verifyLemonSignature(rawBody: Buffer, signature: string, secret: string): boolean {
    const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
    return digest === signature;
  }

  private async activateSubscription(
    organizationId: string,
    plan: SubscriptionPlan,
    data: {
      paymentProvider: PaymentProvider;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      lemonSqueezyCustomerId?: string;
      lemonSqueezySubscriptionId?: string;
    },
  ) {
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { plan },
    });
    await this.prisma.subscription.updateMany({
      where: { organizationId },
      data: {
        plan,
        status: 'active',
        paymentProvider: data.paymentProvider,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        lemonSqueezyCustomerId: data.lemonSqueezyCustomerId,
        lemonSqueezySubscriptionId: data.lemonSqueezySubscriptionId,
      },
    });
  }

  private stripePriceForPlan(plan: SubscriptionPlan): string | undefined {
    const map: Record<string, string | undefined> = {
      PRO: this.config.get('STRIPE_PRICE_PRO'),
      BUSINESS: this.config.get('STRIPE_PRICE_BUSINESS'),
    };
    return map[plan];
  }

  private lemonVariantForPlan(plan: SubscriptionPlan): string | undefined {
    const map: Record<string, string | undefined> = {
      PRO: this.config.get('LEMONSQUEEZY_VARIANT_PRO'),
      BUSINESS: this.config.get('LEMONSQUEEZY_VARIANT_BUSINESS'),
    };
    return map[plan];
  }

  private jobItemsToLines(
    items: Array<{ description: string; quantity: Decimal | number; unitPrice: Decimal | number }>,
  ) {
    return items.map((item) => ({
      description: item.description,
      quantity: decimalToNumber(item.quantity),
      unitPrice: decimalToNumber(item.unitPrice),
    }));
  }

  private async recalculateQuoteTotal(organizationId: string, quoteId: string) {
    const lines = await this.prisma.quoteLine.findMany({ where: { quoteId, organizationId } });
    const total = lines.reduce(
      (sum, l) => sum + decimalToNumber(l.quantity) * decimalToNumber(l.unitPrice),
      0,
    );
    await this.prisma.quote.update({ where: { id: quoteId }, data: { totalAmount: total } });
  }

  private async recalculateInvoiceTotal(organizationId: string, invoiceId: string) {
    const lines = await this.prisma.invoiceLine.findMany({ where: { invoiceId, organizationId } });
    const total = lines.reduce(
      (sum, l) => sum + decimalToNumber(l.quantity) * decimalToNumber(l.unitPrice),
      0,
    );
    await this.prisma.invoice.update({ where: { id: invoiceId }, data: { totalAmount: total } });
  }

  private async ensureQuote(organizationId: string, quoteId: string) {
    const quote = await this.prisma.quote.findFirst({ where: { id: quoteId, organizationId } });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  private async ensureInvoice(organizationId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, organizationId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
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
