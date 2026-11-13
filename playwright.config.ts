import { defineConfig, devices } from '@playwright/test';
if (!process.env.TEST_BASE_URL || !process.env.TEST_DATABASE_URL?.includes('/reviravolta_test_')) throw new Error('Execute npm run test:e2e para usar uma base isolada.');
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: process.env.TEST_BASE_URL, ...devices['Desktop Chrome'], channel: 'chrome', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  reporter: [['list'], ['html', { open: 'never' }]],
});
