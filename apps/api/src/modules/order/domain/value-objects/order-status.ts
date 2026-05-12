export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'fulfilled',
  'returned',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: ['returned'],
  returned: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
