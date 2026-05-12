import { Effect } from 'effect';
import { LineItem } from './value-objects/line-item';
import { Money } from './value-objects/money';
import { Address } from './value-objects/address';
import { OrderStatus, canTransition } from './value-objects/order-status';
import {
  EmptyOrderError,
  InvalidOrderTransitionError,
} from './errors';

export interface CreateOrderProps {
  id: string;
  customerId: string;
  shippingAddress: Address;
  items: LineItem[];
}

export class Order {
  readonly id: string;
  readonly customerId: string;
  readonly shippingAddress: Address;
  readonly items: ReadonlyArray<LineItem>;
  readonly status: OrderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: {
    id: string;
    customerId: string;
    shippingAddress: Address;
    items: ReadonlyArray<LineItem>;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.shippingAddress = props.shippingAddress;
    this.items = props.items;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: CreateOrderProps,
  ): Effect.Effect<Order, EmptyOrderError> {
    return Effect.gen(function* () {
      if (props.items.length === 0) {
        return yield* new EmptyOrderError({ orderId: props.id });
      }

      const now = new Date();
      return new Order({
        ...props,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  static reconstitute(props: {
    id: string;
    customerId: string;
    shippingAddress: Address;
    items: ReadonlyArray<LineItem>;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    return new Order(props);
  }

  get totalAmount(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.total),
      Money.create(0, 'USD'),
    );
  }

  transition(
    to: OrderStatus,
  ): Effect.Effect<Order, InvalidOrderTransitionError> {
    return Effect.gen(this, function* () {
      if (!canTransition(this.status, to)) {
        return yield* new InvalidOrderTransitionError({
          orderId: this.id,
          from: this.status,
          to,
        });
      }

      return new Order({
        id: this.id,
        customerId: this.customerId,
        shippingAddress: this.shippingAddress,
        items: this.items,
        status: to,
        createdAt: this.createdAt,
        updatedAt: new Date(),
      });
    });
  }
}
