# Clerk Integration — Progress Tracker

Last updated: 2026-03-21

## Task Status

| Status | Task |
|--------|------|
| ✅ Done | Add `clerk_user_id` to User model + Alembic migration |
| 🔄 In Progress | Create `backend/utils/clerk_auth.py` — Clerk JWT verification |
| ⬜ Pending | Create `backend/routes/webhooks.py` — Clerk webhook handler |
| ⬜ Pending | Update `get_current_user` + mount webhook router in `server.py` |
| ⬜ Pending | Frontend: Add `ClerkProvider` to `App.js` + update `api.js` token getter |
| ⬜ Pending | Frontend: Replace `AuthContext` with Clerk hooks |
| ⬜ Pending | Frontend: Update `Login.jsx` and `Register.jsx` to use Clerk hooks |
| ⬜ Pending | Configure Clerk Webhook in Clerk Dashboard (manual step) |
| ⬜ Pending | Deploy + verify end-to-end |

---

## What Was Done — Task 1 Detail

**Files modified:**
- `backend/models/user.py` — `password_hash` made optional, `is_verified` default → `True`, `clerk_user_id` added
- `backend/alembic/versions/a1b2c3d4e5f6_add_clerk_user_id...py` — adds `clerk_user_id` column + unique index; also creates `accounts`, `account_memberships`, `subscriptions`, `webhook_events` tables
- `backend/alembic/versions/b9c1d2e3f4a5_make_password_hash_nullable_for_clerk.py` — makes `password_hash` nullable, sets `is_verified` server default to `true`

**⚠️ Migration NOT yet applied to live DB — run when ready:**
```bash
cd backend
alembic upgrade head
```

---

## Blocked On — Keys Required Before Frontend Tasks

| Variable | Where to get it | Where it goes |
|----------|----------------|---------------|
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys (`pk_live_...`) | `frontend/.env` |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys (`sk_live_...`) | Railway env vars |
| `CLERK_FRONTEND_API_URL` | Clerk Dashboard → API Keys (`https://xxx.clerk.accounts.dev`) | Railway env vars |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → endpoint (`whsec_...`) | Railway env vars |

---

## Full Implementation Plan

See: `docs/superpowers/plans/2026-03-21-clerk-full-integration.md`
