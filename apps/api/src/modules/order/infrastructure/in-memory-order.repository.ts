import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import { Order } from '../domain/order.entity';
import { OrderRepository } from '../domain/ports/order.repository';
import { OrderNotFoundError } from '../domain/errors';

@Injectable()
export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  save(order: Order): Effect.Effect<Order> {
    return Effect.sync(() => {
      this.orders.set(order.id, order);
      return order;
    });
  }

  findById(id: string): Effect.Effect<Order, OrderNotFoundError> {
    return Effect.gen(this, function* () {
      const order = this.orders.get(id);
      if (!order) {
        return yield* new OrderNotFoundError({ orderId: id });
      }
      return order;
    });
  }

  findAll(): Effect.Effect<Order[]> {
    return Effect.sync(() => Array.from(this.orders.values()));
  }
}
