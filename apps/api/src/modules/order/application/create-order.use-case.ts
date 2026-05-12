import { Inject, Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import { Order } from '../domain/order.entity';
import { Address } from '../domain/value-objects/address';
import { LineItem } from '../domain/value-objects/line-item';
import { Money } from '../domain/value-objects/money';
import {
  ORDER_REPOSITORY,
  OrderRepository,
} from '../domain/ports/order.repository';
import { EmptyOrderError } from '../domain/errors';
import { CreateOrderCommand } from './create-order.command';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  execute(command: CreateOrderCommand): Effect.Effect<Order, EmptyOrderError> {
    return Effect.gen(this, function* () {
      const address = Address.create(
        command.shippingAddress.street,
        command.shippingAddress.city,
        command.shippingAddress.zipCode,
        command.shippingAddress.country,
      );

      const items = command.items.map((item) =>
        LineItem.create(
          item.productId,
          item.productName,
          item.quantity,
          Money.create(item.unitPriceAmount, item.unitPriceCurrency),
        ),
      );

      const order = yield* Order.create({
        id: command.id,
        customerId: command.customerId,
        shippingAddress: address,
        items,
      });

      return yield* this.orderRepository.save(order);
    });
  }
}
