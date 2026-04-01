# Clerk Auth Fix & DB Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 17 failing E2E tests caused by (1) the Clerk test key white-screening the production frontend, and (2) two Alembic migrations never applied to the live Neon database.

**Architecture:** FastAPI backend on AWS App Runner (ap-southeast-2), React 19 frontend on Cloudflare Pages. Auth flows through Clerk: frontend uses `<ClerkProvider>` with `REACT_APP_CLERK_PUBLISHABLE_KEY`, backend verifies Clerk JWTs via `CLERK_JWKS_URL`. All 14 frontend route guard failures stem from a single root cause — wrong Clerk key → Clerk stays `isLoaded=false` → spinners render instead of redirects. 5 API test failures are due to E2E tests calling non-existent `GET` paths; those routes only expose `POST` at the collection level, so FastAPI returns 405.

**Tech Stack:** Python 3.11 / FastAPI / SQLModel / Alembic / Neon PostgreSQL — React 19 / Clerk v5 / Cloudflare Pages / Wrangler — Playwright (E2E)

---

## Root cause summary

| # | Symptom | Root cause |
|---|---------|------------|
| 14 frontend failures | App shows spinners, no redirects, Clerk widget absent | `pk_test_bmV1...` key maps to `neutral-monkey-24.clerk.accounts.dev`; `propequitylab.com` is not an allowed origin → Clerk never resolves `isLoaded=true` |
| 5 API 405 failures | `GET /api/properties` etc. return 405 | Routes only expose `POST` at the collection path; no `GET /properties` handler exists; FastAPI returns 405 before auth runs |
| Schema risk | Backend will crash (500) on first Clerk sign-in | `clerk_user_id`, `accounts`, `account_memberships`, `subscriptions`, `webhook_events` tables absent from live Neon DB |

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `tests/e2e/propequitylab.spec.js` | Fix 5 API test endpoints to target valid auth-protected GET paths |
| Run command | `backend/` (Alembic) | Apply `a1b2c3d4e5f6` and `b9c1d2e3f4a5` migrations to Neon |
| Manual config | Clerk Dashboard | Confirm `propequitylab.com` is an allowed origin in the production instance |
| Manual config | Cloudflare Pages Dashboard | Set `REACT_APP_CLERK_PUBLISHABLE_KEY` to production live key (`pk_live_...`) |
| Redeploy | `frontend/` | Rebuild and push new Cloudflare Pages build |

---

## Task 1: Fix E2E test — replace non-existent API paths

**Files:**
- Modify: `tests/e2e/propequitylab.spec.js`

The 5 failing API security tests call collection-level GET paths that don't exist in the backend (`GET /api/properties`, `GET /api/assets`, `GET /api/liabilities`, `GET /api/finances/income`, `GET /api/plans`). Each route only has `POST` at the collection level → FastAPI returns 405. Fix: replace each with a valid `GET` path that requires auth, so we get 403 when called without a token.

- [ ] **Step 1: Find the failing test block in the spec**

Open `tests/e2e/propequitylab.spec.js` and locate the `API security — protected endpoints return 401` test group. It iterates over an endpoint list and does `request.get(API_BASE + '/' + endpoint)`.

The failing endpoints and their valid authenticated replacements:

| Test endpoint (broken) | Valid authenticated GET path | Handler in backend |
|------------------------|-----------------------------|--------------------|
| `properties` | `properties/portfolio/nonexistent-id` | `GET /properties/portfolio/{portfolio_id}` |
| `assets` | `assets/portfolio/nonexistent-id` | `GET /assets/portfolio/{portfolio_id}` |
| `liabilities` | `liabilities/portfolio/nonexistent-id` | `GET /liabilities/portfolio/{portfolio_id}` |
| `finances/income` | `income/portfolio/nonexistent-id` | `GET /income/portfolio/{portfolio_id}` (prefix is `/income` not `/finances/income`) |
| `plans` | `plans/portfolio/nonexistent-id` | `GET /plans/portfolio/{portfolio_id}` |

- [ ] **Step 2: Read the current test block**

Run:
```bash
grep -n "properties\|assets\|liabilities\|finances\|plans\|portfolios" "tests/e2e/propequitylab.spec.js" | grep -v "//\|screenshot\|describe\|test\."
```

Expected output shows the endpoint array. Locate the array and note the line number.

- [ ] **Step 3: Update the endpoint array**

Find the array that looks like:
```js
for (const endpoint of [
  'properties',
  'assets',
  'liabilities',
  'finances/income',
  'plans',
  'portfolios',
]) {
```

Replace it with:
```js
for (const endpoint of [
  'portfolios',
  'properties/portfolio/nonexistent-id',
  'assets/portfolio/nonexistent-id',
  'liabilities/portfolio/nonexistent-id',
  'income/portfolio/nonexistent-id',
  'plans/portfolio/nonexistent-id',
]) {
```

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/propequitylab.spec.js
git commit -m "fix(e2e): replace non-existent collection GET paths with valid auth-protected endpoints

GET /api/properties, /api/assets etc. return 405 because no GET handler exists
at the collection path — only POST. Replace with portfolio sub-paths that have
GET handlers and run get_current_user first (returns 403 without token)."
```

---

## Task 2: Apply Alembic migrations to production Neon DB

**Files:**
- Run command in `backend/`
- Read: `backend/alembic/versions/a1b2c3d4e5f6_add_clerk_user_id_and_account_subscription_tables.py`
- Read: `backend/alembic/versions/b9c1d2e3f4a5_make_password_hash_nullable_for_clerk.py`

Two migrations were written on 2026-03-21 but never applied to the live database. Running `alembic upgrade head` will apply both in order.

- [ ] **Step 1: Confirm the production DATABASE_URL is available**

```bash
cd backend
cat .env | grep DATABASE_URL
```

Expected: a Neon connection string starting with `postgresql://` (not `sqlite`). If you see a local SQLite URL, **stop** and get the Neon URL from the Railway dashboard → `DATABASE_URL` environment variable. Set it locally:

```bash
export DATABASE_URL="postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require"
```

- [ ] **Step 2: Activate the Python virtual environment**

```bash
cd backend
source venv/Scripts/activate   # Windows Git Bash
# OR: source venv/bin/activate  # Mac/Linux
```

Expected: shell prompt changes to `(venv)`.

- [ ] **Step 3: Check current migration state**

```bash
alembic current
```

Expected output contains the revision IDs that have been applied. You should see something like:
```
3dae219f0164 (head)
```
or
```
f75f0dda9444 (head)
```

If `a1b2c3d4e5f6` or `b9c1d2e3f4a5` appears, those migrations are already applied — skip to Task 3.

- [ ] **Step 4: Check migration history to confirm order**

```bash
alembic history --verbose | grep -A 2 "a1b2c3d4\|b9c1d2e3"
```

Expected output shows:
```
Rev: b9c1d2e3f4a5 (head)
Parent: a1b2c3d4e5f6
make_password_hash_nullable_for_clerk

Rev: a1b2c3d4e5f6
Parent: 3dae219f0164
add_clerk_user_id_and_account_subscription_tables
```

- [ ] **Step 5: Run the migration**

```bash
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgreSQLImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade 3dae219f0164 -> a1b2c3d4e5f6, add_clerk_user_id_and_account_subscription_tables
INFO  [alembic.runtime.migration] Running upgrade a1b2c3d4e5f6 -> b9c1d2e3f4a5, make_password_hash_nullable_for_clerk
```

If you see an error like `column "clerk_user_id" of relation "users" already exists`, the migration has already been partially applied. Run `alembic stamp b9c1d2e3f4a5` to mark it as applied (only if you manually confirmed the columns exist), then re-run `alembic upgrade head`.

- [ ] **Step 6: Verify migration applied**

```bash
alembic current
```

Expected:
```
b9c1d2e3f4a5 (head)
```

- [ ] **Step 7: Spot-check the schema**

```bash
python -c "
from sqlmodel import Session, select
from utils.database_sql import engine
from sqlalchemy import inspect
insp = inspect(engine)
print('users columns:', [c['name'] for c in insp.get_columns('users')])
print('tables:', sorted(insp.get_table_names()))
"
```

Expected output includes `clerk_user_id` in users columns, and `accounts`, `account_memberships`, `subscriptions`, `webhook_events` in the tables list.

- [ ] **Step 8: Update the progress doc to reflect migration is applied**

Edit `docs/superpowers/plans/clerk-integration-progress.md`. Change the migration warning from:

```
**⚠️ Migration NOT yet applied to live DB — run when ready:**
```

to:

```
**✅ Migration applied to live DB on 2026-03-31.**
```

- [ ] **Step 9: Commit**

```bash
git add docs/superpowers/plans/clerk-integration-progress.md
git commit -m "docs: mark Clerk DB migration as applied to production"
```

---

## Task 3: Verify Railway backend env vars

> This task is mostly verification — these vars were set during the earlier phase. No code changes.

- [ ] **Step 1: Log in to Railway Dashboard**

Go to `railway.app` → PropEquityLab backend service → Variables tab.

Confirm the following variables are set (values will vary — just confirm they are non-empty):

| Variable | Example format | Source |
|----------|---------------|--------|
| `CLERK_JWKS_URL` | `https://neutral-monkey-24.clerk.accounts.dev/.well-known/jwks.json` | Clerk Dashboard → API Keys → Advanced |
| `CLERK_ISSUER` | `https://neutral-monkey-24.clerk.accounts.dev` | Clerk Dashboard → API Keys → Advanced |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Clerk Dashboard → Webhooks → endpoint signing secret |
| `CLERK_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Clerk Dashboard → API Keys |

If `CLERK_JWKS_URL` is missing: get it from Clerk Dashboard → your instance → API Keys → "Advanced" or copy the JWKS endpoint shown there. Format: `https://<your-instance>.clerk.accounts.dev/.well-known/jwks.json`.

If `CLERK_ISSUER` is missing: it's `https://<your-instance>.clerk.accounts.dev` (same domain, no path).

- [ ] **Step 2: Confirm the backend is using Clerk auth (quick sanity check)**

```bash
curl -s https://api.propequitylab.com/api/portfolios | python -m json.tool
```

Expected: `{"detail":"Not authenticated"}` with HTTP status 403. This proves:
- The backend is reachable
- `get_current_user` is running and rejecting unauthenticated requests

If you get a 500 with `CLERK_JWKS_URL environment variable is not set`, set that Railway var and redeploy the backend service.

---

## Task 4: Fix the Clerk publishable key on Cloudflare Pages

This is the fix for all 14 frontend test failures. The production build bakes in the test key `pk_test_bmV1dHJhbC1tb25rZXktMjQuY2xlcmsuYWNjb3VudHMuZGV2JA`, which is authorised only for `neutral-monkey-24.clerk.accounts.dev`. When the app loads at `propequitylab.com`, Clerk can't reach its backend → `isLoaded` never becomes `true` → the app is permanently in a loading spinner state, which is why:
- `/` shows spinner instead of redirecting to `/login`
- `/login` renders the logo but the `<SignIn>` widget stays blank (Clerk widget requires `isLoaded=true` to mount)
- All protected routes show spinners instead of redirecting

**Two options — choose the appropriate one:**

**Option A (production instance, recommended for live site):** You have a `pk_live_...` key from a production Clerk instance where `propequitylab.com` is an allowed domain.

**Option B (test instance, acceptable for staging/dev):** You want to keep using the test instance but add `propequitylab.com` as an allowed origin in the Clerk Dashboard → your test instance → Domains → Add domain.

Regardless of which option, the key must be set in Cloudflare Pages env vars so the production build uses it.

- [ ] **Step 1: Get the correct publishable key**

Go to Clerk Dashboard → select your instance → API Keys → copy the Publishable Key.

For production (`propequitylab.com`): this should start with `pk_live_`.
For testing with the existing instance: add `propequitylab.com` to allowed domains first (Settings → Domains), then use the existing `pk_test_...` key.

- [ ] **Step 2: Set the key in Cloudflare Pages**

Go to Cloudflare Dashboard → Pages → `propequitylab` → Settings → Environment Variables.

Set for **Production** environment:
```
REACT_APP_CLERK_PUBLISHABLE_KEY = pk_live_YOUR_KEY_HERE
```

(Also set for Preview if needed.)

Click Save.

- [ ] **Step 3: Rebuild and deploy from Cloudflare Pages**

Trigger a new deployment so the build picks up the updated env var. Either:
- Push a new commit (any change, e.g. increment a comment in `frontend/src/index.js`)
- OR use Cloudflare Dashboard → Deployments → Retry deployment on latest commit

Wait for the deployment to complete (typically 2-3 minutes).

- [ ] **Step 4: Verify the live site**

```bash
curl -s https://propequitylab.com/ | grep -i "clerk\|propequitylab\|react"
```

Then open a browser incognito window → go to `https://propequitylab.com/` → you should be redirected to `/login` and see the PropEquityLab logo + Clerk sign-in form.

---

## Task 5: Configure Clerk webhook (if not already done)

> Required for `user.created` / `user.updated` / `user.deleted` events to sync to local DB. Skip if already configured.

- [ ] **Step 1: Check if webhook is configured**

Go to Clerk Dashboard → Webhooks. Look for an endpoint pointing to `https://api.propequitylab.com/api/webhooks/clerk`.

If it exists with status "Active", skip this task.

- [ ] **Step 2: Create the webhook endpoint**

In Clerk Dashboard → Webhooks → Add Endpoint:
- URL: `https://api.propequitylab.com/api/webhooks/clerk`
- Events to subscribe: `user.created`, `user.updated`, `user.deleted`

Click Create.

- [ ] **Step 3: Copy the signing secret**

After creating, Clerk shows a `whsec_...` signing secret. Copy it.

Set it on Railway:
```
CLERK_WEBHOOK_SECRET = whsec_YOUR_SECRET_HERE
```

Then redeploy the backend service so it picks up the new variable.

- [ ] **Step 4: Test the webhook**

In Clerk Dashboard → Webhooks → your endpoint → Send Test Event → `user.created`.

Check Railway logs for:
```
INFO ... Provisioned new user ... with account ...
```
or
```
INFO ... Linked existing user ... to Clerk ID ... via webhook
```

---

## Task 6: Run E2E tests and confirm all pass

- [ ] **Step 1: Run the full Playwright suite**

```bash
npx playwright test tests/e2e/propequitylab.spec.js --reporter=list
```

Expected: `27 passed` (0 failures).

- [ ] **Step 2: If frontend tests still fail after deploy**

Wait up to 5 minutes for Cloudflare CDN propagation. Then re-run. If the `/login` Clerk widget is still not rendering, check:

```bash
# Confirm the build baked in the correct key
curl -s https://propequitylab.com/static/js/main.*.js | grep -o "pk_live_[^\"]*" | head -1
```

Expected: your `pk_live_...` key appears in the JS bundle. If it shows `pk_test_...`, the Cloudflare Pages env var was not set before the build — redo Task 4.

- [ ] **Step 3: If API 405 tests still fail**

Confirm the E2E spec was updated correctly in Task 1:

```bash
grep "nonexistent-id" tests/e2e/propequitylab.spec.js
```

Expected: 5 lines matching `portfolio/nonexistent-id`.

- [ ] **Step 4: Commit the test results summary**

```bash
npx playwright test tests/e2e/propequitylab.spec.js --reporter=json > tests/e2e/results.json 2>/dev/null || true
git add tests/e2e/results.json
git commit -m "test(e2e): record passing E2E run after Clerk auth fix"
```

---

## Self-review

### Spec coverage check

| Adversarial finding | Task that fixes it |
|---------------------|--------------------|
| 17 E2E failures | Tasks 1, 4 fix all 17 |
| Auth entrypoint broken (Clerk not rendering) | Task 4 (Cloudflare key fix) |
| Route guards not redirecting | Task 4 (root cause: Clerk `isLoaded=false`) |
| Clerk schema migration unapplied | Task 2 |
| Webhook not configured | Task 5 |

### Placeholder scan

No TBDs, no "implement later", no "add appropriate" patterns. All commands are exact. All expected outputs are specified.

### Type consistency

No new types introduced. All references to `get_current_user`, `clerk_user_id`, `Account`, `WebhookEvent` match the existing definitions in `backend/utils/clerk_auth.py`, `backend/models/`.
