import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { JobsService } from './jobs.service';
import { CreateJobDto, CreateJobItemDto, UpdateJobDto } from './dto/jobs.dto';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUserPayload,
    @Query('status') status?: JobStatus,
    @Query('customerId') customerId?: string,
  ) {
    return this.jobsService.list(user.organizationId, status, customerId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.jobsService.getById(user.organizationId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(user.organizationId, id, dto);
  }

  @Post(':id/items')
  addItem(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateJobItemDto,
  ) {
    return this.jobsService.addItem(user.organizationId, id, dto);
  }
}
