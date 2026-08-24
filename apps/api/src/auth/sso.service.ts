import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Issuer, generators } from 'openid-client';
import { SAML, ValidateInResponseTo } from '@node-saml/node-saml';
import { MembershipRole, SsoProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSsoConfigDto } from './dto/sso.dto';

interface PendingOidcLogin {
  codeVerifier: string;
  organizationId: string;
  expiresAt: number;
}

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);
  private readonly pendingOidc = new Map<string, PendingOidcLogin>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async getPublicConfigBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: { ssoConfig: true },
    });
    if (!org?.ssoConfig?.enabled) return null;
    return {
      organizationId: org.id,
      organizationName: org.name,
      slug: org.slug,
      provider: org.ssoConfig.provider,
    };
  }

  async updateConfig(organizationId: string, dto: UpdateSsoConfigDto) {
    return this.prisma.organizationSsoConfig.upsert({
      where: { organizationId },
      create: {
        organizationId,
        provider: dto.provider,
        enabled: dto.enabled,
        issuer: dto.issuer,
        clientId: dto.clientId,
        clientSecret: dto.clientSecret,
        metadataUrl: dto.metadataUrl,
        idpCert: dto.idpCert,
        emailAttribute: dto.emailAttribute ?? 'email',
      },
      update: {
        provider: dto.provider,
        enabled: dto.enabled,
        issuer: dto.issuer,
        clientId: dto.clientId,
        clientSecret: dto.clientSecret,
        metadataUrl: dto.metadataUrl,
        idpCert: dto.idpCert,
        emailAttribute: dto.emailAttribute ?? 'email',
      },
    });
  }

  async getConfig(organizationId: string) {
    return this.prisma.organizationSsoConfig.findUnique({ where: { organizationId } });
  }

  async initiateOidcLogin(orgSlug: string): Promise<string> {
    const org = await this.getOrgWithSso(orgSlug, SsoProvider.OIDC);
    const cfg = org.ssoConfig!;
    if (!cfg.clientId) throw new BadRequestException('OIDC clientId not configured');

    const issuer = await Issuer.discover(cfg.issuer);
    const client = new issuer.Client({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret ?? undefined,
      redirect_uris: [this.oidcCallbackUrl()],
      response_types: ['code'],
    });

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const state = generators.state();

    this.pendingOidc.set(state, {
      codeVerifier,
      organizationId: org.id,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return client.authorizationUrl({
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
  }

  async handleOidcCallback(query: Record<string, string>): Promise<{ accessToken: string }> {
    const state = query.state;
    if (!state) throw new BadRequestException('Missing state');
    const pending = this.pendingOidc.get(state);
    if (!pending || pending.expiresAt < Date.now()) {
      throw new BadRequestException('Invalid or expired SSO session');
    }
    this.pendingOidc.delete(state);

    const cfg = await this.prisma.organizationSsoConfig.findUnique({
      where: { organizationId: pending.organizationId },
    });
    if (!cfg?.enabled || cfg.provider !== SsoProvider.OIDC) {
      throw new BadRequestException('SSO not configured');
    }

    const issuer = await Issuer.discover(cfg.issuer);
    const client = new issuer.Client({
      client_id: cfg.clientId!,
      client_secret: cfg.clientSecret ?? undefined,
      redirect_uris: [this.oidcCallbackUrl()],
    });

    const params = client.callbackParams(
      `${this.oidcCallbackUrl()}?${new URLSearchParams(query).toString()}`,
    );
    const tokenSet = await client.callback(this.oidcCallbackUrl(), params, {
      state,
      code_verifier: pending.codeVerifier,
    });

    const claims = tokenSet.claims();
    const emailAttr = cfg.emailAttribute ?? 'email';
    const email = (claims[emailAttr] as string) ?? claims.email;
    const externalId = claims.sub;
    if (!email || !externalId) {
      throw new BadRequestException('IdP did not return required claims (email/sub)');
    }

    return this.loginOrProvisionSsoUser({
      organizationId: pending.organizationId,
      provider: SsoProvider.OIDC,
      externalId,
      email,
      firstName: (claims.given_name as string) ?? email.split('@')[0] ?? 'User',
      lastName: (claims.family_name as string) ?? '',
    });
  }

  async getSamlMetadata(orgSlug: string): Promise<string> {
    const org = await this.getOrgWithSso(orgSlug, SsoProvider.SAML);
    const saml = this.buildSamlInstance(org.slug, org.ssoConfig);
    return saml.generateServiceProviderMetadata(null);
  }

  async initiateSamlLogin(orgSlug: string): Promise<string> {
    const org = await this.getOrgWithSso(orgSlug, SsoProvider.SAML);
    const saml = this.buildSamlInstance(org.slug, org.ssoConfig);
    return await saml.getAuthorizeUrlAsync(orgSlug, undefined, {});
  }

  async handleSamlCallback(body: Record<string, string>): Promise<{ accessToken: string }> {
    const orgSlug = body.RelayState;
    if (!orgSlug) throw new BadRequestException('Missing RelayState (org slug)');

    const org = await this.getOrgWithSso(orgSlug, SsoProvider.SAML);
    const saml = this.buildSamlInstance(org.slug, org.ssoConfig);
    const { profile } = await saml.validatePostResponseAsync(body);

    const email = profile?.email ?? profile?.nameID;
    const externalId = profile?.nameID;
    if (!email || !externalId) {
      throw new BadRequestException('SAML response missing email/nameID');
    }

    return this.loginOrProvisionSsoUser({
      organizationId: org.id,
      provider: SsoProvider.SAML,
      externalId,
      email: String(email),
      firstName: String(profile?.givenName ?? email.split('@')[0] ?? 'User'),
      lastName: String(profile?.familyName ?? ''),
    });
  }

  private async loginOrProvisionSsoUser(params: {
    organizationId: string;
    provider: SsoProvider;
    externalId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<{ accessToken: string }> {
    let external = await this.prisma.externalIdentity.findUnique({
      where: {
        provider_externalId_organizationId: {
          provider: params.provider,
          externalId: params.externalId,
          organizationId: params.organizationId,
        },
      },
      include: { user: true },
    });

    let user = external?.user;

    if (!user) {
      const existing = await this.prisma.user.findUnique({ where: { email: params.email } });
      if (existing) {
        user = existing;
      } else {
        user = await this.prisma.user.create({
          data: {
            email: params.email,
            passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12),
            firstName: params.firstName,
            lastName: params.lastName,
          },
        });
      }

      await this.prisma.externalIdentity.upsert({
        where: {
          provider_externalId_organizationId: {
            provider: params.provider,
            externalId: params.externalId,
            organizationId: params.organizationId,
          },
        },
        create: {
          userId: user.id,
          organizationId: params.organizationId,
          provider: params.provider,
          externalId: params.externalId,
          email: params.email,
        },
        update: { email: params.email },
      });
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id, organizationId: params.organizationId },
    });

    if (!membership) {
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: params.organizationId,
          role: MembershipRole.MEMBER,
        },
      });
    }

    const role = membership?.role ?? MembershipRole.MEMBER;
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: params.organizationId,
      role,
    };

    return { accessToken: this.jwt.sign(payload) };
  }

  private async getOrgWithSso(slug: string, provider: SsoProvider) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: { ssoConfig: true },
    });
    if (!org?.ssoConfig?.enabled || org.ssoConfig.provider !== provider) {
      throw new NotFoundException('SSO not enabled for this organization');
    }
    return { id: org.id, slug: org.slug, ssoConfig: org.ssoConfig };
  }

  private buildSamlInstance(
    orgSlug: string,
    cfg: {
      issuer: string;
      metadataUrl: string | null;
      idpCert: string | null;
    },
  ) {
    const entryPoint = cfg.metadataUrl ?? cfg.issuer;
    if (!entryPoint) {
      throw new ServiceUnavailableException('SAML entry point not configured');
    }

    const idpCert = cfg.idpCert ?? this.config.get<string>('SAML_IDP_CERT');
    if (!idpCert) {
      throw new ServiceUnavailableException('SAML IdP certificate not configured');
    }

    return new SAML({
      issuer: this.config.get('SAML_ISSUER', 'serviceops'),
      callbackUrl: this.samlCallbackUrl(),
      entryPoint,
      idpIssuer: cfg.issuer,
      idpCert,
      wantAssertionsSigned: false,
      validateInResponseTo: ValidateInResponseTo.never,
    });
  }

  private oidcCallbackUrl(): string {
    return this.config.get('OIDC_CALLBACK_URL', 'http://localhost:3001/auth/sso/oidc/callback');
  }

  private samlCallbackUrl(): string {
    return this.config.get('SAML_CALLBACK_URL', 'http://localhost:3001/auth/sso/saml/callback');
  }
}
