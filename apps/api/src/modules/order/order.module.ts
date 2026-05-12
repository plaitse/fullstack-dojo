import { Module } from '@nestjs/common';
import { ORDER_REPOSITORY } from './domain/ports/order.repository';
import { InMemoryOrderRepository } from './infrastructure/in-memory-order.repository';
import { CreateOrderUseCase } from './application/create-order.use-case';

@Module({
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
    CreateOrderUseCase,
  ],
  exports: [CreateOrderUseCase],
})
export class OrderModule {}
