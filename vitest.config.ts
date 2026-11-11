import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    // Node 26 has its own global localStorage, which hides happy-dom's and has no methods
    // unless --localstorage-file is given. Turn it off so tests get happy-dom's storage.
    execArgv: ['--no-experimental-webstorage'],
    setupFiles: './test/setup.ts',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'build', '.react-router'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'build/',
        '.react-router/',
        '**/*.config.{js,ts}',
        '**/types/',
        '**/*.d.ts',
      ],
    },
  },
});
