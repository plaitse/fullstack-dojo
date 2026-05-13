import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Effect } from 'effect';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ORDER_REPOSITORY } from '../domain/ports/order.repository';
import { PrismaOrderRepository } from '../infrastructure/prisma-order.repository';
import { TransitionOrderUseCase } from './transition-order.use-case';
import { CreateOrderUseCase } from './create-order.use-case';
import { OrderEventHandlers } from '../infrastructure/event-handlers/order-event.handlers';

describe('TransitionOrderUseCase (integration)', () => {
  let transitionUseCase: TransitionOrderUseCase;
  let createUseCase: CreateOrderUseCase;
  let eventEmitter: EventEmitter2;
  let prisma: PrismaService;
  let testModule: TestingModule;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        {
          provide: PrismaService,
          useFactory: () => new PrismaService(process.env.DATABASE_URL),
        },
        {
          provide: ORDER_REPOSITORY,
          useClass: PrismaOrderRepository,
        },
        TransitionOrderUseCase,
        CreateOrderUseCase,
        OrderEventHandlers,
      ],
    }).compile();

    transitionUseCase = testModule.get(TransitionOrderUseCase);
    createUseCase = testModule.get(CreateOrderUseCase);
    eventEmitter = testModule.get(EventEmitter2);
    prisma = testModule.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  beforeEach(async () => {
    await prisma.lineItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.customer.create({
      data: { id: 'cust-1', name: 'Test Customer', email: 'test@test.com' },
    });
  });

  async function createTestOrder(id = 'order-1') {
    return Effect.runPromise(
      createUseCase.execute({
        id,
        customerId: 'cust-1',
        shippingAddress: {
          street: '123 Main St',
          city: 'Springfield',
          zipCode: '62701',
          country: 'US',
        },
        items: [
          {
            productId: 'prod-1',
            productName: 'Shampoo',
            quantity: 2,
            unitPriceAmount: 29.99,
            unitPriceCurrency: 'USD',
          },
        ],
      }),
    );
  }

  it('transitions an order from pending to confirmed', async () => {
    await createTestOrder();

    const result = await Effect.runPromise(
      transitionUseCase.execute('order-1', 'confirmed'),
    );

    expect(result.status).toBe('confirmed');
  });

  it('emits a domain event on transition', async () => {
    await createTestOrder();

    const emittedEvents: any[] = [];
    eventEmitter.on('order.confirmed', (e) => emittedEvents.push(e));

    await Effect.runPromise(
      transitionUseCase.execute('order-1', 'confirmed'),
    );

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].orderId).toBe('order-1');
    expect(emittedEvents[0].customerId).toBe('cust-1');
  });

  it('rejects invalid transition', async () => {
    await createTestOrder();

    const result = await Effect.runPromiseExit(
      transitionUseCase.execute('order-1', 'fulfilled'),
    );

    expect(result._tag).toBe('Failure');
  });

  it('supports full lifecycle: pending → confirmed → fulfilled', async () => {
    await createTestOrder();

    const confirmed = await Effect.runPromise(
      transitionUseCase.execute('order-1', 'confirmed'),
    );
    expect(confirmed.status).toBe('confirmed');

    const fulfilled = await Effect.runPromise(
      transitionUseCase.execute('order-1', 'fulfilled'),
    );
    expect(fulfilled.status).toBe('fulfilled');
  });
});
