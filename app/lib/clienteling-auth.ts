import { createHash } from 'crypto';
import { CLIENTELING_TOKEN_HEADER } from '~/lib/clienteling-token';

/**
 * Server-side authentication for the app's API routes.
 *
 * The clienteling host authenticates the staff user and hands the embedded
 * app an Omneo staff token in the iframe context. The front-end verifies it
 * to gate the UI, but that is only cosmetic: the API routes must re-verify
 * server-side, otherwise anyone can call them directly with a guessed
 * `x-omneo-location-id`. Every app data route calls requireClientelingAuth
 * before doing any work.
 *
 * The token arrives in the `x-omneo-token` header (set by apiHeaders in lib/api-fetch) and
 * is verified against Omneo's /auth/verify. Verification distinguishes three
 * outcomes so a brief Omneo outage does not lock out legitimate staff:
 *   - valid       (200)        -> allow, cache
 *   - invalid     (401/403)    -> deny, evict any cached success (honours
 *                                 revocation)
 *   - unavailable (5xx/network)-> allow only if this token verified within a
 *                                 short grace window, else deny (fail closed
 *                                 for unknown tokens)
 *
 * Successful verifications are cached by a hash of the token so a burst of
 * API calls costs one round-trip, not one per request. The cache is bounded:
 * entries past the grace window are pruned and a hard size cap evicts the
 * least-recently-verified token.
 */

export { CLIENTELING_TOKEN_HEADER };

// Within this window a cached success is trusted without re-verifying.
const FRESH_TTL_MS = 60 * 1000;
// A token that verified within this window is still honoured when Omneo is
// unreachable, so a transient outage does not deny active staff.
const GRACE_MS = 15 * 60 * 1000;
// Hard cap so token rotation cannot grow the cache without bound.
const MAX_ENTRIES = 5000;

type VerifyOutcome = 'valid' | 'invalid' | 'unavailable';

const verifyCache = new Map<string, { ts: number }>();
// Coalesces concurrent misses: a burst of first-time requests for the same
// token shares one in-flight verification instead of each hitting Omneo.
const inflight = new Map<string, Promise<boolean>>();

function tokenKey(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Calls Omneo /auth/verify with the caller's own token and classifies the
 * result by HTTP status (so an outage is distinguishable from a rejection). */
async function callVerify(
  token: string,
  tenant: string
): Promise<VerifyOutcome> {
  try {
    const res = await fetch(
      `https://api.${tenant}.getomneo.com/api/v3/auth/verify`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    );
    if (res.status === 200) return 'valid';
    if (res.status === 401 || res.status === 403) return 'invalid';
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

function enforceLimits(): void {
  const now = Date.now();
  for (const [key, entry] of verifyCache) {
    if (now - entry.ts > GRACE_MS) verifyCache.delete(key);
  }
  while (verifyCache.size > MAX_ENTRIES) {
    const oldest = verifyCache.keys().next().value;
    if (oldest === undefined) break;
    verifyCache.delete(oldest);
  }
}

async function doVerify(
  key: string,
  token: string,
  tenant: string
): Promise<boolean> {
  const outcome = await callVerify(token, tenant);
  inflight.delete(key);

  if (outcome === 'valid') {
    // Re-insert so cache order tracks recency (Map.set keeps the original
    // position for an existing key, which would defeat the size-cap eviction).
    verifyCache.delete(key);
    verifyCache.set(key, { ts: Date.now() });
    enforceLimits();
    return true;
  }
  if (outcome === 'invalid') {
    verifyCache.delete(key);
    return false;
  }
  // unavailable: honour a recently-valid token; deny an unknown one.
  const cached = verifyCache.get(key);
  return Boolean(cached && Date.now() - cached.ts < GRACE_MS);
}

/** Verifies a staff token against Omneo, cached briefly. Never throws. */
export async function verifyClientelingToken(token: string): Promise<boolean> {
  const tenant = process.env.OMNEO_TENANT;
  if (!tenant || !token) return false;

  const key = tokenKey(token);
  const cached = verifyCache.get(key);
  if (cached && Date.now() - cached.ts < FRESH_TTL_MS) {
    return true;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = doVerify(key, token, tenant);
  inflight.set(key, promise);
  return promise;
}

/**
 * Guards an app API route. Returns a 401 Response when the request carries
 * no valid staff token, or null when it is authenticated and the route may
 * proceed. Usage:
 *
 *   const denied = await requireClientelingAuth(request);
 *   if (denied) return denied;
 */
export async function requireClientelingAuth(
  request: Request
): Promise<Response | null> {
  const token = request.headers.get(CLIENTELING_TOKEN_HEADER);
  if (token && (await verifyClientelingToken(token))) {
    return null;
  }
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

/** Test seam: clears the verification cache. */
export function clearClientelingAuthCache(): void {
  verifyCache.clear();
  inflight.clear();
}
