import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Effect } from 'effect';
import { OrderController } from './order.controller';
import { CreateOrderUseCase } from '../../application/create-order.use-case';
import { GetOrderUseCase } from '../../application/get-order.use-case';
import { ListOrdersUseCase } from '../../application/list-orders.use-case';
import { TransitionOrderUseCase } from '../../application/transition-order.use-case';
import { OrderStatsQuery } from '../../application/order-stats.query';
import { Order } from '../../domain/order.entity';
import { Address } from '../../domain/value-objects/address';
import { LineItem } from '../../domain/value-objects/line-item';
import { Money } from '../../domain/value-objects/money';
import {
  OrderNotFoundError,
  InvalidOrderTransitionError,
} from '../../domain/errors';

function makeOrder(overrides: Partial<{ id: string; status: string }> = {}) {
  return Order.reconstitute({
    id: overrides.id ?? 'order-1',
    customerId: 'cust-1',
    shippingAddress: Address.create('123 Main', 'City', '12345', 'US'),
    items: [
      LineItem.create('prod-1', 'Product 1', 2, Money.create(10, 'USD')),
    ],
    status: (overrides.status as any) ?? 'pending',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });
}

describe('OrderController', () => {
  let controller: OrderController;
  let createOrderUseCase: { execute: jest.Mock };
  let getOrderUseCase: { execute: jest.Mock };
  let listOrdersUseCase: { execute: jest.Mock };
  let transitionOrderUseCase: { execute: jest.Mock };
  let orderStatsQuery: { execute: jest.Mock };

  beforeEach(async () => {
    createOrderUseCase = { execute: jest.fn() };
    getOrderUseCase = { execute: jest.fn() };
    listOrdersUseCase = { execute: jest.fn() };
    transitionOrderUseCase = { execute: jest.fn() };
    orderStatsQuery = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: CreateOrderUseCase, useValue: createOrderUseCase },
        { provide: GetOrderUseCase, useValue: getOrderUseCase },
        { provide: ListOrdersUseCase, useValue: listOrdersUseCase },
        { provide: TransitionOrderUseCase, useValue: transitionOrderUseCase },
        { provide: OrderStatsQuery, useValue: orderStatsQuery },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('POST /orders', () => {
    it('should create and return an order', async () => {
      const order = makeOrder();
      createOrderUseCase.execute.mockReturnValue(Effect.succeed(order));

      const result = await controller.create({
        id: 'order-1',
        customerId: 'cust-1',
        shippingAddress: {
          street: '123 Main',
          city: 'City',
          zipCode: '12345',
          country: 'US',
        },
        items: [
          {
            productId: 'prod-1',
            productName: 'Product 1',
            quantity: 2,
            unitPriceAmount: 10,
            unitPriceCurrency: 'USD',
          },
        ],
      });

      expect(result.id).toBe('order-1');
      expect(result.status).toBe('pending');
      expect(result.items).toHaveLength(1);
    });
  });

  describe('GET /orders', () => {
    it('should return a list of orders', async () => {
      const orders = [makeOrder({ id: 'o1' }), makeOrder({ id: 'o2' })];
      listOrdersUseCase.execute.mockReturnValue(Effect.succeed(orders));

      const result = await controller.list();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('o1');
      expect(result[1].id).toBe('o2');
    });
  });

  describe('GET /orders/:id', () => {
    it('should return an order by id', async () => {
      const order = makeOrder();
      getOrderUseCase.execute.mockReturnValue(Effect.succeed(order));

      const result = await controller.findOne('order-1');

      expect(result.id).toBe('order-1');
    });

    it('should throw NotFoundException when order not found', async () => {
      getOrderUseCase.execute.mockReturnValue(
        Effect.fail(new OrderNotFoundError({ orderId: 'missing' })),
      );

      await expect(controller.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /orders/:id/transition', () => {
    it('should transition order status', async () => {
      const order = makeOrder({ status: 'confirmed' });
      transitionOrderUseCase.execute.mockReturnValue(Effect.succeed(order));

      const result = await controller.transition('order-1', {
        status: 'confirmed',
      });

      expect(result.status).toBe('confirmed');
    });

    it('should throw ConflictException for invalid transition', async () => {
      transitionOrderUseCase.execute.mockReturnValue(
        Effect.fail(
          new InvalidOrderTransitionError({
            orderId: 'order-1',
            from: 'pending',
            to: 'fulfilled',
          }),
        ),
      );

      await expect(
        controller.transition('order-1', { status: 'fulfilled' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('GET /orders/stats', () => {
    it('should return order statistics', async () => {
      const stats = {
        revenueByStatus: [
          { status: 'pending', orderCount: BigInt(5), totalRevenue: 100.0 },
        ],
        topProducts: [
          {
            productId: 'p1',
            productName: 'Product',
            totalQuantity: BigInt(10),
            totalRevenue: 200.0,
          },
        ],
      };
      orderStatsQuery.execute.mockReturnValue(Effect.succeed(stats));

      const result = await controller.stats();

      expect(result.revenueByStatus).toHaveLength(1);
      expect(result.topProducts).toHaveLength(1);
    });
  });
});
