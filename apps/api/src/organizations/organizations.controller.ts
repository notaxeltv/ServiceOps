import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/organizations.dto';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthUserPayload) {
    return this.organizationsService.getById(user.organizationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.createForUser(user.userId, dto);
  }

  @Patch('current/settings')
  updateSettings(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return this.organizationsService.updateSettings(user.organizationId, body);
  }
}
