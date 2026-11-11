import { CLIENTELING_TOKEN_HEADER, getClientelingToken } from '~/lib/clienteling-token';

/**
 * Headers for calls from the embedded app to its own API routes. They carry
 * the verified clienteling staff token so each route can re-verify it
 * server-side with requireClientelingAuth (see lib/clienteling-auth).
 */
export function apiHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  const token = getClientelingToken();
  if (token) headers.set(CLIENTELING_TOKEN_HEADER, token);
  return headers;
}

/** fetch() for the app's own /api routes, with the staff token attached. */
export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { ...init, headers: apiHeaders(init.headers) });
}

/** A failed call to one of the app's /api routes. `status` is 0 when the network failed. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: Record<string, unknown> = {}
  ) {
    super(typeof body.error === 'string' ? body.error : `Request failed (${status})`);
    this.name = 'ApiError';
  }
}

/**
 * An /api route's JSON body, for React Query. A JSON body is sent as such; a non-2xx
 * response or a network failure throws an ApiError.
 */
export async function apiJson<T>(input: string, init: Omit<RequestInit, 'body'> & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set('Content-Type', 'application/json');
  let res: Response;
  try {
    res = await apiFetch(input, { ...rest, headers, ...(json !== undefined && { body: JSON.stringify(json) }) });
  } catch {
    throw new ApiError(0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

type Messages = {
  /** What could not be done, e.g. "Customers could not be loaded". */
  failed: string;
  /** Shown for a 403; defaults to a permission message. */
  forbidden?: string;
};

/**
 * The sentence staff see when a call to the app's API fails. A save that the route
 * refused for a reason it explains (a 4xx with an error message) shows that reason.
 */
export function errorMessage(error: unknown, { failed, forbidden }: Messages): string {
  const status = error instanceof ApiError ? error.status : -1;
  if (status === 403) return forbidden ?? "Your Omneo account isn't allowed to do this. Ask an admin to check your staff permissions.";
  if (status === 0) return `${failed}. Check your connection and try again.`;
  if (error instanceof ApiError && typeof error.body.error === 'string' && ((status >= 400 && status < 500) || error.body.explained === true)) {
    return error.body.error;
  }
  return `${failed}. Try again in a moment.`;
}
