import { Injectable, Inject } from '@nestjs/common';
import { Effect } from 'effect';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../domain/ports/order.repository';
import { Order } from '../domain/order.entity';
import { OrderNotFoundError } from '../domain/errors';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
  ) {}

  execute(id: string): Effect.Effect<Order, OrderNotFoundError> {
    return this.repo.findById(id);
  }
}
