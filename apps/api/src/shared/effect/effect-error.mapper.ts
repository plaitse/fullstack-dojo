import {
  HttpException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { Effect, Exit, Cause, Option } from 'effect';

interface ErrorMapping {
  httpFactory: (message: string) => HttpException;
  trpcCode: TRPCError['code'];
}

const ERROR_MAP: Record<string, ErrorMapping> = {
  OrderNotFoundError: {
    httpFactory: (msg) => new NotFoundException(msg),
    trpcCode: 'NOT_FOUND',
  },
  InvalidOrderTransitionError: {
    httpFactory: (msg) => new ConflictException(msg),
    trpcCode: 'CONFLICT',
  },
  EmptyOrderError: {
    httpFactory: (msg) => new UnprocessableEntityException(msg),
    trpcCode: 'BAD_REQUEST',
  },
};

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'An unexpected error occurred';
}

function getTag(error: unknown): string | undefined {
  if (error && typeof error === 'object' && '_tag' in error) {
    return (error as { _tag: string })._tag;
  }
  return undefined;
}

export async function runEffectHttp<A, E>(
  effect: Effect.Effect<A, E>,
): Promise<A> {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  const failureOption = Cause.failureOption(exit.cause);

  if (Option.isSome(failureOption)) {
    const error = failureOption.value;
    const tag = getTag(error);
    const message = extractErrorMessage(error);

    if (tag && ERROR_MAP[tag]) {
      throw ERROR_MAP[tag].httpFactory(message);
    }

    throw new InternalServerErrorException(message);
  }

  throw new InternalServerErrorException('An unexpected error occurred');
}

export async function runEffectTrpc<A, E>(
  effect: Effect.Effect<A, E>,
): Promise<A> {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  const failureOption = Cause.failureOption(exit.cause);

  if (Option.isSome(failureOption)) {
    const error = failureOption.value;
    const tag = getTag(error);
    const message = extractErrorMessage(error);

    if (tag && ERROR_MAP[tag]) {
      throw new TRPCError({
        code: ERROR_MAP[tag].trpcCode,
        message,
      });
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
