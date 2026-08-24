import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, CreateMaterialUsageDto } from './dto/activities.dto';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  list(@CurrentUser() user: AuthUserPayload, @Query('jobId') jobId?: string) {
    return this.activitiesService.list(user.organizationId, jobId);
  }

  @Post()
  createActivity(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateActivityDto) {
    return this.activitiesService.createActivity(user.organizationId, dto);
  }

  @Get('material-usages')
  listMaterialUsages(@CurrentUser() user: AuthUserPayload, @Query('jobId') jobId?: string) {
    return this.activitiesService.listMaterialUsages(user.organizationId, jobId);
  }

  @Post('material-usages')
  createMaterialUsage(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateMaterialUsageDto) {
    return this.activitiesService.createMaterialUsage(user.organizationId, dto);
  }
}
