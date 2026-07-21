/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test.ts'],
    slowTestThreshold: 1000,
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './coverage',
      reporter: ['html', 'lcov', 'text-summary'],
      thresholds: {
        statements: 90,
        lines: 90,
        branches: 60,
        functions: 90,
      },
    },
  },
});
