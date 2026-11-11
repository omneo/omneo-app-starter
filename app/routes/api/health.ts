// Unauthenticated liveness check for the Cloud Run smoke test and uptime check.
export const loader = () =>
  Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
