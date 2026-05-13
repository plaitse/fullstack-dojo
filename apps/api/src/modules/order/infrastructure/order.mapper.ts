import {
  Order as PrismaOrder,
  LineItem as PrismaLineItem,
  OrderStatus as PrismaOrderStatus,
} from '@prisma/client';
import { Order } from '../domain/order.entity';
import { Address } from '../domain/value-objects/address';
import { LineItem } from '../domain/value-objects/line-item';
import { Money } from '../domain/value-objects/money';
import { OrderStatus } from '../domain/value-objects/order-status';

type PrismaOrderWithItems = PrismaOrder & { items: PrismaLineItem[] };

interface PersistedAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export class OrderMapper {
  static toDomain(raw: PrismaOrderWithItems): Order {
    const addr = raw.shippingAddress as unknown as PersistedAddress;

    return Order.reconstitute({
      id: raw.id,
      customerId: raw.customerId,
      shippingAddress: Address.create(
        addr.street,
        addr.city,
        addr.zipCode,
        addr.country,
      ),
      items: raw.items.map((item) =>
        LineItem.create(
          item.productId,
          item.productName,
          item.quantity,
          Money.create(
            Number(item.unitPriceAmount),
            item.unitPriceCurrency,
          ),
        ),
      ),
      status: raw.status as OrderStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(order: Order) {
    return {
      id: order.id,
      customerId: order.customerId,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
      },
      status: order.status as PrismaOrderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPriceAmount: item.unitPrice.amount,
        unitPriceCurrency: item.unitPrice.currency,
      })),
    };
  }
}
