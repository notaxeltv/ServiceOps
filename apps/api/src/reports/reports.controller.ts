import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthUserPayload) {
    return this.reportsService.dashboardKpis(user.organizationId);
  }

  @Get('jobs/margins')
  jobMargins(@CurrentUser() user: AuthUserPayload) {
    return this.reportsService.jobMargins(user.organizationId);
  }

  @Get('customers/:customerId')
  customerReport(@CurrentUser() user: AuthUserPayload, @Param('customerId') customerId: string) {
    return this.reportsService.customerReport(user.organizationId, customerId);
  }

  @Get('jobs/export/csv')
  @Header('Content-Type', 'text/csv')
  async exportCsv(@CurrentUser() user: AuthUserPayload, @Res() res: Response) {
    const csv = await this.reportsService.exportJobsCsv(user.organizationId);
    res.setHeader('Content-Disposition', 'attachment; filename="jobs-margins.csv"');
    res.send(csv);
  }

  @Get('jobs/:jobId/pdf')
  async exportPdf(
    @CurrentUser() user: AuthUserPayload,
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.exportJobPdf(user.organizationId, jobId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="job-${jobId}.pdf"`);
    res.send(pdf);
  }
}
