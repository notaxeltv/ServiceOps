import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { PaymentProvider, SubscriptionPlan } from '@prisma/client';

export class CreateQuoteFromJobDto {
  @IsString() @MinLength(1) jobId!: string;
  @IsOptional() @IsString() validUntil?: string;
}

export class CreateInvoiceFromJobDto {
  @IsString() @MinLength(1) jobId!: string;
  @IsOptional() @IsString() dueAt?: string;
}

export class CreateCheckoutDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}

export class CreateDocumentLineDto {
  @IsString() @MinLength(1) description!: string;
  @IsNumber() quantity!: number;
  @IsNumber() unitPrice!: number;
}
