import { Order } from '../domain/order.entity';
import { Money } from '../domain/value-objects/money';
import { OrderStats } from '../application/order-stats.query';
import type {
  OrderDto,
  LineItemDto,
  MoneyDto,
  AddressDto,
  OrderStatsDto,
} from './dtos';

export class OrderDtoMapper {
  static toDto(order: Order): OrderDto {
    return {
      id: order.id,
      customerId: order.customerId,
      shippingAddress: this.addressToDto(order.shippingAddress),
      items: order.items.map((item) => this.lineItemToDto(item)),
      status: order.status,
      totalAmount: this.moneyToDto(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  static toDtoList(orders: Order[]): OrderDto[] {
    return orders.map((order) => this.toDto(order));
  }

  static statsToDto(stats: OrderStats): OrderStatsDto {
    return {
      revenueByStatus: stats.revenueByStatus.map((r) => ({
        status: r.status,
        orderCount: Number(r.orderCount),
        totalRevenue: Number(r.totalRevenue),
      })),
      topProducts: stats.topProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        totalQuantity: Number(p.totalQuantity),
        totalRevenue: Number(p.totalRevenue),
      })),
    };
  }

  private static moneyToDto(money: Money): MoneyDto {
    return { amount: money.amount, currency: money.currency };
  }

  private static addressToDto(address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  }): AddressDto {
    return {
      street: address.street,
      city: address.city,
      zipCode: address.zipCode,
      country: address.country,
    };
  }

  private static lineItemToDto(item: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: Money;
    total: Money;
  }): LineItemDto {
    return {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: this.moneyToDto(item.unitPrice),
      total: this.moneyToDto(item.total),
    };
  }
}
