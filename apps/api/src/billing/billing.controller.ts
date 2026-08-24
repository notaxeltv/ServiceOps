import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentProvider } from '@prisma/client';
import { BillingService } from './billing.service';
import {
  CreateCheckoutDto,
  CreateDocumentLineDto,
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

  @Get('quotes/:id')
  getQuote(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.billingService.getQuote(user.organizationId, id);
  }

  @Get('invoices')
  listInvoices(@CurrentUser() user: AuthUserPayload) {
    return this.billingService.listInvoices(user.organizationId);
  }

  @Get('invoices/:id')
  getInvoice(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.billingService.getInvoice(user.organizationId, id);
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

  @Post('quotes/:id/lines')
  addQuoteLine(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateDocumentLineDto,
  ) {
    return this.billingService.addQuoteLine(user.organizationId, id, dto);
  }

  @Post('invoices/:id/lines')
  addInvoiceLine(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateDocumentLineDto,
  ) {
    return this.billingService.addInvoiceLine(user.organizationId, id, dto);
  }

  @Post('checkout')
  createCheckout(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckoutSession(user.organizationId, dto);
  }

  @Post('stripe/checkout')
  createStripeCheckout(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckoutSession(user.organizationId, {
      plan: dto.plan,
      provider: PaymentProvider.STRIPE,
    });
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

  @Public()
  @Post('lemonsqueezy/webhook')
  lemonWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string | undefined,
  ) {
    const rawBody = req.rawBody ?? Buffer.from('');
    return this.billingService.handleLemonWebhook(rawBody, signature);
  }
}
