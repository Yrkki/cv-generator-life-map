import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Replaces: specs: ['./src/**/*.e2e-spec.ts']
  testDir: './src',
  testMatch: '**/*.spec.ts',

  // Replaces: jasmineNodeOpts.defaultTimeoutInterval: 30000
  timeout: 30000,

  // Replaces: allScriptsTimeout: 11000
  use: {
    baseURL: process.env['PLAYWRIGHT_TEST_BASE_URL'] ?? 'http://localhost:4200/',
    actionTimeout: 11000,

    // Replaces: directConnect: true (no Selenium hub, direct browser)
    // Replaces: SELENIUM_PROMISE_MANAGER: false (native async/await)
    // Both are the default in Playwright — no extra config needed.
  },

  // Replaces: jasmineNodeOpts.showColors: true
  reporter: [['list', { printSteps: true }]],

  // Replaces: capabilities: { browserName: 'chrome' }
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Replaces: onPrepare with ts-node + tsconfig registration
  // Playwright uses its own TypeScript compilation — no ts-node needed.
  // tsconfig equivalent: see e2e/tsconfig.json

});
