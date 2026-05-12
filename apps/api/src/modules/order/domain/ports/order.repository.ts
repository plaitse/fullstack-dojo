import { Effect } from 'effect';
import { Order } from '../order.entity';
import { OrderNotFoundError } from '../errors';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  save(order: Order): Effect.Effect<Order>;
  findById(id: string): Effect.Effect<Order, OrderNotFoundError>;
  findAll(): Effect.Effect<Order[]>;
}
