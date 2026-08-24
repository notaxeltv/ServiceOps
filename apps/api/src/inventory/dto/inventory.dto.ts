import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { InventoryMovementType } from '@prisma/client';

export class CreateMaterialDto {
  @IsString() @MinLength(1) name!: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() minStock?: number;
  @IsOptional() @IsNumber() averageCost?: number;
  @IsOptional() @IsNumber() stockQuantity?: number;
}

export class CreateInventoryMovementDto {
  @IsString() @MinLength(1) materialId!: string;
  @IsEnum(InventoryMovementType) type!: InventoryMovementType;
  @IsNumber() quantity!: number;
  @IsOptional() @IsString() jobId?: string;
  @IsOptional() @IsString() notes?: string;
}
