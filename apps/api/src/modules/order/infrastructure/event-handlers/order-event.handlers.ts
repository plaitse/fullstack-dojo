import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OrderConfirmedEvent,
  OrderFulfilledEvent,
  OrderReturnedEvent,
  OrderCancelledEvent,
} from '../../domain/events';

@Injectable()
export class OrderEventHandlers {
  private readonly logger = new Logger(OrderEventHandlers.name);

  @OnEvent('order.confirmed')
  handleOrderConfirmed(event: OrderConfirmedEvent) {
    this.logger.log(
      `Order ${event.orderId} confirmed for customer ${event.customerId}`,
    );
  }

  @OnEvent('order.fulfilled')
  handleOrderFulfilled(event: OrderFulfilledEvent) {
    this.logger.log(
      `Order ${event.orderId} fulfilled for customer ${event.customerId}`,
    );
  }

  @OnEvent('order.returned')
  handleOrderReturned(event: OrderReturnedEvent) {
    this.logger.log(
      `Order ${event.orderId} returned for customer ${event.customerId}`,
    );
  }

  @OnEvent('order.cancelled')
  handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(
      `Order ${event.orderId} cancelled for customer ${event.customerId}`,
    );
  }
}
