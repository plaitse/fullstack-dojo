import { z } from 'zod';
import { ORDER_STATUSES } from '../../../domain/value-objects/order-status';

const shippingAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const lineItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unitPriceAmount: z.number().nonnegative(),
  unitPriceCurrency: z.string().min(1),
});

export const createOrderInputSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  shippingAddress: shippingAddressSchema,
  items: z.array(lineItemSchema).min(1),
});

export const getOrderInputSchema = z.object({
  id: z.string().min(1),
});

export const transitionOrderInputSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export const orderStatsInputSchema = z
  .object({
    limit: z.number().positive().optional(),
  })
  .optional();
