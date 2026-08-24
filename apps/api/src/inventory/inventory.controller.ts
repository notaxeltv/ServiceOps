import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryMovementDto, CreateMaterialDto } from './dto/inventory.dto';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('materials')
  listMaterials(@CurrentUser() user: AuthUserPayload) {
    return this.inventoryService.listMaterials(user.organizationId);
  }

  @Post('materials')
  createMaterial(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateMaterialDto) {
    return this.inventoryService.createMaterial(user.organizationId, dto);
  }

  @Get('movements')
  listMovements(
    @CurrentUser() user: AuthUserPayload,
    @Query('materialId') materialId?: string,
  ) {
    return this.inventoryService.listMovements(user.organizationId, materialId);
  }

  @Post('movements')
  createMovement(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(user.organizationId, dto);
  }
}
