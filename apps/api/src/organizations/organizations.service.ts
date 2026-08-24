import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateSettings(organizationId: string, settings: Record<string, unknown>) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    const merged = { ...(org.settings as Record<string, unknown>), ...settings };
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { settings: merged as Prisma.InputJsonValue },
    });
  }
}
