import { IsNumber, IsOptional, IsString, MinLength, IsDateString } from 'class-validator';

export class CreateActivityDto {
  @IsString() @MinLength(1) jobId!: string;
  @IsDateString() date!: string;
  @IsNumber() hours!: number;
  @IsNumber() hourlyCost!: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() userId?: string;
}

export class CreateMaterialUsageDto {
  @IsString() @MinLength(1) jobId!: string;
  @IsString() @MinLength(1) materialId!: string;
  @IsNumber() quantity!: number;
  @IsNumber() unitCost!: number;
  @IsOptional() @IsString() notes?: string;
}
