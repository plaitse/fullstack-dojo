import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as trpcExpress from '@trpc/server/adapters/express';
import { AppModule } from './app.module';
import { CreateOrderUseCase } from './modules/order/application/create-order.use-case';
import { GetOrderUseCase } from './modules/order/application/get-order.use-case';
import { ListOrdersUseCase } from './modules/order/application/list-orders.use-case';
import { TransitionOrderUseCase } from './modules/order/application/transition-order.use-case';
import { OrderStatsQuery } from './modules/order/application/order-stats.query';
import { createAppRouter } from './trpc/app.router';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Fullstack Dojo API')
    .setDescription('Order Management API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const createOrderUseCase = app.get(CreateOrderUseCase);
  const getOrderUseCase = app.get(GetOrderUseCase);
  const listOrdersUseCase = app.get(ListOrdersUseCase);
  const transitionOrderUseCase = app.get(TransitionOrderUseCase);
  const orderStatsQuery = app.get(OrderStatsQuery);

  const appRouter = createAppRouter({
    createOrderUseCase,
    getOrderUseCase,
    listOrdersUseCase,
    transitionOrderUseCase,
    orderStatsQuery,
  });

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({ router: appRouter }),
  );

  await app.listen(3000);
}
bootstrap();
