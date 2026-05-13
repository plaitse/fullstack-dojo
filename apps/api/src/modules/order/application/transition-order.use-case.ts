import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Effect } from 'effect';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../domain/ports/order.repository';
import { Order } from '../domain/order.entity';
import { OrderStatus } from '../domain/value-objects/order-status';
import { OrderNotFoundError, InvalidOrderTransitionError } from '../domain/errors';
import {
  OrderConfirmedEvent,
  OrderFulfilledEvent,
  OrderReturnedEvent,
  OrderCancelledEvent,
} from '../domain/events';

const EVENT_MAP: Record<string, new (orderId: string, customerId: string) => any> = {
  confirmed: OrderConfirmedEvent,
  fulfilled: OrderFulfilledEvent,
  returned: OrderReturnedEvent,
  cancelled: OrderCancelledEvent,
};

@Injectable()
export class TransitionOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly events: EventEmitter2,
  ) {}

  execute(
    orderId: string,
    to: OrderStatus,
  ): Effect.Effect<Order, OrderNotFoundError | InvalidOrderTransitionError> {
    return Effect.gen(this, function* () {
      const order = yield* this.repo.findById(orderId);
      const transitioned = yield* order.transition(to);
      const saved = yield* this.repo.save(transitioned);

      const EventClass = EVENT_MAP[to];
      if (EventClass) {
        const event = new EventClass(saved.id, saved.customerId);
        this.events.emit(event.eventName, event);
      }

      return saved;
    });
  }
}
