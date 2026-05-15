import { Effect } from 'effect';
import {
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { runEffectHttp, runEffectTrpc } from './effect-error.mapper';
import {
  OrderNotFoundError,
  InvalidOrderTransitionError,
  EmptyOrderError,
} from '../../modules/order/domain/errors';

describe('Effect Error Mapper', () => {
  describe('runEffectHttp', () => {
    it('should return value on success', async () => {
      const effect = Effect.succeed({ id: '1' });
      const result = await runEffectHttp(effect);
      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException for OrderNotFoundError', async () => {
      const effect = Effect.fail(
        new OrderNotFoundError({ orderId: 'order-1' }),
      );
      await expect(runEffectHttp(effect)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for InvalidOrderTransitionError', async () => {
      const effect = Effect.fail(
        new InvalidOrderTransitionError({
          orderId: 'order-1',
          from: 'pending',
          to: 'fulfilled',
        }),
      );
      await expect(runEffectHttp(effect)).rejects.toThrow(ConflictException);
    });

    it('should throw UnprocessableEntityException for EmptyOrderError', async () => {
      const effect = Effect.fail(
        new EmptyOrderError({ orderId: 'order-1' }),
      );
      await expect(runEffectHttp(effect)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw InternalServerErrorException for defects', async () => {
      const effect = Effect.die(new Error('unexpected'));
      await expect(runEffectHttp(effect)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('runEffectTrpc', () => {
    it('should return value on success', async () => {
      const effect = Effect.succeed({ id: '1' });
      const result = await runEffectTrpc(effect);
      expect(result).toEqual({ id: '1' });
    });

    it('should throw TRPCError with NOT_FOUND for OrderNotFoundError', async () => {
      const effect = Effect.fail(
        new OrderNotFoundError({ orderId: 'order-1' }),
      );
      await expect(runEffectTrpc(effect)).rejects.toThrow(TRPCError);
      try {
        await runEffectTrpc(effect);
      } catch (e) {
        expect((e as TRPCError).code).toBe('NOT_FOUND');
      }
    });

    it('should throw TRPCError with CONFLICT for InvalidOrderTransitionError', async () => {
      const effect = Effect.fail(
        new InvalidOrderTransitionError({
          orderId: 'order-1',
          from: 'pending',
          to: 'fulfilled',
        }),
      );
      try {
        await runEffectTrpc(effect);
      } catch (e) {
        expect((e as TRPCError).code).toBe('CONFLICT');
      }
    });

    it('should throw TRPCError with BAD_REQUEST for EmptyOrderError', async () => {
      const effect = Effect.fail(
        new EmptyOrderError({ orderId: 'order-1' }),
      );
      try {
        await runEffectTrpc(effect);
      } catch (e) {
        expect((e as TRPCError).code).toBe('BAD_REQUEST');
      }
    });

    it('should throw TRPCError with INTERNAL_SERVER_ERROR for defects', async () => {
      const effect = Effect.die(new Error('unexpected'));
      try {
        await runEffectTrpc(effect);
      } catch (e) {
        expect((e as TRPCError).code).toBe('INTERNAL_SERVER_ERROR');
      }
    });
  });
});
