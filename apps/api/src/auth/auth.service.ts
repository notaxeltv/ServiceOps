import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MembershipRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/economics.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SwitchOrganizationDto } from './dto/switch-organization.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const baseSlug = dto.organizationSlug ?? slugify(dto.organizationName);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
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
          userId: user.id,
          organizationId: organization.id,
          role: MembershipRole.OWNER,
        },
      });

      await tx.subscription.create({
        data: { organizationId: organization.id, plan: 'FREE', status: 'active' },
      });

      return { user, organization };
    });

    return this.buildAuthResponse(result.user, result.organization.id, MembershipRole.OWNER);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership) {
      throw new UnauthorizedException('No organization membership found');
    }

    return this.buildAuthResponse(user, membership.organizationId, membership.role);
  }

  async switchOrganization(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organizationId },
    });
    if (!membership) {
      throw new UnauthorizedException('Not a member of this organization');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    return this.buildAuthResponse(user, organizationId, membership.role);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        memberships: {
          select: {
            role: true,
            organization: { select: { id: true, name: true, slug: true, plan: true, settings: true } },
          },
        },
      },
    });

    return user;
  }

  private async buildAuthResponse(
    user: { id: string; email: string; firstName: string; lastName: string },
    organizationId: string,
    role: MembershipRole,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, slug: true, plan: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      organizationId,
      role,
    };

    const accessToken = this.jwt.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId,
        organizationName: organization?.name ?? '',
        role,
      },
    };
  }
}
