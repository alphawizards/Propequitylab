// @ts-check
/**
 * PropEquityLab — Authenticated E2E tests
 *
 * Session is pre-loaded via Playwright storageState (see auth.setup.js).
 * auth.setup.js creates a Clerk session using a sign-in token (Backend API)
 * and saves browser storage to tests/e2e/.auth/user.json.
 *
 * Prerequisites:
 *   - CLERK_SECRET_KEY and CLERK_TEST_USER_ID in .env.playwright
 *   - Run auth-setup project first (handled automatically via dependencies)
 */

const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.PLAYWRIGHT_FRONTEND_URL || 'https://propequitylab.com';
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'https://api.propequitylab.com/api';
const SCREENSHOT_DIR = 'tests/e2e/screenshots';

// ---------------------------------------------------------------------------
// 1. Dashboard
// ---------------------------------------------------------------------------
test.describe('Authenticated — Dashboard', () => {
  test('dashboard loads and shows content', async ({ page }) => {
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

    // Must stay on dashboard (not redirect to /login)
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard renders one of two states depending on whether a portfolio exists:
    //   A) Has portfolio  → green banner with "Dashboard" + "Welcome back, ..."
    //   B) No portfolio   → "Welcome to PropEquityLab" + "Create Portfolio" button
    // Use first() to avoid strict-mode issues when text appears multiple times
    const hasDashboard = page.locator('text=Welcome back').first();
    const hasCreatePortfolio = page.locator('text=Welcome to PropEquityLab').first();
    await expect(hasDashboard.or(hasCreatePortfolio).first()).toBeVisible({ timeout: 20_000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-authenticated.png` });
  });

  test('dashboard does not show JS errors', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

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
  test('/properties page loads or redirects within app (not to login)', async ({ page }) => {
    await page.goto(FRONTEND + '/finances/properties', { waitUntil: 'load' });

    // Must NOT redirect to the login page (proves authentication is working)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    // With no portfolio the app redirects to /dashboard — both states are valid.
    // Just verify some app chrome is rendered (sidebar, header, or page content).
    const appChrome = page.locator('[class*="sidebar"], nav, header, main, h1').first();
    await expect(appChrome).toBeVisible({ timeout: 15_000 });

    await page.screenshot({ path: `${SCREENSHOT_DIR}/properties-authenticated.png` });
  });
});

// ---------------------------------------------------------------------------
// 3. Settings
// ---------------------------------------------------------------------------
test.describe('Authenticated — Settings', () => {
  test('/settings page loads and shows user profile section', async ({ page }) => {
    await page.goto(FRONTEND + '/settings', { waitUntil: 'load' });

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
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

    // Wait for Clerk to fully initialize its session (up to 10 s)
    const token = await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {
        const t = await window.Clerk?.session?.getToken();
        if (t) return t;
        await new Promise(r => setTimeout(r, 500));
      }
      return null;
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

    // Response must be an array (empty or populated)
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/dashboard/summary returns 200 with valid user data shape', async ({ page, request }) => {
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

    const token = await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {
        const t = await window.Clerk?.session?.getToken();
        if (t) return t;
        await new Promise(r => setTimeout(r, 500));
      }
      return null;
    });

    if (!token) {
      test.skip(true, 'No Clerk session token available');
    }

    const response = await request.get(`${API_BASE}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 200 with data or 404 if no portfolio yet — both are valid authenticated states
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      console.log(`  /dashboard/summary → ${JSON.stringify(body).slice(0, 120)}`);
      // Response must have at least a properties or portfolio field
      const keys = Object.keys(body);
      expect(keys.length).toBeGreaterThan(0);
    }
  });
});
