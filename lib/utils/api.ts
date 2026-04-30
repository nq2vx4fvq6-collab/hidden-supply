import { NextResponse } from "next/server";

/**
 * Consistent JSON response helpers.
 *
 * Every API route should use these instead of calling NextResponse.json()
 * directly, so error shape and status codes stay uniform across the app.
 */

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function err(
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json({ error: message }, { status, headers });
}

export const ApiErrors = {
  badRequest:    (msg = "Bad request.")           => err(msg, 400),
  unauthorized:  (msg = "Unauthorized.")          => err(msg, 401),
  forbidden:     (msg = "Forbidden.")             => err(msg, 403),
  notFound:      (msg = "Not found.")             => err(msg, 404),
  conflict:      (msg = "Conflict.")              => err(msg, 409),
  tooManyReqs:   (msg = "Too many requests.")     => err(msg, 429),
  serverError:   (msg = "Internal server error.") => err(msg, 500),
} as const;

/**
 * Safely parse a request JSON body.
 * Returns the parsed value or null if the body is missing/malformed.
 */
export async function parseBody<T = Record<string, unknown>>(
  req: Request
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
