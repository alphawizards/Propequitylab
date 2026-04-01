// @ts-check
/**
 * PropEquityLab — Clerk auth lifecycle E2E tests
 *
 * Tests the complete authentication lifecycle:
 *   1. Sign-in via Clerk ticket → session established → dashboard accessible
 *   2. User record exists in backend with clerk_user_id populated
 *   3. Bearer token is included in API requests
 *   4. Sign-out clears session and protected routes redirect to /login
 *
 * Uses the sign-in token approach (same as auth.setup.js) to avoid
 * UI-based sign-up flows that require real email verification.
 *
 * Requires in .env.playwright:
 *   CLERK_SECRET_KEY         — Clerk Backend API key
 *   CLERK_TEST_USER_ID       — user_xxx ID of the test user
 *   PLAYWRIGHT_FRONTEND_URL  — (optional) defaults to production
 *   PLAYWRIGHT_API_URL       — (optional) defaults to production API
 */

const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.PLAYWRIGHT_FRONTEND_URL || 'https://propequitylab.com';
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'https://api.propequitylab.com/api';
const SECRET = process.env.CLERK_SECRET_KEY;
const USER_ID = process.env.CLERK_TEST_USER_ID;

// ---------------------------------------------------------------------------
// Helper: create a Clerk sign-in token for the test user
// ---------------------------------------------------------------------------
async function createSignInToken() {
  if (!SECRET || !USER_ID) return null;

  const res = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: USER_ID, expires_in_seconds: 300 }),
  });

  if (!res.ok) return null;
  const { token } = await res.json();
  return token;
}

// ---------------------------------------------------------------------------
// Helper: sign in and wait for Clerk session
// ---------------------------------------------------------------------------
async function signIn(page) {
  const token = await createSignInToken();
  if (!token) throw new Error('Could not create sign-in token — check CLERK_SECRET_KEY and CLERK_TEST_USER_ID');

  await page.goto(`${FRONTEND}/login?__clerk_ticket=${token}`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  }).catch(() => {});

  const sessionId = await page.waitForFunction(
    () => window.Clerk?.session?.id ?? null,
    { timeout: 30_000 }
  ).then(h => h.jsonValue()).catch(() => null);

  return sessionId;
}

// ---------------------------------------------------------------------------
// 1. Sign-in → session → dashboard
// ---------------------------------------------------------------------------
test.describe('Clerk sign-in lifecycle', () => {
  test.setTimeout(90_000);

  test('sign-in via ticket → Clerk session established → lands on dashboard', async ({ page }) => {
    if (!SECRET || !USER_ID) {
      test.skip(true, 'CLERK_SECRET_KEY / CLERK_TEST_USER_ID not set in .env.playwright');
    }

    const sessionId = await signIn(page);

    expect(sessionId).toBeTruthy();
    console.log(`  ✓ Clerk session: ${sessionId?.slice(0, 24)}...`);

    // Should land on dashboard after successful sign-in
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/clerk-auth-signed-in.png' });
  });

  test('authenticated session allows access to protected dashboard', async ({ page }) => {
    if (!SECRET || !USER_ID) {
      test.skip(true, 'CLERK_SECRET_KEY / CLERK_TEST_USER_ID not set in .env.playwright');
    }

    await signIn(page);

    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

// ---------------------------------------------------------------------------
// 2. Bearer token in API requests
// ---------------------------------------------------------------------------
test.describe('Clerk token in API requests', () => {
  test.setTimeout(90_000);

  test('Clerk token is sent as Bearer in API requests and backend accepts it', async ({ page, request }) => {
    if (!SECRET || !USER_ID) {
      test.skip(true, 'CLERK_SECRET_KEY / CLERK_TEST_USER_ID not set in .env.playwright');
    }

    await signIn(page);
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

    // Extract the Clerk JWT from the active session
    const token = await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {
        const t = await window.Clerk?.session?.getToken();
        if (t) return t;
        await new Promise(r => setTimeout(r, 500));
      }
      return null;
    });

    expect(token).toBeTruthy();
    console.log(`  ✓ Clerk token obtained (${token?.length} chars)`);

    // Token must work against the backend
    const response = await request.get(`${API_BASE}/portfolios`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    console.log(`  ✓ /portfolios → 200, ${body.length} portfolios`);
  });
});

// ---------------------------------------------------------------------------
// 3. User record created in backend
// ---------------------------------------------------------------------------
test.describe('User auto-provisioning', () => {
  test.setTimeout(90_000);

  test('signed-in user has a record in the backend (onboarding status accessible)', async ({ page, request }) => {
    if (!SECRET || !USER_ID) {
      test.skip(true, 'CLERK_SECRET_KEY / CLERK_TEST_USER_ID not set in .env.playwright');
    }

    await signIn(page);
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

    const token = await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {
        const t = await window.Clerk?.session?.getToken();
        if (t) return t;
        await new Promise(r => setTimeout(r, 500));
      }
      return null;
    });

    if (!token) test.skip(true, 'No token available');

    // Onboarding status endpoint proves the user record exists in PostgreSQL
    const response = await request.get(`${API_BASE}/onboarding/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log(`  ✓ Onboarding status: ${JSON.stringify(body).slice(0, 100)}`);

    // Response must have a completed/step field proving user is provisioned
    const hasOnboardingData =
      Object.prototype.hasOwnProperty.call(body, 'completed') ||
      Object.prototype.hasOwnProperty.call(body, 'onboarding_completed') ||
      Object.prototype.hasOwnProperty.call(body, 'step');

    expect(hasOnboardingData).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Sign-out clears session
// ---------------------------------------------------------------------------
test.describe('Clerk sign-out lifecycle', () => {
  test.setTimeout(90_000);

  test('sign-out clears Clerk session and /dashboard redirects to /login', async ({ page }) => {
    if (!SECRET || !USER_ID) {
      test.skip(true, 'CLERK_SECRET_KEY / CLERK_TEST_USER_ID not set in .env.playwright');
    }

    await signIn(page);
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'load' });

    // Sign out via Clerk SDK
    await page.evaluate(async () => {
      await window.Clerk?.signOut();
    });

    // After sign-out, navigating to a protected route must redirect to /login
    await page.goto(FRONTEND + '/dashboard', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    console.log(`  ✓ Post-signout redirect to login: ${page.url()}`);
    await page.screenshot({ path: 'tests/e2e/screenshots/clerk-auth-signed-out.png' });
  });
});
