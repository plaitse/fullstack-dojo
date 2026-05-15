import { router, publicProcedure } from './trpc';
import { runEffectTrpc } from '../shared/effect/effect-error.mapper';
import { OrderDtoMapper } from '../modules/order/infrastructure/order-dto.mapper';
import {
  createOrderInputSchema,
  getOrderInputSchema,
  transitionOrderInputSchema,
  orderStatsInputSchema,
} from '../modules/order/infrastructure/trpc/schemas/order.schemas';
import type { CreateOrderUseCase } from '../modules/order/application/create-order.use-case';
import type { GetOrderUseCase } from '../modules/order/application/get-order.use-case';
import type { ListOrdersUseCase } from '../modules/order/application/list-orders.use-case';
import type { TransitionOrderUseCase } from '../modules/order/application/transition-order.use-case';
import type { OrderStatsQuery } from '../modules/order/application/order-stats.query';

export interface OrderRouterDeps {
  createOrderUseCase: CreateOrderUseCase;
  getOrderUseCase: GetOrderUseCase;
  listOrdersUseCase: ListOrdersUseCase;
  transitionOrderUseCase: TransitionOrderUseCase;
  orderStatsQuery: OrderStatsQuery;
}

export function createOrderRouter(deps: OrderRouterDeps) {
  return router({
    createOrder: publicProcedure
      .input(createOrderInputSchema)
      .mutation(async ({ input }) => {
        const order = await runEffectTrpc(
          deps.createOrderUseCase.execute(input),
        );
        return OrderDtoMapper.toDto(order);
      }),

    getOrder: publicProcedure
      .input(getOrderInputSchema)
      .query(async ({ input }) => {
        const order = await runEffectTrpc(
          deps.getOrderUseCase.execute(input.id),
        );
        return OrderDtoMapper.toDto(order);
      }),

    listOrders: publicProcedure.query(async () => {
      const orders = await runEffectTrpc(deps.listOrdersUseCase.execute());
      return OrderDtoMapper.toDtoList(orders);
    }),

    transitionOrder: publicProcedure
      .input(transitionOrderInputSchema)
      .mutation(async ({ input }) => {
        const order = await runEffectTrpc(
          deps.transitionOrderUseCase.execute(input.orderId, input.status),
        );
        return OrderDtoMapper.toDto(order);
      }),

    orderStats: publicProcedure
      .input(orderStatsInputSchema)
      .query(async ({ input }) => {
        const stats = await runEffectTrpc(
          deps.orderStatsQuery.execute(input?.limit),
        );
        return OrderDtoMapper.statsToDto(stats);
      }),
  });
}
