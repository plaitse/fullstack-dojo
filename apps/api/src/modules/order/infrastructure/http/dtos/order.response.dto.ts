import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUSES } from '../../../domain/value-objects/order-status';

export class MoneyResponseDto {
  @ApiProperty({ example: 29.99 })
  amount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class AddressResponseDto {
  @ApiProperty({ example: '123 Main St' })
  street!: string;

  @ApiProperty({ example: 'Springfield' })
  city!: string;

  @ApiProperty({ example: '62704' })
  zipCode!: string;

  @ApiProperty({ example: 'US' })
  country!: string;
}

export class LineItemResponseDto {
  @ApiProperty({ example: 'prod-001' })
  productId!: string;

  @ApiProperty({ example: 'Shampoo' })
  productName!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ type: MoneyResponseDto })
  unitPrice!: MoneyResponseDto;

  @ApiProperty({ type: MoneyResponseDto })
  total!: MoneyResponseDto;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'order-001' })
  id!: string;

  @ApiProperty({ example: 'cust-001' })
  customerId!: string;

  @ApiProperty({ type: AddressResponseDto })
  shippingAddress!: AddressResponseDto;

  @ApiProperty({ type: [LineItemResponseDto] })
  items!: LineItemResponseDto[];

  @ApiProperty({ enum: ORDER_STATUSES, example: 'pending' })
  status!: string;

  @ApiProperty({ type: MoneyResponseDto })
  totalAmount!: MoneyResponseDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: string;
}

export class RevenueByStatusResponseDto {
  @ApiProperty({ example: 'pending' })
  status!: string;

  @ApiProperty({ example: 5 })
  orderCount!: number;

  @ApiProperty({ example: 299.95 })
  totalRevenue!: number;
}

export class TopProductResponseDto {
  @ApiProperty({ example: 'prod-001' })
  productId!: string;

  @ApiProperty({ example: 'Shampoo' })
  productName!: string;

  @ApiProperty({ example: 10 })
  totalQuantity!: number;

  @ApiProperty({ example: 299.9 })
  totalRevenue!: number;
}

export class OrderStatsResponseDto {
  @ApiProperty({ type: [RevenueByStatusResponseDto] })
  revenueByStatus!: RevenueByStatusResponseDto[];

  @ApiProperty({ type: [TopProductResponseDto] })
  topProducts!: TopProductResponseDto[];
}
