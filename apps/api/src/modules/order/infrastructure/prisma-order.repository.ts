import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { Order } from '../domain/order.entity';
import { OrderNotFoundError } from '../domain/errors';
import { OrderRepository } from '../domain/ports/order.repository';
import { OrderMapper } from './order.mapper';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  save(order: Order): Effect.Effect<Order> {
    const data = OrderMapper.toPersistence(order);

    return Effect.tryPromise(() =>
      this.prisma.order.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          customerId: data.customerId,
          shippingAddress: data.shippingAddress,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          items: { create: data.items },
        },
        update: {
          status: data.status,
          shippingAddress: data.shippingAddress,
          updatedAt: data.updatedAt,
          items: { deleteMany: {}, create: data.items },
        },
        include: { items: true },
      }),
    ).pipe(Effect.map(OrderMapper.toDomain), Effect.orDie);
  }

  findById(id: string): Effect.Effect<Order, OrderNotFoundError> {
    return Effect.gen(this, function* () {
      const raw = yield* Effect.tryPromise(() =>
        this.prisma.order.findUnique({
          where: { id },
          include: { items: true },
        }),
      ).pipe(Effect.orDie);

      if (!raw) {
        return yield* new OrderNotFoundError({ orderId: id });
      }

      return OrderMapper.toDomain(raw);
    });
  }

  findAll(): Effect.Effect<Order[]> {
    return Effect.tryPromise(() =>
      this.prisma.order.findMany({ include: { items: true } }),
    ).pipe(Effect.map((orders) => orders.map(OrderMapper.toDomain)), Effect.orDie);
  }
}
