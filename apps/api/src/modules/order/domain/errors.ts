import { Data } from 'effect';

export class OrderNotFoundError extends Data.TaggedError('OrderNotFoundError')<{
  readonly orderId: string;
}> {}

export class InvalidOrderTransitionError extends Data.TaggedError(
  'InvalidOrderTransitionError',
)<{
  readonly orderId: string;
  readonly from: string;
  readonly to: string;
}> {}

export class EmptyOrderError extends Data.TaggedError('EmptyOrderError')<{
  readonly orderId: string;
}> {}

export type OrderError =
  | OrderNotFoundError
  | InvalidOrderTransitionError
  | EmptyOrderError;
