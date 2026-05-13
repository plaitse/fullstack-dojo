import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';

interface RevenueByStatus {
  status: string;
  orderCount: bigint;
  totalRevenue: Prisma.Decimal;
}

interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: bigint;
  totalRevenue: Prisma.Decimal;
}

export interface OrderStats {
  revenueByStatus: RevenueByStatus[];
  topProducts: TopProduct[];
}

@Injectable()
export class OrderStatsQuery {
  constructor(private readonly prisma: PrismaService) {}

  execute(limit = 10): Effect.Effect<OrderStats> {
    return Effect.tryPromise(async () => {
      const [revenueByStatus, topProducts] = await Promise.all([
        this.prisma.$queryRaw<RevenueByStatus[]>`
          SELECT
            o.status,
            COUNT(DISTINCT o.id) AS "orderCount",
            COALESCE(SUM(li.unit_price_amount * li.quantity), 0) AS "totalRevenue"
          FROM orders o
          LEFT JOIN line_items li ON li.order_id = o.id
          GROUP BY o.status
          ORDER BY "totalRevenue" DESC
        `,
        this.prisma.$queryRaw<TopProduct[]>`
          SELECT
            li.product_id AS "productId",
            li.product_name AS "productName",
            SUM(li.quantity) AS "totalQuantity",
            SUM(li.unit_price_amount * li.quantity) AS "totalRevenue"
          FROM line_items li
          GROUP BY li.product_id, li.product_name
          ORDER BY "totalRevenue" DESC
          LIMIT ${limit}
        `,
      ]);

      return { revenueByStatus, topProducts };
    }).pipe(Effect.orDie);
  }
}
