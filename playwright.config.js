// @ts-check
require('dotenv').config({ path: '.env.playwright' });
const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_URL = process.env.PLAYWRIGHT_FRONTEND_URL || 'https://propequitylab.com';
const API_URL = process.env.PLAYWRIGHT_API_URL || 'https://api.propequitylab.com/api';

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.js',
  reporter: [
    ['html', { outputFolder: 'tests/e2e/playwright-report', open: 'never' }],
    ['junit', { outputFile: 'tests/e2e/results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
