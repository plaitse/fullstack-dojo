import { Effect, Exit } from 'effect';
import { Order } from './order.entity';
import { Address } from './value-objects/address';
import { LineItem } from './value-objects/line-item';
import { Money } from './value-objects/money';
import { EmptyOrderError, InvalidOrderTransitionError } from './errors';

function makeAddress() {
  return Address.create('123 Main St', 'Paris', '75001', 'FRA');
}

function makeLineItem(overrides?: { quantity?: number; amount?: number }) {
  return LineItem.create(
    'product-1',
    'Custom Shampoo',
    overrides?.quantity ?? 2,
    Money.create(overrides?.amount ?? 29.99, 'USD'),
  );
}

describe('Order', () => {
  describe('create', () => {
    it('should create a pending order with items', async () => {
      const result = await Effect.runPromiseExit(
        Order.create({
          id: 'order-1',
          customerId: 'customer-1',
          shippingAddress: makeAddress(),
          items: [makeLineItem()],
        }),
      );

      expect(Exit.isSuccess(result)).toBe(true);
      if (Exit.isSuccess(result)) {
        const order = result.value;
        expect(order.id).toBe('order-1');
        expect(order.status).toBe('pending');
        expect(order.items).toHaveLength(1);
        expect(order.customerId).toBe('customer-1');
      }
    });

    it('should fail with EmptyOrderError when no items', async () => {
      const result = await Effect.runPromiseExit(
        Order.create({
          id: 'order-1',
          customerId: 'customer-1',
          shippingAddress: makeAddress(),
          items: [],
        }),
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const error = result.cause;
        expect(error).toMatchObject({
          _tag: 'Fail',
          error: { _tag: 'EmptyOrderError', orderId: 'order-1' },
        });
      }
    });
  });

  describe('totalAmount', () => {
    it('should sum all line item totals', async () => {
      const order = await Effect.runPromise(
        Order.create({
          id: 'order-1',
          customerId: 'customer-1',
          shippingAddress: makeAddress(),
          items: [
            makeLineItem({ quantity: 2, amount: 10 }),
            makeLineItem({ quantity: 1, amount: 25 }),
          ],
        }),
      );

      expect(order.totalAmount.amount).toBe(45);
      expect(order.totalAmount.currency).toBe('USD');
    });
  });

  describe('transition', () => {
    let pendingOrder: Order;

    beforeEach(async () => {
      pendingOrder = await Effect.runPromise(
        Order.create({
          id: 'order-1',
          customerId: 'customer-1',
          shippingAddress: makeAddress(),
          items: [makeLineItem()],
        }),
      );
    });

    it('should transition from pending to confirmed', async () => {
      const confirmed = await Effect.runPromise(
        pendingOrder.transition('confirmed'),
      );
      expect(confirmed.status).toBe('confirmed');
      expect(confirmed.id).toBe('order-1');
    });

    it('should transition from pending to cancelled', async () => {
      const cancelled = await Effect.runPromise(
        pendingOrder.transition('cancelled'),
      );
      expect(cancelled.status).toBe('cancelled');
    });

    it('should fail for invalid transition pending -> fulfilled', async () => {
      const result = await Effect.runPromiseExit(
        pendingOrder.transition('fulfilled'),
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        expect(result.cause).toMatchObject({
          _tag: 'Fail',
          error: {
            _tag: 'InvalidOrderTransitionError',
            from: 'pending',
            to: 'fulfilled',
          },
        });
      }
    });

    it('should follow the full lifecycle: pending -> confirmed -> fulfilled -> returned', async () => {
      const confirmed = await Effect.runPromise(
        pendingOrder.transition('confirmed'),
      );
      const fulfilled = await Effect.runPromise(
        confirmed.transition('fulfilled'),
      );
      const returned = await Effect.runPromise(
        fulfilled.transition('returned'),
      );

      expect(returned.status).toBe('returned');
    });

    it('should not allow transition from a terminal state', async () => {
      const cancelled = await Effect.runPromise(
        pendingOrder.transition('cancelled'),
      );
      const result = await Effect.runPromiseExit(
        cancelled.transition('confirmed'),
      );

      expect(Exit.isFailure(result)).toBe(true);
    });
  });
});
