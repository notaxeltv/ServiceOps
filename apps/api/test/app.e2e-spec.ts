import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ServiceOps E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers organization and user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Mario',
        lastName: 'Rossi',
        organizationName: 'Officina Test',
      })
      .expect(201);

    token = res.body.accessToken;
    expect(token).toBeDefined();
  });

  it('creates customer, job, activity and reads margins', async () => {
    const customerRes = await request(app.getHttpServer())
      .post('/crm/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Demo' })
      .expect(201);

    const jobRes = await request(app.getHttpServer())
      .post('/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Riparazione impianto', customerId: customerRes.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/jobs/${jobRes.body.id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Intervento', quantity: 1, unitPrice: 500 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        jobId: jobRes.body.id,
        date: new Date().toISOString(),
        hours: 2,
        hourlyCost: 30,
      })
      .expect(201);

    const jobDetail = await request(app.getHttpServer())
      .get(`/jobs/${jobRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(jobDetail.body.economics.revenue).toBe(500);
    expect(jobDetail.body.economics.laborCost).toBe(60);
    expect(jobDetail.body.economics.margin).toBe(440);

    const dashboard = await request(app.getHttpServer())
      .get('/reports/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(dashboard.body.totalRevenue).toBeGreaterThan(0);
  });
});
