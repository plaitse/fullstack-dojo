import { Injectable, Inject } from '@nestjs/common';
import { Effect } from 'effect';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../domain/ports/order.repository';
import { Order } from '../domain/order.entity';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
  ) {}

  execute(): Effect.Effect<Order[]> {
    return this.repo.findAll();
  }
}
