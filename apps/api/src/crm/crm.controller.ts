import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateCustomerDto, CreateSiteDto } from './dto/crm.dto';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('customers')
  listCustomers(@CurrentUser() user: AuthUserPayload) {
    return this.crmService.listCustomers(user.organizationId);
  }

  @Get('customers/:id')
  getCustomer(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.crmService.getCustomer(user.organizationId, id);
  }

  @Post('customers')
  createCustomer(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateCustomerDto) {
    return this.crmService.createCustomer(user.organizationId, dto);
  }

  @Patch('customers/:id')
  updateCustomer(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    return this.crmService.updateCustomer(user.organizationId, id, dto);
  }

  @Get('sites')
  listSites(@CurrentUser() user: AuthUserPayload, @Query('customerId') customerId?: string) {
    return this.crmService.listSites(user.organizationId, customerId);
  }

  @Post('customers/:customerId/sites')
  createSite(
    @CurrentUser() user: AuthUserPayload,
    @Param('customerId') customerId: string,
    @Body() dto: CreateSiteDto,
  ) {
    return this.crmService.createSite(user.organizationId, customerId, dto);
  }
}
