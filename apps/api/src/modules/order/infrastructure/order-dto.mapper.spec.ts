import { Effect } from 'effect';
import { Order } from '../domain/order.entity';
import { Address } from '../domain/value-objects/address';
import { LineItem } from '../domain/value-objects/line-item';
import { Money } from '../domain/value-objects/money';
import { OrderDtoMapper } from './order-dto.mapper';
import type { OrderStats } from '../application/order-stats.query';
import { Prisma } from '@prisma/client';

function makeOrder(overrides?: { status?: 'confirmed' | 'fulfilled' }) {
  const order = Order.reconstitute({
    id: 'order-1',
    customerId: 'cust-1',
    shippingAddress: Address.create('123 Main St', 'Paris', '75001', 'FR'),
    items: [
      LineItem.create('prod-1', 'Shampoo', 2, Money.create(15.5, 'USD')),
      LineItem.create('prod-2', 'Conditioner', 1, Money.create(12, 'USD')),
    ],
    status: overrides?.status ?? 'pending',
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
    updatedAt: new Date('2026-01-15T12:00:00.000Z'),
  });
  return order;
}

describe('OrderDtoMapper', () => {
  describe('toDto', () => {
    it('maps a domain Order to an OrderDto', () => {
      const order = makeOrder();
      const dto = OrderDtoMapper.toDto(order);

      expect(dto).toEqual({
        id: 'order-1',
        customerId: 'cust-1',
        shippingAddress: {
          street: '123 Main St',
          city: 'Paris',
          zipCode: '75001',
          country: 'FR',
        },
        items: [
          {
            productId: 'prod-1',
            productName: 'Shampoo',
            quantity: 2,
            unitPrice: { amount: 15.5, currency: 'USD' },
            total: { amount: 31, currency: 'USD' },
          },
          {
            productId: 'prod-2',
            productName: 'Conditioner',
            quantity: 1,
            unitPrice: { amount: 12, currency: 'USD' },
            total: { amount: 12, currency: 'USD' },
          },
        ],
        status: 'pending',
        totalAmount: { amount: 43, currency: 'USD' },
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T12:00:00.000Z',
      });
    });

    it('serializes dates as ISO strings', () => {
      const dto = OrderDtoMapper.toDto(makeOrder());
      expect(typeof dto.createdAt).toBe('string');
      expect(typeof dto.updatedAt).toBe('string');
    });
  });

  describe('toDtoList', () => {
    it('maps an array of orders', () => {
      const orders = [makeOrder(), makeOrder({ status: 'confirmed' })];
      const dtos = OrderDtoMapper.toDtoList(orders);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].status).toBe('pending');
      expect(dtos[1].status).toBe('confirmed');
    });
  });

  describe('statsToDto', () => {
    it('converts bigint and Decimal to numbers', () => {
      const stats: OrderStats = {
        revenueByStatus: [
          {
            status: 'confirmed',
            orderCount: BigInt(5),
            totalRevenue: new Prisma.Decimal('1250.50'),
          },
        ],
        topProducts: [
          {
            productId: 'prod-1',
            productName: 'Shampoo',
            totalQuantity: BigInt(42),
            totalRevenue: new Prisma.Decimal('651.00'),
          },
        ],
      };

      const dto = OrderDtoMapper.statsToDto(stats);

      expect(dto).toEqual({
        revenueByStatus: [
          { status: 'confirmed', orderCount: 5, totalRevenue: 1250.5 },
        ],
        topProducts: [
          {
            productId: 'prod-1',
            productName: 'Shampoo',
            totalQuantity: 42,
            totalRevenue: 651,
          },
        ],
      });

      expect(typeof dto.revenueByStatus[0].orderCount).toBe('number');
      expect(typeof dto.topProducts[0].totalQuantity).toBe('number');
    });
  });
});
