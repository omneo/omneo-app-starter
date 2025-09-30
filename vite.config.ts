import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { omneoDevEnvironment } from "./plugins/omneo-dev-environment";

export default defineConfig({
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(), 
    // Combined plugin that handles both ngrok tunnel and omneo management
    omneoDevEnvironment()
  ],
  server: {
    allowedHosts: true
  }
});
