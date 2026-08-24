import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import {
  CreateCheckoutDto,
  CreateInvoiceFromJobDto,
  CreateQuoteFromJobDto,
} from './dto/billing.dto';
import { CurrentUser, AuthUserPayload, Public } from '../common/decorators/auth.decorator';

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

  @Post('quotes/from-job')
  createQuoteFromJob(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateQuoteFromJobDto) {
    return this.billingService.createQuoteFromJob(user.organizationId, dto);
  }

  @Post('invoices/from-job')
  createInvoiceFromJob(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateInvoiceFromJobDto) {
    return this.billingService.createInvoiceFromJob(user.organizationId, dto);
  }

  @Post('stripe/checkout')
  createCheckout(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckoutSession(user.organizationId, dto);
  }

  @Public()
  @Post('stripe/webhook')
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const rawBody = req.rawBody ?? Buffer.from('');
    return this.billingService.handleStripeWebhook(rawBody, signature);
  }
}
