import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

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
}
