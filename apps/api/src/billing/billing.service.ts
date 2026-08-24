import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Billing skeleton — TODO: integrate Stripe/Lemon Squeezy webhooks */
@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

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
}
