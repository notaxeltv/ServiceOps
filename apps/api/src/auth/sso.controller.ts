import { Controller, Get, Post, Patch, Body, Param, Query, Res, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { SsoService } from './sso.service';
import { UpdateSsoConfigDto } from './dto/sso.dto';
import { Public, CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('auth/sso')
export class SsoController {
  constructor(private readonly ssoService: SsoService) {}

  @Public()
  @Get('config/:slug')
  getPublicConfig(@Param('slug') slug: string) {
    return this.ssoService.getPublicConfigBySlug(slug);
  }

  @Public()
  @Get('oidc/:slug')
  async oidcLogin(@Param('slug') slug: string, @Res() res: Response) {
    const url = await this.ssoService.initiateOidcLogin(slug);
    return res.redirect(url);
  }

  @Public()
  @Get('oidc/callback')
  async oidcCallback(@Query() query: Record<string, string>, @Res() res: Response) {
    const { accessToken } = await this.ssoService.handleOidcCallback(query);
    const frontend = process.env.FRONTEND_SSO_CALLBACK_URL ?? 'http://localhost:3000/auth/callback';
    return res.redirect(`${frontend}?token=${encodeURIComponent(accessToken)}`);
  }

  @Public()
  @Get('saml/:slug')
  async samlLogin(@Param('slug') slug: string, @Res() res: Response) {
    const url = await this.ssoService.initiateSamlLogin(slug);
    return res.redirect(url);
  }

  @Public()
  @Get('saml/:slug/metadata')
  async samlMetadata(@Param('slug') slug: string) {
    const xml = await this.ssoService.getSamlMetadata(slug);
    return xml;
  }

  @Public()
  @Post('saml/callback')
  async samlCallback(@Body() body: Record<string, string>, @Res() res: Response) {
    const { accessToken } = await this.ssoService.handleSamlCallback(body);
    const frontend = process.env.FRONTEND_SSO_CALLBACK_URL ?? 'http://localhost:3000/auth/callback';
    return res.redirect(`${frontend}?token=${encodeURIComponent(accessToken)}`);
  }

  @Get('config')
  getConfig(@CurrentUser() user: AuthUserPayload) {
    return this.ssoService.getConfig(user.organizationId);
  }

  @Patch('config')
  updateConfig(@CurrentUser() user: AuthUserPayload, @Body() dto: UpdateSsoConfigDto) {
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only OWNER or ADMIN can configure SSO');
    }
    return this.ssoService.updateConfig(user.organizationId, dto);
  }
}
