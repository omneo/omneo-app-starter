import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Main app routes - these are wrapped by AuthProvider and AuthGuard
  route("/clienteling", "routes/clienteling/index.tsx"),
  route("/clienteling/block", "routes/clienteling/block.tsx"),
  
  // API Routes - these are NOT wrapped by auth context and can handle their own authentication
  // Every route other than health and webhooks must call requireClientelingAuth.
  route("/api/:tenant/webhooks/omneo", "routes/api/$tenant.webhooks.omneo/route.ts"),
  route("/api/health", "routes/api/health.ts"),
  route("/api/me", "routes/api/me.ts"),
  // ... add more API routes as needed
] satisfies RouteConfig;
