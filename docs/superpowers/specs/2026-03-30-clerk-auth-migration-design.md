# Clerk Auth Migration — Design Spec
**Date:** 2026-03-30
**Status:** Approved

---

## Problem

The backend currently validates Bearer tokens as HS256 JWTs signed with `JWT_SECRET_KEY` (`utils/auth.py`). The frontend has been migrated to Clerk locally but the deployed build has no Clerk. The result: production is running old JWT auth end-to-end, and the Clerk-integrated frontend cannot be deployed without breaking all API calls.

`utils/clerk_auth.py` already exists and correctly validates Clerk JWTs via JWKS + auto-provisions users. It is not yet wired to any route.

No real users exist in production — clean cutover is safe.

---

## Decision

**Sequential deploy, big-bang migration, delete old auth.**

- Switch all 13 protected route files from `utils.auth.get_current_user` → `utils.clerk_auth.get_current_user`
- Delete `backend/routes/auth.py` (old login/register/token endpoints)
- Strip password verification from `gdpr.py` (Clerk owns password management)
- Update `conftest.py` dependency override to target the new function
- Deploy backend first (Railway via GitHub Actions), then frontend (Cloudflare Pages via wrangler)
- Verify with Playwright smoke + authenticated suites

---

## Architecture

### Backend auth flow (after migration)

```
Request with Bearer token
  → route depends on clerk_auth.get_current_user
    → verify JWT via CLERK_JWKS_URL (PyJWKClient, cached)
    → extract clerk_user_id from sub claim
    → lookup User by clerk_user_id in DB
    → if not found: auto-provision (create User + Account + Membership + Subscription)
    → return User
```

### Files changed

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
| `backend/routes/gdpr.py` | Import swap + remove verify_password usage |
| `backend/routes/auth.py` | **Delete** |
| `backend/server.py` | Remove auth_router import + registration |
| `tests/conftest.py` | Override `clerk_auth.get_current_user`, remove `create_access_token` |

### Files NOT changed

`utils/clerk_auth.py` — already complete and production-ready.
`utils/auth.py` — kept (still used by conftest for `create_access_token` in `auth_token` fixture — fixture can be removed or kept as dead code since conftest override bypasses it anyway).

---

## gdpr.py password handling

`gdpr.py` currently imports `verify_password` to validate the user's current password before account deletion. With Clerk, password management is entirely Clerk-side. The account deletion endpoint should:
- Remove the `verify_password` check
- Proceed directly with data deletion (the user is already authenticated via Clerk JWT — that's sufficient proof of identity for deletion)

---

## Test strategy

Tests use `app.dependency_overrides[get_current_user] = get_current_user_override` — this bypasses real auth entirely. Switching the import target means the override key must match. `conftest.py` must import `get_current_user` from `clerk_auth` not `auth`.

No new test cases needed for the migration itself — existing coverage validates the route logic. The Playwright authenticated suite validates the full Clerk flow end-to-end post-deploy.

---

## Railway environment variables (pre-deploy check)

Before deploying backend, confirm these are set in Railway:
- `CLERK_JWKS_URL` — e.g. `https://neutral-monkey-24.clerk.accounts.dev/.well-known/jwks.json`
- `CLERK_ISSUER` — e.g. `https://clerk.propequitylab.com`

---

## Deployment order

1. Run `pytest tests/backend_test.py -v --tb=short` locally
2. Commit all backend changes → push `main`
3. Wait for GitHub Actions (tests + Railway deploy)
4. Confirm backend health: `GET https://api.propequitylab.com/api/health`
5. `cd frontend && npm run build`
6. `npx wrangler pages deploy build --project-name propequitylab`
7. Run Playwright smoke suite
8. Run Playwright authenticated suite

---

## Rollback

Since no real users exist, rollback is: revert the commit, push, Railway redeploys. Frontend rollback: `wrangler pages deployment list` → `wrangler rollback`.

---

## Out of scope

- Migrating existing user records (none exist)
- Clerk webhook handling changes (already done in `clerk_webhooks.py`)
- Frontend code changes (already done locally)
- Subscription/billing integration
