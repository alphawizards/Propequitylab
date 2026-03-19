# Agent Handoff — PropEquityLab Test Suite
**Date:** 2026-03-18
**Project root:** `C:\Users\ckr_4\01 Projects\Propequitylab`
**Live site:** https://propequitylab.com
**Test credentials:** `premium@test.propequitylab.com` / `TestPass123!`

---

## What Was Completed This Session

### ✅ Task 0 — theme-color fix (DONE)
**File:** `frontend/public/index.html:6`
Changed `<meta name="theme-color" content="#1e40af" />` → `content="#059669"` (emerald-600 brand color for mobile browser toolbar). **Still needs frontend redeploy:**
```bash
cd frontend && npm run build
npx wrangler pages deploy build
```

### ✅ Task 0b — pytest infrastructure fixes (DONE)
Two files were created/modified to make the test suite runnable:
- **`pytest.ini`** (new) — added `python_files = test_*.py legacy_test_*.py` so `legacy_test_*.py` files are discovered (they were previously invisible to pytest)
- **`tests/integration/test_health.py`** — updated stale assertion to match current health endpoint response shape (endpoint now returns `components` object + `status` can be `"degraded"` locally since no local Postgres)

---

## What Still Needs To Be Done

### ❌ Task 1 — Visual Design Check (BLOCKED — Bowser not installed)
**Bowser** (`playwright-bowser` skill, `@bowser-qa-agent`) is not installed.

**How to install Bowser:**
```bash
# Clone bowser repo
git clone https://github.com/disler/bowser.git C:\Temp\bowser

# Copy its .claude/ contents into the project (merge, don't overwrite)
# Specifically copy: .claude/skills/, .claude/agents/, .claude/commands/
# The project already has .claude/ with its own skills — merge carefully

# Install Playwright CLI
npm install -g @playwright/cli@latest

# Install just (command runner used by justfile)
# On Windows, download from: https://github.com/casey/just/releases
# Or: winget install just
```

**After installing Bowser, run Task 1:**
```bash
cd "C:\Users\ckr_4\01 Projects\Propequitylab"
claude --dangerously-skip-permissions --model opus "/playwright-bowser (headed: true) Navigate to https://propequitylab.com. Login with email premium@test.propequitylab.com and password TestPass123!. Once logged in, verify ALL of the following design checks and report PASS or FAIL for each: 1) Page background is warm white (roughly #FAFAF9) - NOT dark navy or blue. 2) Primary CTA buttons are emerald/green colored (roughly #059669 / emerald-600). 3) Sidebar has white background with green left-border indicator on active nav item. 4) Font appears to be Plus Jakarta Sans (modern, clean geometric sans-serif). 5) No lime-green or dark-navy (#1a1f36) colors visible anywhere in the UI. 6) Footer is warm white background (matches page), not dark. Take a full-page screenshot of the dashboard and a screenshot of the sidebar. Summarize overall PASS/FAIL verdict."
```
**Pass criteria:** All 6 visual checks PASS.

---

### ❌ Task 2 — Onboarding Wizard E2E (BLOCKED — Bowser not installed)
**After Bowser is installed:**

First reset onboarding via DevTools console (F12) after logging in:
```javascript
fetch('https://api.propequitylab.com/api/onboarding/reset',{method:'POST',headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(r=>r.json()).then(d=>{console.log(d);location.href='/onboarding'})
```

Then run:
```bash
cd "C:\Users\ckr_4\01 Projects\Propequitylab"
claude --dangerously-skip-permissions --model opus "Use a @bowser-qa-agent: (headed: true) Navigate to https://propequitylab.com/login. Login with email premium@test.propequitylab.com and password TestPass123!. After login succeeds, open browser DevTools console (F12) and paste this command to reset onboarding: fetch('https://api.propequitylab.com/api/onboarding/reset',{method:'POST',headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(r=>r.json()).then(d=>{console.log(d);location.href='/onboarding'}). Wait for redirect to /onboarding. Then complete all 8 steps of the wizard: Step 0 Welcome - click Next/Get Started. Step 1 About You - fill in name, select any state (e.g. NSW), click Next. Step 2 Income - add one income source (e.g. salary 80000), click Next. Step 3 Spending - enter any annual spending amount (e.g. 40000), click Next. Step 4 Assets - click Skip or add minimal data, click Next. Step 5 Liabilities - click Skip or add minimal data, click Next. Step 6 Goals - fill retirement age (e.g. 65), click Next. Step 7 Summary - review and click Complete/Finish. Verify you are redirected to /dashboard after completion. Report PASS/FAIL for each step and overall."
```
**Pass criteria:** All 8 steps navigable, final redirect to /dashboard.

---

### ❌ Task 3 — Feature Smoke Tests (BLOCKED — Bowser not installed)
**After Bowser is installed:**
```bash
cd "C:\Users\ckr_4\01 Projects\Propequitylab"
claude --dangerously-skip-permissions --model opus "/playwright-bowser (headed: true) Navigate to https://propequitylab.com/login. Login with email premium@test.propequitylab.com and password TestPass123!. Then visit each of the following routes and verify the page loads without errors (no blank page, no error message, no redirect loop). Report PASS or FAIL for each: 1) /dashboard - main dashboard with financial overview. 2) /finances/income - income management page. 3) /finances/spending - spending/expenses page. 4) /finances/properties - properties list page. 5) /finances/assets - assets page. 6) /finances/liabilities - liabilities page. 7) /plans - financial plans page. 8) /projections - projections/forecasting page. 9) /settings - user settings page. Take a screenshot of /dashboard and /projections. Report overall PASS/FAIL summary."
```
**Pass criteria:** All 9 routes load without errors.

---

### ⚠️ Task 4 — Backend Pytest (PARTIAL — 9/26 pass, 17 fail)

**Current result:** `17 failed, 9 passed` out of 26 tests.

**Run command:**
```bash
cd "C:\Users\ckr_4\01 Projects\Propequitylab"
pytest tests/ -v --tb=short
```

**Root causes of failures (3 distinct bugs to fix):**

#### Bug 1 — SQLite date type incompatibility (affects: properties)
Tests send `purchase_date` as a string `"2020-01-01"` but SQLite requires a Python `datetime.date` object. This is a SQLite/Postgres incompatibility — Postgres accepts ISO strings, SQLite does not.
- **Files:** `tests/integration/legacy_test_properties.py`
- **Fix:** Convert date strings to `date` objects in test data:
  ```python
  from datetime import date
  "purchase_date": date(2020, 1, 1),  # was: "2020-01-01"
  ```

#### Bug 2 — DECIMAL returns string in SQLite (affects: properties)
`current_value` is `DECIMAL(19,4)` and SQLite returns it as `'550000.0000'` (string) not `550000` (int). Test asserts `== 550000`.
- **File:** `tests/integration/legacy_test_properties.py:77`
- **Fix:** `assert float(response.json()["current_value"]) == 550000.0`

#### Bug 3 — Tests use hardcoded portfolio_id that doesn't exist in test DB (affects: assets, income, liabilities, plans, expenses, dashboard)
Tests pass `"portfolio_id": "p1"` (a hardcoded string) but the test DB only has the portfolio created by the `test_portfolio` fixture which has a UUID id. The API returns 404 because no portfolio with id `"p1"` exists.
- **Files:** `legacy_test_assets.py`, `legacy_test_income.py`, `legacy_test_expenses.py`, `legacy_test_liabilities.py`, `legacy_test_plans.py`, `legacy_test_dashboard.py`
- **Fix:** Tests need to use the `test_portfolio` fixture and its real `id`. Update test signatures to accept `test_portfolio` fixture and use `test_portfolio.id`:
  ```python
  def test_asset_crud(client, test_portfolio):
      asset_data = {
          "portfolio_id": test_portfolio.id,  # was: "p1"
          ...
      }
  ```

#### Bug 4 — Stale mock-style test (affects: property_portfolio_update)
`legacy_test_property_portfolio_update.py` uses `db.portfolios.data = [...]` treating `db` as a dict mock instead of a SQLModel Session.
- **Fix:** Rewrite to use the real `test_portfolio` fixture instead of the mock pattern.

**9 tests that currently PASS** (these are fine, no work needed):
```
test_get_asset_types          ✅
test_expense_categories       ✅
test_liability_types          ✅
test_plan_types               ✅
test_get_portfolio_detail     ✅
test_get_portfolios           ✅ (partial — returns empty list, not an error)
test_health_check             ✅ (fixed this session)
test_delete_property          ✅
test_get_properties           ✅
```

---

## Key File Reference

| File | Purpose | Status |
|------|---------|--------|
| `frontend/public/index.html:6` | theme-color | ✅ Fixed, needs deploy |
| `pytest.ini` | pytest discovery config | ✅ Created this session |
| `tests/integration/test_health.py` | health check test | ✅ Fixed this session |
| `tests/integration/legacy_test_properties.py` | SQLite date/decimal bugs | ❌ Needs fix |
| `tests/integration/legacy_test_assets.py` | Hardcoded portfolio_id | ❌ Needs fix |
| `tests/integration/legacy_test_income.py` | Hardcoded portfolio_id | ❌ Needs fix |
| `tests/integration/legacy_test_expenses.py` | Hardcoded portfolio_id | ❌ Needs fix |
| `tests/integration/legacy_test_liabilities.py` | Hardcoded portfolio_id | ❌ Needs fix |
| `tests/integration/legacy_test_plans.py` | Hardcoded portfolio_id | ❌ Needs fix |
| `tests/integration/legacy_test_dashboard.py` | Hardcoded portfolio_id | ❌ Needs fix |
| `tests/integration/legacy_test_property_portfolio_update.py` | Stale mock pattern | ❌ Needs rewrite |
| `tests/conftest.py` | SQLite in-memory fixtures | ✅ Good — has test_portfolio fixture |

## Architecture Notes

- **Stack:** FastAPI + React 19 + PostgreSQL (Neon.tech) + Cloudflare Pages
- **Tests use SQLite in-memory** via `tests/conftest.py` — no real Postgres needed locally
- **`test_portfolio` fixture** creates a portfolio with a UUID `id` — tests must use this, not hardcoded `"p1"`
- **`client` fixture** — TestClient with auth and SQLite session overrides (from `conftest.py`)
- **`db` fixture** — alias for `session`, is a real `sqlmodel.Session` object (NOT a dict mock)
- **Backend entry:** `backend/server.py` — FastAPI app with all routes mounted under `/api`
- **Frontend deploy:** `cd frontend && npm run build && npx wrangler pages deploy build`

## Onboarding Reset Command (for Task 2)
Run in browser DevTools console after login:
```javascript
fetch('https://api.propequitylab.com/api/onboarding/reset',{method:'POST',headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(r=>r.json()).then(d=>{console.log(d);location.href='/onboarding'})
```
Token is stored at `localStorage.getItem('access_token')`.
