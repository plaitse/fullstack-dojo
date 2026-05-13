import { DomainEvent } from './domain-event';

abstract class OrderTransitionEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly eventName: string,
    readonly orderId: string,
    readonly customerId: string,
  ) {
    this.occurredAt = new Date();
  }
}

export class OrderConfirmedEvent extends OrderTransitionEvent {
  constructor(orderId: string, customerId: string) {
    super('order.confirmed', orderId, customerId);
  }
}

export class OrderFulfilledEvent extends OrderTransitionEvent {
  constructor(orderId: string, customerId: string) {
    super('order.fulfilled', orderId, customerId);
  }
}

export class OrderReturnedEvent extends OrderTransitionEvent {
  constructor(orderId: string, customerId: string) {
    super('order.returned', orderId, customerId);
  }
}

export class OrderCancelledEvent extends OrderTransitionEvent {
  constructor(orderId: string, customerId: string) {
    super('order.cancelled', orderId, customerId);
  }
}
