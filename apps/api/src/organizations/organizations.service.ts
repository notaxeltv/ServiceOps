import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/economics.util';
import { CreateOrganizationDto } from './dto/organizations.dto';

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

  async createForUser(userId: string, dto: CreateOrganizationDto) {
    const slug = `${slugify(dto.name)}-${Date.now().toString(36)}`;

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name,
          slug,
          settings: {
            currency: 'EUR',
            timezone: 'Europe/Rome',
            dateFormat: 'DD/MM/YYYY',
            features: { inventory: true, billing: true },
          },
        },
      });

      await tx.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role: MembershipRole.OWNER,
        },
      });

      await tx.subscription.create({
        data: { organizationId: organization.id, plan: 'FREE', status: 'active' },
      });

      return organization;
    });
  }
}
