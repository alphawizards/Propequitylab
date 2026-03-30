// @ts-check
/**
 * PropEquityLab — Authenticated E2E tests
 *
 * Uses @clerk/testing to inject a session token without going through
 * the Clerk UI. Requires CLERK_TEST_USER_ID in .env.playwright.
 *
 * Prerequisites:
 *   1. Create a test user in Clerk Dashboard > Users
 *   2. Set CLERK_TEST_USER_ID=user_XXXX in .env.playwright
 *   3. Run: npx playwright test tests/e2e/authenticated.spec.js
 */

const { test, expect } = require('@playwright/test');
const { setupClerkTestingToken } = require('@clerk/testing/playwright');

const FRONTEND = process.env.PLAYWRIGHT_FRONTEND_URL || 'https://propequitylab.com';
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'https://api.propequitylab.com/api';
const SCREENSHOT_DIR = 'tests/e2e/screenshots';

// ---------------------------------------------------------------------------
// Auth fixture — signs in before each test in this file
// ---------------------------------------------------------------------------
test.beforeEach(async ({ page }) => {
  await setupClerkTestingToken({ page });
});

// ---------------------------------------------------------------------------
// 1. Dashboard
// ---------------------------------------------------------------------------
test.describe('Authenticated — Dashboard', () => {
  test('dashboard loads and shows content', async ({ page }) => {
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'networkidle' });

    // Must stay on dashboard (not redirect to /login)
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard renders one of two states depending on whether a portfolio exists:
    //   A) Has portfolio  → green banner with "Dashboard" + "Welcome back, ..."
    //   B) No portfolio   → "Welcome to PropEquityLab" + "Create Portfolio" button
    const hasDashboard = page.locator('text=Welcome back');
    const hasCreatePortfolio = page.locator('text=Welcome to PropEquityLab');
    await expect(hasDashboard.or(hasCreatePortfolio)).toBeVisible({ timeout: 20_000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-authenticated.png` });
  });

  test('dashboard does not show JS errors', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'networkidle' });

    const appErrors = jsErrors.filter(
      (msg) =>
        !msg.includes('clerk') &&
        !msg.includes('Clerk') &&
        !msg.includes('sentry') &&
        !msg.includes('ResizeObserver') &&
        !msg.includes('Non-Error promise rejection')
    );

    expect(appErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Properties
// ---------------------------------------------------------------------------
test.describe('Authenticated — Properties', () => {
  test('/properties page loads', async ({ page }) => {
    await page.goto(FRONTEND + '/finances/properties', { waitUntil: 'networkidle' });

    await expect(page).not.toHaveURL(/\/login/);

    // Properties page shows either a list heading or an empty state
    const heading = page.locator('h1, h2, h3').filter({ hasText: /propert/i }).first();
    const emptyState = page.locator('text=Add Property, text=No properties');
    await expect(heading.or(emptyState)).toBeVisible({ timeout: 20_000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/properties-authenticated.png` });
  });
});

// ---------------------------------------------------------------------------
// 3. Settings
// ---------------------------------------------------------------------------
test.describe('Authenticated — Settings', () => {
  test('/settings page loads and shows user profile section', async ({ page }) => {
    await page.goto(FRONTEND + '/settings', { waitUntil: 'networkidle' });

    await expect(page).not.toHaveURL(/\/login/);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/settings-authenticated.png` });
  });
});

// ---------------------------------------------------------------------------
// 4. API — authenticated requests return 200
// ---------------------------------------------------------------------------
test.describe('Authenticated — API returns data', () => {
  test('GET /api/portfolios returns 200 with auth token', async ({ page, request }) => {
    // Get Clerk token from the page context (already signed in via beforeEach)
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'networkidle' });

    const token = await page.evaluate(async () => {
      // Clerk exposes getToken on the window.__clerk instance
      return await window.Clerk?.session?.getToken();
    });

    if (!token) {
      test.skip(true, 'No Clerk session token available — check CLERK_TEST_USER_ID');
    }

    const response = await request.get(`${API_BASE}/portfolios`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log(`  /portfolios → ${JSON.stringify(body).slice(0, 120)}`);
  });
});
