import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { JobItemType, JobStatus } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @MinLength(1)
  customerId!: string;

  @IsOptional() @IsString() siteId?: string;
  @IsString() @MinLength(1) title!: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateJobDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() completedAt?: string;
}

export class CreateJobItemDto {
  @IsString() @MinLength(1) description!: string;
  @IsNumber() quantity!: number;
  @IsNumber() unitPrice!: number;
  @IsOptional() @IsEnum(JobItemType) type?: JobItemType;
}
