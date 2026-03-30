# Clerk Auth Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch all 13 protected backend routes from old JWT auth to Clerk JWT auth, delete the legacy auth system, and deploy both backend (Railway) and frontend (Cloudflare Pages) so the Clerk-integrated UI is live end-to-end.

**Architecture:** `utils/clerk_auth.py` already exists with a complete `get_current_user` that validates Clerk JWTs via JWKS and auto-provisions users. Every protected route currently imports `get_current_user` from `utils.auth` — switching that one import per file is the entire backend migration. Backend deploys first (Railway via GitHub Actions push), then frontend (wrangler).

**Tech Stack:** FastAPI, SQLModel, PyJWT/PyJWKClient (Clerk), Railway, Cloudflare Pages (wrangler), Playwright

---

## File Map

| File | Change |
|---|---|
| `backend/routes/assets.py` | Import swap |
| `backend/routes/dashboard.py` | Import swap |
| `backend/routes/expenses.py` | Import swap |
| `backend/routes/income.py` | Import swap |
| `backend/routes/liabilities.py` | Import swap |
| `backend/routes/loans.py` | Import swap |
| `backend/routes/onboarding.py` | Import swap |
| `backend/routes/plans.py` | Import swap |
| `backend/routes/portfolios.py` | Import swap |
| `backend/routes/projections.py` | Import swap |
| `backend/routes/properties.py` | Import swap |
| `backend/routes/scenarios.py` | Import swap |
| `backend/routes/valuations.py` | Import swap |
| `backend/routes/gdpr.py` | Import swap + simplify delete endpoint |
| `backend/routes/auth.py` | **Delete** |
| `backend/server.py` | Remove auth_router import + registration |
| `tests/conftest.py` | Import `get_current_user` from `clerk_auth` instead of `auth` |

---

## Task 1: Swap auth import in the 13 standard route files

**Files:** All files listed below — identical one-line change in each.

- [ ] **Step 1: Edit each file**

In each of these 13 files, find and replace the auth import line:

```
backend/routes/assets.py       line 18
backend/routes/dashboard.py    line 24
backend/routes/expenses.py     line 18
backend/routes/income.py       line 18
backend/routes/liabilities.py  line 18
backend/routes/loans.py        line 26
backend/routes/onboarding.py   line 23
backend/routes/plans.py        line 24
backend/routes/portfolios.py   line 23
backend/routes/projections.py  line 30
backend/routes/properties.py   line 17
backend/routes/scenarios.py    line 28
backend/routes/valuations.py   line 23
```

In every file, replace:
```python
from utils.auth import get_current_user
```
with:
```python
from utils.clerk_auth import get_current_user
```

- [ ] **Step 2: Verify no remaining auth imports in these files**

Run:
```bash
grep -n "from utils.auth import get_current_user" \
  backend/routes/assets.py \
  backend/routes/dashboard.py \
  backend/routes/expenses.py \
  backend/routes/income.py \
  backend/routes/liabilities.py \
  backend/routes/loans.py \
  backend/routes/onboarding.py \
  backend/routes/plans.py \
  backend/routes/portfolios.py \
  backend/routes/projections.py \
  backend/routes/properties.py \
  backend/routes/scenarios.py \
  backend/routes/valuations.py
```

Expected: no output (zero matches).

---

## Task 2: Update gdpr.py

**File:** `backend/routes/gdpr.py`

`gdpr.py` already has dual-mode logic (Clerk vs JWT). We strip the legacy branch and remove `verify_password`.

- [ ] **Step 1: Replace the import line**

Find line 26:
```python
from utils.auth import get_current_user, verify_password
```
Replace with:
```python
from utils.clerk_auth import get_current_user
```

- [ ] **Step 2: Remove the CLERK_JWKS_URL env var check and unused import**

Find lines 29-30:
```python
# Clerk is active when CLERK_JWKS_URL is set in the environment
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
```
Delete both lines.

Also remove line 10 (`import os`) — `os` is only used for that `getenv` call.

- [ ] **Step 3: Simplify the delete_account endpoint body**

Find the identity verification block inside `delete_account` (lines 302-324):
```python
        # Verify identity — strategy depends on whether Clerk is active
        clerk_mode = CLERK_JWKS_URL and current_user.clerk_user_id

        if clerk_mode:
            # Clerk manages passwords; require an explicit "DELETE" confirmation
            # string instead of a password to prevent accidental deletion.
            if request.confirmation != "DELETE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Confirmation must be the string DELETE"
                )
        else:
            # Legacy JWT mode: verify password against local hash
            if not request.password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password is required"
                )
            if not verify_password(request.password, current_user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect password"
                )
```
Replace with:
```python
        # Clerk manages passwords — require explicit "DELETE" confirmation
        if request.confirmation != "DELETE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Confirmation must be the string DELETE"
            )
```

- [ ] **Step 4: Simplify the DeleteAccountRequest model**

Find:
```python
class DeleteAccountRequest(BaseModel):
    # Required for legacy JWT mode; optional when Clerk is active
    password: Optional[str] = None
    # Required in Clerk mode — caller must pass the string "DELETE" to confirm
    confirmation: Optional[str] = None
```
Replace with:
```python
class DeleteAccountRequest(BaseModel):
    confirmation: str
```

Remove the `Optional` import from `typing` if it's the only use — check line 7: `from typing import Dict, Any, Optional`. Remove `Optional` from that import (keep `Dict, Any`).

- [ ] **Step 5: Verify gdpr.py has no verify_password or CLERK_JWKS_URL references**

Run:
```bash
grep -n "verify_password\|CLERK_JWKS_URL\|clerk_mode" backend/routes/gdpr.py
```
Expected: no output.

---

## Task 3: Delete auth.py and update server.py

**Files:** `backend/routes/auth.py` (delete), `backend/server.py` (modify)

- [ ] **Step 1: Delete auth.py**

```bash
rm backend/routes/auth.py
```

- [ ] **Step 2: Remove auth_router from server.py**

In `backend/server.py`, remove line 20:
```python
from routes.auth import router as auth_router
```

In the same file, remove line 110:
```python
api_router.include_router(auth_router)
```

- [ ] **Step 3: Verify server.py has no auth_router references**

Run:
```bash
grep -n "auth_router\|routes.auth" backend/server.py
```
Expected: no output.

---

## Task 4: Update conftest.py

**File:** `tests/conftest.py`

The test client overrides `get_current_user` as a FastAPI dependency. The override key must be the exact function object the routes now depend on — which is `clerk_auth.get_current_user`. `create_access_token` is kept from `utils.auth` for the existing `auth_token` fixture (it generates a token for the Authorization header, never validated in tests).

- [ ] **Step 1: Replace the auth import line**

Find line 35:
```python
from utils.auth import get_current_user, create_access_token
```
Replace with:
```python
from utils.clerk_auth import get_current_user
from utils.auth import create_access_token
```

- [ ] **Step 2: Verify the override still references the right function**

The override line (line 193) reads:
```python
app.dependency_overrides[get_current_user] = get_current_user_override
```
This is correct as-is — `get_current_user` now refers to `clerk_auth.get_current_user`, which is what the routes depend on. No change needed to this line.

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "from utils.auth import get_current_user" tests/conftest.py
```
Expected: no output.

---

## Task 5: Run tests locally

**Working directory:** project root

- [ ] **Step 1: Activate the backend virtualenv**

```bash
cd backend
source venv/Scripts/activate
cd ..
```

- [ ] **Step 2: Run the backend test suite**

```bash
pytest tests/backend_test.py -v --tb=short
```

Expected: all tests pass. If any fail:
- `ImportError` on `get_current_user` → check Task 1/4 import lines
- `KeyError` in dependency_overrides → the override key doesn't match; recheck Task 4
- Other failures → investigate individually before proceeding

- [ ] **Step 3: Confirm no import of deleted auth.py**

```bash
grep -rn "from routes.auth\|routes.auth import" backend/
```
Expected: no output.

---

## Task 6: Verify Railway env vars, commit, and push

- [ ] **Step 1: Check Railway env vars are set**

Run:
```bash
railway variables --service Propequitylab
```

Confirm these two keys exist with non-empty values:
- `CLERK_JWKS_URL` (e.g. `https://neutral-monkey-24.clerk.accounts.dev/.well-known/jwks.json`)
- `CLERK_ISSUER` (e.g. `https://clerk.propequitylab.com`)

If either is missing, set it:
```bash
railway variable set CLERK_JWKS_URL="https://neutral-monkey-24.clerk.accounts.dev/.well-known/jwks.json"
railway variable set CLERK_ISSUER="https://clerk.propequitylab.com"
```

- [ ] **Step 2: Stage and commit backend changes**

```bash
git add \
  backend/routes/assets.py \
  backend/routes/dashboard.py \
  backend/routes/expenses.py \
  backend/routes/income.py \
  backend/routes/liabilities.py \
  backend/routes/loans.py \
  backend/routes/onboarding.py \
  backend/routes/plans.py \
  backend/routes/portfolios.py \
  backend/routes/projections.py \
  backend/routes/properties.py \
  backend/routes/scenarios.py \
  backend/routes/valuations.py \
  backend/routes/gdpr.py \
  backend/server.py \
  tests/conftest.py \
  docs/superpowers/specs/2026-03-30-clerk-auth-migration-design.md \
  docs/superpowers/plans/2026-03-30-clerk-auth-migration.md
git status  # confirm auth.py appears as deleted
git add -u backend/routes/auth.py  # stage the deletion
git commit -m "feat(auth): migrate all routes to Clerk JWT auth, remove legacy JWT system"
```

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

GitHub Actions will run `pytest` in CI, then deploy to Railway on success.

- [ ] **Step 4: Monitor the deploy**

```bash
gh run list --limit 3
gh run watch  # follow the latest run
```

Wait for the run to show ✅ success before proceeding to Task 7.

- [ ] **Step 5: Smoke-check the backend**

```bash
curl https://api.propequitylab.com/api/health
```

Expected response:
```json
{"status": "healthy", "components": {"database": "connected", "api": "running"}}
```

---

## Task 7: Build and deploy the frontend

**Working directory:** `frontend/`

- [ ] **Step 1: Install dependencies (if needed)**

```bash
cd frontend
npm install
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: `build/` directory created with no errors. Confirm `REACT_APP_CLERK_PUBLISHABLE_KEY` is baked in:
```bash
grep -r "pk_test_" build/static/js/*.js | head -1
```
Expected: at least one match (the key embedded in the bundle).

- [ ] **Step 3: Deploy to Cloudflare Pages**

```bash
npx wrangler pages deploy build --project-name propequitylab
```

Expected output ends with a deployment URL like:
```
✨ Deployment complete! Take a peek over at https://propequitylab.com
```

---

## Task 8: End-to-end verification

- [ ] **Step 1: Run the smoke suite against production**

```bash
cd ..  # back to project root
npx playwright test tests/e2e/propequitylab.spec.js --reporter=list
```

Expected: all tests pass.

- [ ] **Step 2: Run the authenticated suite**

```bash
npx playwright test tests/e2e/authenticated.spec.js --reporter=list
```

Expected: dashboard, properties, settings, and API tests all pass. The blank-page issue is gone because Clerk is now live on both frontend and backend.

- [ ] **Step 3: Manual spot-check**

Open `https://propequitylab.com` in a browser:
1. Unauthenticated → redirects to `/login` ✓
2. Clerk sign-in widget renders ✓
3. Sign in with the test user → lands on `/dashboard` ✓
4. Dashboard renders (Welcome banner, KPI cards) ✓

- [ ] **Step 4: Final commit (test artifacts)**

```bash
git add tests/e2e/
git commit -m "chore(tests): update playwright authenticated suite post-clerk-deploy"
```
