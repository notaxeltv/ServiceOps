import { Controller, Get, Patch, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthUserPayload) {
    return this.organizationsService.getById(user.organizationId);
  }

  @Patch('current/settings')
  updateSettings(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return this.organizationsService.updateSettings(user.organizationId, body);
  }
}
