import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './shared/prisma/prisma.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [EventEmitterModule.forRoot(), PrismaModule, OrderModule],
})
export class AppModule {}
