import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, CreateMaterialUsageDto } from './dto/activities.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string, jobId?: string) {
    return this.prisma.activity.findMany({
      where: { organizationId, ...(jobId ? { jobId } : {}) },
      include: {
        job: { select: { id: true, title: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createActivity(organizationId: string, dto: CreateActivityDto) {
    await this.ensureJob(organizationId, dto.jobId);
    return this.prisma.activity.create({
      data: {
        organizationId,
        jobId: dto.jobId,
        userId: dto.userId,
        date: new Date(dto.date),
        hours: dto.hours,
        hourlyCost: dto.hourlyCost,
        description: dto.description,
      },
    });
  }

  async createMaterialUsage(organizationId: string, dto: CreateMaterialUsageDto) {
    await this.ensureJob(organizationId, dto.jobId);
    const material = await this.prisma.material.findFirst({
      where: { id: dto.materialId, organizationId },
    });
    if (!material) throw new NotFoundException('Material not found');

    const usage = await this.prisma.$transaction(async (tx) => {
      const created = await tx.materialUsage.create({
        data: {
          organizationId,
          jobId: dto.jobId,
          materialId: dto.materialId,
          quantity: dto.quantity,
          unitCost: dto.unitCost,
          notes: dto.notes,
        },
        include: { material: true },
      });

      await tx.material.update({
        where: { id: dto.materialId },
        data: { stockQuantity: { decrement: dto.quantity } },
      });

      await tx.inventoryMovement.create({
        data: {
          organizationId,
          materialId: dto.materialId,
          jobId: dto.jobId,
          type: 'OUT',
          quantity: dto.quantity,
          notes: `Usage on job ${dto.jobId}`,
        },
      });

      return created;
    });

    return usage;
  }

  listMaterialUsages(organizationId: string, jobId?: string) {
    return this.prisma.materialUsage.findMany({
      where: { organizationId, ...(jobId ? { jobId } : {}) },
      include: { material: true, job: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureJob(organizationId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, organizationId } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
