import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ORDER_REPOSITORY } from '../../domain/ports/order.repository';
import { PrismaOrderRepository } from '../prisma-order.repository';
import { CreateOrderUseCase } from '../../application/create-order.use-case';
import { GetOrderUseCase } from '../../application/get-order.use-case';
import { ListOrdersUseCase } from '../../application/list-orders.use-case';
import { TransitionOrderUseCase } from '../../application/transition-order.use-case';
import { OrderStatsQuery } from '../../application/order-stats.query';
import { OrderEventHandlers } from '../event-handlers/order-event.handlers';
import { OrderController } from './order.controller';

describe('OrderController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let customerId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [OrderController],
      providers: [
        {
          provide: PrismaService,
          useFactory: () => new PrismaService(process.env.DATABASE_URL),
        },
        {
          provide: ORDER_REPOSITORY,
          useClass: PrismaOrderRepository,
        },
        CreateOrderUseCase,
        GetOrderUseCase,
        ListOrdersUseCase,
        TransitionOrderUseCase,
        OrderStatsQuery,
        OrderEventHandlers,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = module.get(PrismaService);
    await prisma.$connect();

    const customer = await prisma.customer.create({
      data: {
        name: 'Integration Test Customer',
        email: `integration-ctrl-${Date.now()}@test.com`,
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.lineItem.deleteMany();
    await prisma.order.deleteMany();
  });

  function validOrderBody(id: string) {
    return {
      id,
      customerId,
      shippingAddress: {
        street: '123 Main St',
        city: 'Springfield',
        zipCode: '62704',
        country: 'US',
      },
      items: [
        {
          productId: 'prod-001',
          productName: 'Shampoo',
          quantity: 2,
          unitPriceAmount: 29.99,
          unitPriceCurrency: 'USD',
        },
      ],
    };
  }

  describe('POST /orders', () => {
    it('should create an order and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .send(validOrderBody('order-int-1'))
        .expect(201);

      expect(res.body.id).toBe('order-int-1');
      expect(res.body.status).toBe('pending');
      expect(res.body.items).toHaveLength(1);
    });

    it('should return 400 for invalid body', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({ id: 'bad' })
        .expect(400);
    });
  });

  describe('GET /orders', () => {
    it('should return 200 with an array', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send(validOrderBody('order-list-1'));

      const res = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return 200 for existing order', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send(validOrderBody('order-get-1'));

      const res = await request(app.getHttpServer())
        .get('/orders/order-get-1')
        .expect(200);

      expect(res.body.id).toBe('order-get-1');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/non-existent')
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/transition', () => {
    it('should transition order and return 200', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send(validOrderBody('order-trans-1'));

      const res = await request(app.getHttpServer())
        .patch('/orders/order-trans-1/transition')
        .send({ status: 'confirmed' })
        .expect(200);

      expect(res.body.status).toBe('confirmed');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .patch('/orders/non-existent/transition')
        .send({ status: 'confirmed' })
        .expect(404);
    });

    it('should return 409 for invalid transition', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send(validOrderBody('order-trans-2'));

      await request(app.getHttpServer())
        .patch('/orders/order-trans-2/transition')
        .send({ status: 'fulfilled' })
        .expect(409);
    });
  });

  describe('GET /orders/stats', () => {
    it('should return 200 with stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/stats')
        .expect(200);

      expect(res.body).toHaveProperty('revenueByStatus');
      expect(res.body).toHaveProperty('topProducts');
    });
  });
});
