import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Main app routes - these are wrapped by AuthProvider and AuthGuard
  index("routes/clienteling.tsx"),
  
  // API Routes - these are NOT wrapped by auth context and can handle their own authentication
  route("/api/:tenant/webhooks/omneo", "routes/api/$tenant.webhooks.omneo/route.ts"),
  // route("/api/users", "routes/api.users.ts"),
  // route("/api/users/:userId", "routes/api.users.$userId.ts"),
  // route("/api/products", "routes/api.products.ts"),
  // route("/api/auth/verify", "routes/api.auth.verify.ts"),
  // ... add more API routes as needed
] satisfies RouteConfig;
