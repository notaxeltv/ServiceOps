import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeJobEconomics } from '../common/utils/economics.util';
import { CreateJobDto, CreateJobItemDto, UpdateJobDto } from './dto/jobs.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string, status?: JobStatus, customerId?: string) {
    return this.prisma.job.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(organizationId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        site: true,
        items: true,
        activities: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        materialUsages: { include: { material: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');

    const economics = computeJobEconomics({
      items: job.items,
      activities: job.activities,
      materialUsages: job.materialUsages,
    });

    return { ...job, economics };
  }

  create(organizationId: string, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        organizationId,
        customerId: dto.customerId,
        siteId: dto.siteId,
        title: dto.title,
        reference: dto.reference,
        description: dto.description,
        tags: dto.tags ?? [],
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { customer: { select: { id: true, name: true } } },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateJobDto) {
    await this.ensureJob(organizationId, id);
    return this.prisma.job.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      },
    });
  }

  async addItem(organizationId: string, jobId: string, dto: CreateJobItemDto) {
    await this.ensureJob(organizationId, jobId);
    return this.prisma.jobItem.create({
      data: {
        organizationId,
        jobId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        type: dto.type,
      },
    });
  }

  private async ensureJob(organizationId: string, id: string) {
    const job = await this.prisma.job.findFirst({ where: { id, organizationId } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
