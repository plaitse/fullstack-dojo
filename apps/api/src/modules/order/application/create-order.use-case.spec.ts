import { Effect, Exit } from 'effect';
import { CreateOrderUseCase } from './create-order.use-case';
import { InMemoryOrderRepository } from '../infrastructure/in-memory-order.repository';
import { CreateOrderCommand } from './create-order.command';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let repository: InMemoryOrderRepository;

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
    useCase = new CreateOrderUseCase(repository);
  });

  const validCommand: CreateOrderCommand = {
    id: 'order-1',
    customerId: 'customer-1',
    shippingAddress: {
      street: '123 Main St',
      city: 'Paris',
      zipCode: '75001',
      country: 'FRA',
    },
    items: [
      {
        productId: 'product-1',
        productName: 'Custom Shampoo',
        quantity: 2,
        unitPriceAmount: 29.99,
        unitPriceCurrency: 'USD',
      },
    ],
  };

  it('should create an order and persist it', async () => {
    const order = await Effect.runPromise(useCase.execute(validCommand));

    expect(order.id).toBe('order-1');
    expect(order.status).toBe('pending');
    expect(order.items).toHaveLength(1);

    const found = await Effect.runPromise(repository.findById('order-1'));
    expect(found.id).toBe('order-1');
  });

  it('should fail when order has no items', async () => {
    const emptyCommand: CreateOrderCommand = {
      ...validCommand,
      items: [],
    };

    const result = await Effect.runPromiseExit(useCase.execute(emptyCommand));
    expect(Exit.isFailure(result)).toBe(true);
  });

  it('should create multiple orders independently', async () => {
    await Effect.runPromise(useCase.execute(validCommand));
    await Effect.runPromise(
      useCase.execute({ ...validCommand, id: 'order-2' }),
    );

    const allOrders = await Effect.runPromise(repository.findAll());
    expect(allOrders).toHaveLength(2);
  });
});
