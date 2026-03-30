// @ts-check
require('dotenv').config({ path: '.env.playwright' });
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const FRONTEND_URL = process.env.PLAYWRIGHT_FRONTEND_URL || 'https://propequitylab.com';
const STORAGE_STATE = path.join(__dirname, 'tests/e2e/.auth/user.json');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
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
    // 1. Auth setup — runs first, creates .auth/user.json for authenticated tests
    {
      name: 'auth-setup',
      testMatch: 'tests/e2e/auth.setup.js',
      use: { ...devices['Desktop Chrome'] },
    },

    // 2. Smoke suite — unauthenticated, no storageState, no dependencies
    {
      name: 'smoke',
      testMatch: 'tests/e2e/propequitylab.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },

    // 3. Authenticated suite — loads saved session, depends on auth-setup
    {
      name: 'authenticated',
      testMatch: 'tests/e2e/authenticated.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['auth-setup'],
    },
  ],
});
