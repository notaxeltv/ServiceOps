import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('quotes')
  listQuotes(@CurrentUser() user: AuthUserPayload) {
    return this.billingService.listQuotes(user.organizationId);
  }

  @Get('invoices')
  listInvoices(@CurrentUser() user: AuthUserPayload) {
    return this.billingService.listInvoices(user.organizationId);
  }

  @Get('subscription')
  getSubscription(@CurrentUser() user: AuthUserPayload) {
    return this.billingService.getSubscription(user.organizationId);
  }
}
