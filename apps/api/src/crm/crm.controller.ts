import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateCustomerDto, CreateSiteDto, CreateContactDto, UpdateContactDto } from './dto/crm.dto';
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

  @Get('customers/:customerId/contacts')
  listContacts(@CurrentUser() user: AuthUserPayload, @Param('customerId') customerId: string) {
    return this.crmService.listContacts(user.organizationId, customerId);
  }

  @Post('customers/:customerId/contacts')
  createContact(
    @CurrentUser() user: AuthUserPayload,
    @Param('customerId') customerId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.crmService.createContact(user.organizationId, customerId, dto);
  }

  @Patch('customers/:customerId/contacts/:contactId')
  updateContact(
    @CurrentUser() user: AuthUserPayload,
    @Param('customerId') customerId: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.crmService.updateContact(user.organizationId, customerId, contactId, dto);
  }

  @Delete('customers/:customerId/contacts/:contactId')
  deleteContact(
    @CurrentUser() user: AuthUserPayload,
    @Param('customerId') customerId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.crmService.deleteContact(user.organizationId, customerId, contactId);
  }
}
