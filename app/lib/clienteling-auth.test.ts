import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  requireClientelingAuth,
  verifyClientelingToken,
  clearClientelingAuthCache,
  CLIENTELING_TOKEN_HEADER,
} from './clienteling-auth';

const fetchMock = vi.fn();

function status(code: number): Response {
  return { status: code } as Response;
}

function request(token?: string): Request {
  return new Request('http://localhost/api/anything', {
    headers: token ? { [CLIENTELING_TOKEN_HEADER]: token } : {},
  });
}

describe('clienteling auth', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.useFakeTimers();
    clearClientelingAuthCache();
    process.env.OMNEO_TENANT = 'test-tenant';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('denies a request with no token', async () => {
    const denied = await requireClientelingAuth(request());
    expect(denied?.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('denies a token Omneo rejects (401)', async () => {
    fetchMock.mockResolvedValue(status(401));
    const denied = await requireClientelingAuth(request('bad-token'));
    expect(denied?.status).toBe(401);
  });

  it('allows a token Omneo accepts (200)', async () => {
    fetchMock.mockResolvedValue(status(200));
    const denied = await requireClientelingAuth(request('good-token'));
    expect(denied).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/verify');
  });

  it('caches a successful verification (one round-trip per token)', async () => {
    fetchMock.mockResolvedValue(status(200));
    expect(await verifyClientelingToken('tok')).toBe(true);
    expect(await verifyClientelingToken('tok')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent first-time verifications into one round-trip', async () => {
    let resolve!: (v: Response) => void;
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)));

    const calls = Promise.all([
      verifyClientelingToken('tok'),
      verifyClientelingToken('tok'),
      verifyClientelingToken('tok'),
    ]);
    resolve(status(200));

    expect(await calls).toEqual([true, true, true]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not cache failures', async () => {
    fetchMock.mockResolvedValueOnce(status(401)).mockResolvedValueOnce(status(200));
    expect(await verifyClientelingToken('tok')).toBe(false);
    expect(await verifyClientelingToken('tok')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('denies when the tenant is not configured', async () => {
    delete process.env.OMNEO_TENANT;
    expect(await verifyClientelingToken('tok')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('honours a recently-valid token when Omneo is unreachable (grace)', async () => {
    fetchMock.mockResolvedValueOnce(status(200));
    expect(await verifyClientelingToken('tok')).toBe(true);

    // Past the fresh window: re-verify runs, but Omneo is down (network error).
    vi.advanceTimersByTime(2 * 60 * 1000);
    fetchMock.mockRejectedValue(new Error('network'));
    expect(await verifyClientelingToken('tok')).toBe(true);

    // Past the grace window: the stale entry is no longer honoured.
    vi.advanceTimersByTime(20 * 60 * 1000);
    fetchMock.mockRejectedValue(new Error('network'));
    expect(await verifyClientelingToken('tok')).toBe(false);
  });

  it('denies an unknown token during an outage (fail closed)', async () => {
    fetchMock.mockResolvedValue(status(503));
    expect(await verifyClientelingToken('never-seen')).toBe(false);
  });

  it('revokes a token even mid-grace (invalid beats grace)', async () => {
    fetchMock.mockResolvedValueOnce(status(200));
    expect(await verifyClientelingToken('tok')).toBe(true);

    vi.advanceTimersByTime(2 * 60 * 1000);
    fetchMock.mockResolvedValue(status(401));
    expect(await verifyClientelingToken('tok')).toBe(false);
    // The now-evicted token is not grace-honoured on a later outage.
    fetchMock.mockRejectedValue(new Error('network'));
    expect(await verifyClientelingToken('tok')).toBe(false);
  });
});
