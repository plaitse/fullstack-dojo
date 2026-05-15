import { router } from './trpc';
import { createOrderRouter, OrderRouterDeps } from './order.router';

export function createAppRouter(deps: OrderRouterDeps) {
  return router({
    order: createOrderRouter(deps),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
