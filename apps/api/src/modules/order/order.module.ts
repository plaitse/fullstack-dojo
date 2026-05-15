import { Module } from '@nestjs/common';
import { ORDER_REPOSITORY } from './domain/ports/order.repository';
import { PrismaOrderRepository } from './infrastructure/prisma-order.repository';
import { CreateOrderUseCase } from './application/create-order.use-case';
import { GetOrderUseCase } from './application/get-order.use-case';
import { ListOrdersUseCase } from './application/list-orders.use-case';
import { TransitionOrderUseCase } from './application/transition-order.use-case';
import { OrderStatsQuery } from './application/order-stats.query';
import { OrderEventHandlers } from './infrastructure/event-handlers/order-event.handlers';
import { OrderController } from './infrastructure/http/order.controller';

@Module({
  controllers: [OrderController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    CreateOrderUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
    TransitionOrderUseCase,
    OrderStatsQuery,
    OrderEventHandlers,
  ],
  exports: [
    CreateOrderUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
    TransitionOrderUseCase,
    OrderStatsQuery,
  ],
})
export class OrderModule {}
