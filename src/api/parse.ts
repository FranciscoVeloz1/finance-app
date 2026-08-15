import { ZodError, type ZodType } from 'zod';
import { ApiError } from './types';

export function parseWithApiError<T>(schema: ZodType<T>, raw: unknown): T {
  try {
    return schema.parse(raw);
  } catch (cause) {
    if (cause instanceof ZodError) {
      if (import.meta.env.DEV) {
        console.error(
          'Zod validation failed',
          cause.issues.map((issue) => issue.path.join('.')),
        );
      }
      throw new ApiError(422, {
        error: 'VALIDATION_ERROR',
        message: 'Response validation failed',
        details: cause.issues,
      });
    }
    throw new ApiError(500, { error: 'INTERNAL_SERVER_ERROR', message: 'Unexpected client error' });
  }
}
