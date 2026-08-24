import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryMovementDto, CreateMaterialDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  listMaterials(organizationId: string) {
    return this.prisma.material.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  createMaterial(organizationId: string, dto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: {
        organizationId,
        name: dto.name,
        code: dto.code,
        unit: dto.unit ?? 'pz',
        minStock: dto.minStock,
        averageCost: dto.averageCost ?? 0,
        stockQuantity: dto.stockQuantity ?? 0,
      },
    });
  }

  listMovements(organizationId: string, materialId?: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { organizationId, ...(materialId ? { materialId } : {}) },
      include: { material: true, job: { select: { id: true, title: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async createMovement(organizationId: string, dto: CreateInventoryMovementDto) {
    const material = await this.prisma.material.findFirst({
      where: { id: dto.materialId, organizationId },
    });
    if (!material) throw new NotFoundException('Material not found');

    const delta = dto.type === 'IN' ? dto.quantity : -dto.quantity;

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          organizationId,
          materialId: dto.materialId,
          jobId: dto.jobId,
          type: dto.type,
          quantity: dto.quantity,
          notes: dto.notes,
        },
      });

      await tx.material.update({
        where: { id: dto.materialId },
        data: { stockQuantity: { increment: delta } },
      });

      return movement;
    });
  }
}
