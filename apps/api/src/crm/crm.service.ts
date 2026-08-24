import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, CreateSiteDto, CreateContactDto, UpdateContactDto } from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  listCustomers(organizationId: string) {
    return this.prisma.customer.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      include: { sites: true, _count: { select: { jobs: true } } },
    });
  }

  async getCustomer(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        contacts: true,
        sites: true,
        jobs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  createCustomer(organizationId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { ...dto, organizationId },
    });
  }

  async updateCustomer(organizationId: string, id: string, dto: Partial<CreateCustomerDto>) {
    await this.ensureCustomer(organizationId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async createSite(organizationId: string, customerId: string, dto: CreateSiteDto) {
    await this.ensureCustomer(organizationId, customerId);
    return this.prisma.site.create({
      data: { ...dto, organizationId, customerId },
    });
  }

  listSites(organizationId: string, customerId?: string) {
    return this.prisma.site.findMany({
      where: { organizationId, ...(customerId ? { customerId } : {}) },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  listContacts(organizationId: string, customerId: string) {
    return this.prisma.contact.findMany({
      where: { organizationId, customerId },
      orderBy: { name: 'asc' },
    });
  }

  async createContact(organizationId: string, customerId: string, dto: CreateContactDto) {
    await this.ensureCustomer(organizationId, customerId);
    return this.prisma.contact.create({
      data: { ...dto, organizationId, customerId },
    });
  }

  async updateContact(
    organizationId: string,
    customerId: string,
    contactId: string,
    dto: UpdateContactDto,
  ) {
    await this.ensureContact(organizationId, customerId, contactId);
    return this.prisma.contact.update({ where: { id: contactId }, data: dto });
  }

  async deleteContact(organizationId: string, customerId: string, contactId: string) {
    await this.ensureContact(organizationId, customerId, contactId);
    return this.prisma.contact.delete({ where: { id: contactId } });
  }

  private async ensureContact(organizationId: string, customerId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, organizationId, customerId },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  private async ensureCustomer(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id, organizationId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
