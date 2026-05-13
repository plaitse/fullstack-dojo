import { OrderStatus } from '../../domain/value-objects/order-status';

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface AddressDto {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface LineItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: MoneyDto;
  total: MoneyDto;
}

export interface OrderDto {
  id: string;
  customerId: string;
  shippingAddress: AddressDto;
  items: LineItemDto[];
  status: OrderStatus;
  totalAmount: MoneyDto;
  createdAt: string;
  updatedAt: string;
}
