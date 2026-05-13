import { Effect } from 'effect';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { PrismaOrderRepository } from './prisma-order.repository';
import { Order } from '../domain/order.entity';
import { Address } from '../domain/value-objects/address';
import { LineItem } from '../domain/value-objects/line-item';
import { Money } from '../domain/value-objects/money';

describe('PrismaOrderRepository (integration)', () => {
  let prisma: PrismaService;
  let repo: PrismaOrderRepository;

  beforeAll(async () => {
    prisma = new PrismaService(process.env.DATABASE_URL);
    await prisma.$connect();
    repo = new PrismaOrderRepository(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  beforeEach(async () => {
    await prisma.lineItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
  });

  async function seedCustomer(id = 'cust-1') {
    await prisma.customer.create({
      data: { id, name: 'Test Customer', email: `${id}@test.com` },
    });
  }

  function makeOrder(overrides?: { id?: string; customerId?: string }) {
    return Order.reconstitute({
      id: overrides?.id ?? 'order-1',
      customerId: overrides?.customerId ?? 'cust-1',
      shippingAddress: Address.create('123 Main St', 'Springfield', '62701', 'US'),
      items: [
        LineItem.create('prod-1', 'Shampoo', 2, Money.create(29.99, 'USD')),
        LineItem.create('prod-2', 'Conditioner', 1, Money.create(24.99, 'USD')),
      ],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  it('saves and retrieves an order', async () => {
    await seedCustomer();
    const order = makeOrder();

    const saved = await Effect.runPromise(repo.save(order));
    expect(saved.id).toBe('order-1');
    expect(saved.status).toBe('pending');
    expect(saved.items).toHaveLength(2);

    const found = await Effect.runPromise(repo.findById('order-1'));
    expect(found.id).toBe('order-1');
    expect(found.customerId).toBe('cust-1');
    expect(found.shippingAddress.city).toBe('Springfield');
    expect(found.items).toHaveLength(2);
  });

  it('returns OrderNotFoundError for missing id', async () => {
    const result = await Effect.runPromiseExit(repo.findById('nonexistent'));

    expect(result._tag).toBe('Failure');
    if (result._tag === 'Failure') {
      const error = result.cause;
      expect(JSON.stringify(error)).toContain('OrderNotFoundError');
    }
  });

  it('updates an order on re-save (upsert)', async () => {
    await seedCustomer();
    const order = makeOrder();
    await Effect.runPromise(repo.save(order));

    const transitioned = Order.reconstitute({
      ...order,
      items: [...order.items],
      status: 'confirmed',
      updatedAt: new Date(),
    });

    const updated = await Effect.runPromise(repo.save(transitioned));
    expect(updated.status).toBe('confirmed');
    expect(updated.items).toHaveLength(2);

    const found = await Effect.runPromise(repo.findById('order-1'));
    expect(found.status).toBe('confirmed');
  });

  it('retrieves all orders', async () => {
    await seedCustomer();
    await Effect.runPromise(repo.save(makeOrder({ id: 'order-1' })));
    await Effect.runPromise(repo.save(makeOrder({ id: 'order-2' })));

    const all = await Effect.runPromise(repo.findAll());
    expect(all).toHaveLength(2);
  });
});
