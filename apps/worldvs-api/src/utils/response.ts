import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { getRequestId } from "../middleware/request-id.js";
import { AppError } from "../errors/error-codes.js";

export function success<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json(
    {
      success: true as const,
      data,
      meta: { requestId: getRequestId(c) },
    },
    status,
  );
}

export function error(c: Context, err: AppError) {
  return c.json(
    {
      success: false as const,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
      meta: { requestId: getRequestId(c) },
    },
    err.statusCode as ContentfulStatusCode,
  );
}

export function paginated<T>(
  c: Context,
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return success(c, { items, total, page, pageSize });
}
