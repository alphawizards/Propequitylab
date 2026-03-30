// @ts-check
/**
 * Authentication setup for Playwright authenticated test suite.
 *
 * Creates a real Clerk session using a sign-in token (Backend API) and saves
 * the browser storage state to tests/e2e/.auth/user.json. Authenticated tests
 * load this state via storageState in playwright.config.js.
 *
 * Requires in .env.playwright:
 *   CLERK_SECRET_KEY      — Clerk Backend API key
 *   CLERK_TEST_USER_ID    — user_xxx ID of the test user
 *   PLAYWRIGHT_FRONTEND_URL
 */

const { test: setup } = require('@playwright/test');
const path = require('path');

const STORAGE_STATE_PATH = path.join(__dirname, '.auth', 'user.json');
const FRONTEND = process.env.PLAYWRIGHT_FRONTEND_URL || 'https://propequitylab.com';
const SECRET = process.env.CLERK_SECRET_KEY;
const USER_ID = process.env.CLERK_TEST_USER_ID;

setup.setTimeout(90_000);

setup('authenticate as test user', async ({ page }) => {
  if (!SECRET || !USER_ID) {
    throw new Error('CLERK_SECRET_KEY and CLERK_TEST_USER_ID must be set in .env.playwright');
  }

  // 1. Create a sign-in token from the Clerk Backend API
  const res = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: USER_ID, expires_in_seconds: 300 }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create sign-in token: ${res.status} ${await res.text()}`);
  }

  const { token } = await res.json();

  // 2. Navigate to login page with the ticket.
  //    Clerk processes the ticket, sets the session, and redirects to /dashboard.
  //    We use 'networkidle' to wait for all Clerk API calls to settle, but catch
  //    the timeout (some Clerk connections stay open) and continue regardless.
  await page.goto(`${FRONTEND}/login?__clerk_ticket=${token}`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  }).catch(() => {
    // networkidle may time out — that's fine, the session is typically set by then
  });

  // 3. Poll for Clerk session — the SDK initializes asynchronously after page load
  const sessionId = await page.waitForFunction(
    () => window.Clerk?.session?.id ?? null,
    { timeout: 30_000 }
  ).then(h => h.jsonValue()).catch(() => null);

  // 4. Verify authentication succeeded
  const finalUrl = page.url();

  if (!sessionId) {
    throw new Error(
      `Sign-in failed — no Clerk session after ticket auth. URL: ${finalUrl}\n` +
      'Check: (1) CLERK_TEST_USER_ID is a valid user, (2) sign-in token API succeeded.'
    );
  }

  console.log(`  ✓ Clerk session: ${sessionId.slice(0, 24)}...`);
  console.log(`  ✓ Authenticated URL: ${finalUrl}`);

  // 5. Save the browser storage state (cookies + localStorage) for reuse in authenticated tests
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  console.log(`  ✓ Auth state saved to ${STORAGE_STATE_PATH}`);
});
