/**
 * The verified clienteling staff token for this browser session.
 *
 * The AuthProvider publishes it here once the iframe context is verified, and
 * apiHeaders (lib/api-fetch) reads it so every API call carries the token for server-side
 * re-verification (see lib/clienteling-auth). Module-scoped rather than React
 * state so non-component callers (fetch helpers) can reach it.
 */

/** Header the verified staff token travels in. Defined here (client-safe) so
 * apiHeaders can reference it without importing the server-only verifier. */
export const CLIENTELING_TOKEN_HEADER = 'x-omneo-token';

let currentToken: string | null = null;

export function setClientelingToken(token: string | null): void {
  currentToken = token;
}

export function getClientelingToken(): string | null {
  return currentToken;
}
