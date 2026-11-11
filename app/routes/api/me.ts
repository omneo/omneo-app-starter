import type { LoaderFunctionArgs } from 'react-router';
import { requireClientelingAuth } from '~/lib/clienteling-auth';

// Example protected route: every app API route starts with requireClientelingAuth
// so it cannot be called without a staff token Omneo still accepts.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const denied = await requireClientelingAuth(request);
  if (denied) return denied;

  return Response.json({ ok: true, tenant: process.env.OMNEO_TENANT });
};
