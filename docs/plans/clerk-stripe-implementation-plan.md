# PropEquityLab Clerk + Stripe Implementation Plan

## Objective

Migrate authentication to **Clerk** and implement subscription billing with **Stripe**, while keeping PropEquityLab's database as the source of truth for app entitlements and access.

---

## Guiding Architecture

- **Clerk**: authentication, session management, password reset, email verification, social login, invite flow
- **Stripe**: checkout, subscription lifecycle, invoices, payment methods, billing portal
- **PropEquityLab DB**: account/household model, memberships/roles, subscription mirror, feature entitlements

### Core design decision

Use **account-level billing** (household/workspace) rather than user-level billing.

---

## Phase 0 — Lock Decisions

1. Finalize plan keys (recommended): `free`, `pro`, `family`, `enterprise`
2. Define entitlement matrix (limits/features per plan)
3. Confirm account model:
   - `User` (identity/profile)
   - `Account` (billable workspace)
   - `AccountMembership` (owner/admin/member/viewer)
4. Confirm migration strategy: **soft migration** (recommended)

Deliverable: architecture decision record + pricing/entitlements table.

---

## Phase 1 — Data Model & Migrations

### Update existing user model

Update `backend/models/user.py`:

- Add `clerk_user_id` (unique, indexed)
- Keep profile fields (`name`, `country`, `state`, `currency`, etc.)
- Keep old auth columns temporarily during transition (password hash/reset token/etc.)

### Add new models

Create:

- `backend/models/account.py`
  - `id`, `name`, `owner_user_id`, timestamps
- `backend/models/account_membership.py`
  - `id`, `account_id`, `user_id`, `role`, `status`, timestamps
- `backend/models/subscription.py`
  - `id`, `account_id`, provider, stripe ids, `plan_key`, `status`, period dates
- `backend/models/webhook_event.py`
  - provider event id + processed status for idempotency

### Migration

Create Alembic migration(s) to:

- add `clerk_user_id` to users
- create new account/membership/subscription/webhook tables
- seed default account + owner membership for existing users

Deliverable: applied migration and verified schema.

---

## Phase 2 — Clerk Integration (Frontend)

### Install and configure

- Add Clerk React SDK in frontend
- Add env var:
  - `REACT_APP_CLERK_PUBLISHABLE_KEY`

### App wrapping and route protection

- Wrap app with `ClerkProvider`
- Update `ProtectedRoute` to use Clerk auth state

### Replace custom auth flows

Transition files:

- `frontend/src/context/AuthContext.jsx` (replace or reduce to adapter)
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/ForgotPassword.jsx`
- `frontend/src/pages/ResetPassword.jsx`
- `frontend/src/pages/VerifyEmail.jsx`

Use Clerk prebuilt components first for faster rollout.

Deliverable: frontend login/register/logout fully Clerk-based.

---

## Phase 3 — Clerk Integration (Backend)

### Add Clerk token verification

Create `backend/utils/clerk_auth.py`:

- verify incoming bearer token with Clerk/JWKS
- extract `clerk_user_id`
- resolve/create local `User`

### Replace dependencies

Replace current JWT-based user dependency in protected routes with Clerk-aware dependency.

### Refactor auth routes

Gradually deprecate custom endpoints in `backend/routes/auth.py`:

- register/login/refresh/password reset/email verify (moved to Clerk)
- keep `/auth/me` semantics backed by Clerk identity + local user profile

Deliverable: API auth no longer depends on local JWT lifecycle.

---

## Phase 4 — Frontend API Client Refactor

Update `frontend/src/services/api.js`:

- remove localStorage `access_token` / `refresh_token` logic
- remove token-refresh queue code
- inject Clerk token into `Authorization` header per request

Deliverable: API requests authenticated via Clerk session tokens.

---

## Phase 5 — Stripe Billing Foundation

### Stripe setup

- create products/prices (monthly + yearly)
- configure billing portal
- configure webhook endpoint

### Backend billing routes

Add `backend/routes/billing.py` with:

- `POST /billing/checkout`
- `POST /billing/portal`
- `GET /billing/subscription`
- `POST /billing/webhook`

Deliverable: checkout and billing portal functioning.

---

## Phase 6 — Webhook Sync (Critical)

Handle at minimum:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Webhook responsibilities:

1. verify Stripe signature
2. process idempotently (`webhook_event` table)
3. upsert local subscription state
4. update account plan cache/status

Deliverable: reliable DB-synced subscription state.

---

## Phase 7 — Entitlement Layer

Create `backend/utils/entitlements.py`:

- `has_feature(account, feature_key)`
- `get_limit(account, limit_key)`
- `assert_entitled(account, feature_key)`

Refactor tier checks (e.g. in `backend/routes/scenarios.py`) to use this centralized entitlement layer.

Deliverable: no scattered raw `subscription_tier` string checks.

---

## Phase 8 — Members & Tiers UX

### Backend

Add `backend/routes/members.py`:

- `POST /members/invite`
- `POST /members/accept-invite`
- `GET /members`
- `PATCH /members/{id}/role`
- `DELETE /members/{id}`

### Frontend

Add to Settings page:

- current plan + billing status
- member list
- invite/remove member
- role updates
- manage billing button

Deliverable: member management tied to plan seat limits.

---

## Phase 9 — Existing User Migration

Recommended: **soft migration**

1. User signs in with Clerk
2. Match existing local user by email
3. Save `clerk_user_id`
4. Backfill default account + owner membership if missing
5. Preserve all portfolio ownership and app data

Avoid big-bang forced auth reset.

Deliverable: existing users migrate with minimal friction.

---

## Phase 10 — Security, Config, and Ops

### Env vars

Frontend:

- `REACT_APP_CLERK_PUBLISHABLE_KEY`
- `REACT_APP_API_URL`

Backend:

- `CLERK_SECRET_KEY`
- `CLERK_JWKS_URL` (or Clerk verification config)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_*` ids
- `APP_URL`, `API_URL`

### Security headers / CSP

Update CSP/connect-src in `backend/server.py` to allow Clerk + Stripe endpoints.

Deliverable: production-ready config and secure integrations.

---

## Testing & QA Plan

1. **Auth tests**
   - sign-up/sign-in/sign-out
   - protected route access
   - token verification failure behavior

2. **Billing tests**
   - checkout success/cancel
   - plan upgrade/downgrade
   - payment failure and recovery
   - cancellation at period end

3. **Webhook tests**
   - replay-safe idempotency
   - out-of-order event resilience

4. **Entitlement tests**
   - free/pro/family/enterprise limits
   - scenarios and premium features gating

5. **Migration tests**
   - existing user sign-in migration
   - no data ownership regressions

---

## Rollout Strategy

1. Deploy DB migration + backend compatibility layer
2. Enable Clerk auth behind a feature flag
3. Roll out Clerk auth to a pilot cohort
4. Enable Stripe checkout + webhook sync in staging
5. Production canary release for paid plan flows
6. Complete migration and retire old auth endpoints

---

## Risk Register

1. **Auth migration regressions**
   - Mitigation: phased rollout + compatibility window
2. **Webhook inconsistency**
   - Mitigation: strict idempotency + event logs + replay tooling
3. **Ownership model drift**
   - Mitigation: explicit account/membership foreign keys and tests
4. **Tier naming mismatch (`premium` vs `pro`)**
   - Mitigation: normalize keys early + data migration script

---

## Execution Sequence (Recommended)

1. Schema + migrations (user/account/membership/subscription)
2. Clerk backend token verification + local user provisioning
3. Clerk frontend auth migration
4. API client token refactor
5. Stripe checkout + portal
6. Stripe webhook sync
7. Entitlement layer refactor
8. Members management
9. User migration completion
10. Old auth route retirement

---

## Definition of Done

- Users authenticate only through Clerk
- Subscriptions are purchased/managed via Stripe
- Local DB mirrors Stripe state reliably through webhooks
- Feature access uses centralized entitlements
- Members and seat limits work by plan
- Existing users are migrated without data loss
- Legacy auth flows are deprecated safely
