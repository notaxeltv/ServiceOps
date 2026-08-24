import { Injectable } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../prisma/prisma.service';
import { computeJobEconomics, decimalToNumber } from '../common/utils/economics.util';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboardKpis(organizationId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { organizationId },
      include: { items: true, activities: true, materialUsages: true },
    });

    let totalRevenue = 0;
    let totalMargin = 0;
    const openStatuses: JobStatus[] = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS'];
    let openJobs = 0;
    let overdueJobs = 0;
    const now = new Date();

    for (const job of jobs) {
      const econ = computeJobEconomics({
        items: job.items,
        activities: job.activities,
        materialUsages: job.materialUsages,
      });
      totalRevenue += econ.revenue;
      totalMargin += econ.margin;
      if (openStatuses.includes(job.status)) openJobs += 1;
      if (job.dueDate && job.dueDate < now && openStatuses.includes(job.status)) overdueJobs += 1;
    }

    const customerCount = await this.prisma.customer.count({ where: { organizationId } });

    return {
      totalRevenue,
      totalMargin,
      averageMarginPercent: totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0,
      jobCount: jobs.length,
      openJobs,
      overdueJobs,
      customerCount,
    };
  }

  async jobMargins(organizationId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { organizationId },
      include: {
        customer: { select: { id: true, name: true } },
        items: true,
        activities: true,
        materialUsages: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return jobs.map((job) => {
      const economics = computeJobEconomics({
        items: job.items,
        activities: job.activities,
        materialUsages: job.materialUsages,
      });
      return {
        jobId: job.id,
        title: job.title,
        status: job.status,
        customerName: job.customer.name,
        ...economics,
      };
    });
  }

  async customerReport(organizationId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: {
        jobs: {
          include: { items: true, activities: true, materialUsages: true },
        },
      },
    });
    if (!customer) return null;

    const jobs = customer.jobs.map((job) => {
      const economics = computeJobEconomics({
        items: job.items,
        activities: job.activities,
        materialUsages: job.materialUsages,
      });
      return { id: job.id, title: job.title, status: job.status, ...economics };
    });

    const totalRevenue = jobs.reduce((s, j) => s + j.revenue, 0);
    const totalMargin = jobs.reduce((s, j) => s + j.margin, 0);

    return {
      customer: { id: customer.id, name: customer.name },
      jobs,
      totalRevenue,
      totalMargin,
    };
  }

  async exportJobsCsv(organizationId: string): Promise<string> {
    const margins = await this.jobMargins(organizationId);
    return stringify(margins, { header: true });
  }

  async exportJobPdf(organizationId: string, jobId: string): Promise<Buffer> {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, organizationId },
      include: {
        customer: true,
        items: true,
        activities: true,
        materialUsages: { include: { material: true } },
      },
    });
    if (!job) throw new Error('Job not found');

    const economics = computeJobEconomics({
      items: job.items,
      activities: job.activities,
      materialUsages: job.materialUsages,
    });

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(18).text('ServiceOps — Report Commessa', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Commessa: ${job.title}`);
    doc.text(`Cliente: ${job.customer.name}`);
    doc.text(`Stato: ${job.status}`);
    doc.moveDown();
    doc.text(`Ricavi: €${economics.revenue.toFixed(2)}`);
    doc.text(`Costo ore: €${economics.laborCost.toFixed(2)}`);
    doc.text(`Costo materiali: €${economics.materialCost.toFixed(2)}`);
    doc.text(`Margine: €${economics.margin.toFixed(2)} (${economics.marginPercent.toFixed(1)}%)`);
    doc.moveDown();
    doc.text('Voci:');
    for (const item of job.items) {
      doc.text(
        `- ${item.description}: ${decimalToNumber(item.quantity)} x €${decimalToNumber(item.unitPrice)}`,
      );
    }
    doc.end();

    await new Promise<void>((resolve) => doc.on('end', resolve));
    return Buffer.concat(chunks);
  }
}
