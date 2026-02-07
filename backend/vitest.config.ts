import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests from source files, not compiled dist
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    // Use ts-node or other TypeScript runner
    globals: true,
  },
});
