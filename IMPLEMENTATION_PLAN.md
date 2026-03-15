# PropEquityLab — Implementation Plan
**Date:** 2026-03-15
**Status:** Ready for execution
**Goal:** Fix key bugs, run database migrations, and get the app deployable

---

## 📊 Current State Assessment

| Area | Status | Notes |
|------|--------|-------|
| **Core Business Logic** | ✅ Working | 36/45 tests passing, financial calculations solid |
| **Database Models** | ✅ Complete | 11 SQLModel files, Alembic migrations ready |
| **Authentication** | ✅ Complete | JWT, password hashing, email verification flow |
| **Email Service** | ❌ Broken | Missing `await` on 3 wrapper functions |
| **Frontend** | ⚠️ Unknown | React 19 + shadcn, not tested yet |
| **Database Schema** | ⚠️ Not deployed | Migrations not run on local PostgreSQL |
| **Deployment** | ⚠️ Not configured | No .env for production, Cloudflare Pages not set up |

---

## 🐛 Issues to Fix (Priority Order)

### Issue 1: Email Async/Await Bug — CRITICAL
**File:** `backend/utils/email.py`
**Problem:** Three wrapper functions call `send_email()` without `await`, returning unawaited coroutine objects instead of `bool`

**Fix (3 lines):**
```python
# Line ~145: send_verification_email
- return send_email(email, subject, html)
+ return await send_email(email, subject, html)

# Line ~245: send_password_reset_email
- return send_email(email, subject, html)
+ return await send_email(email, subject, html)

# Line ~310: send_welcome_email
- return send_email(email, subject, html)
+ return await send_email(email, subject, html)
```

**Impact:** Without this, all emails silently fail — verification, password reset, welcome emails never actually send.

---

### Issue 2: Database Migrations Not Run — HIGH
**Problem:** Local PostgreSQL `propequitylab` database exists but has no tables
**Fix:** Run Alembic migrations
```bash
cd backend
alembic upgrade head
```

---

### Issue 3: Missing SECRET_KEY in .env — HIGH
**Problem:** JWT signing requires SECRET_KEY, currently using placeholder
**Fix:** Generate secure key and add to `.env`

---

### Issue 4: Frontend Environment Not Configured — MEDIUM
**Problem:** No `.env` in frontend pointing to backend API
**Fix:** Create `frontend/.env` with `REACT_APP_API_URL=http://localhost:8000`

---

## 🧪 Test Plan

### Phase 1: Fix Email Bug
1. Edit `backend/utils.email.py` — add 3 `await` keywords
2. Re-run `pytest tests/test_email_async.py -v` — expect 9/9 pass
3. Re-run full test suite — expect 45/45 pass

### Phase 2: Database Setup
1. Run `alembic upgrade head` on local PostgreSQL
2. Verify tables created
3. Run `pytest tests/` again with real DB

### Phase 3: Start Backend
1. Start `uvicorn server:app --reload --port 8000`
2. Test health check: `GET /api/`
3. Test auth endpoints: register, login, verify

### Phase 4: Frontend
1. `cd frontend && npm install && npm start`
2. Verify login/register flow works
3. Test API connectivity

---

## 📁 Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `backend/utils/email.py` | Add `await` to 3 return statements | 3 lines |
| `backend/.env` | Already created ✅ | — |
| `frontend/.env` | Create with API URL | 1 line |

**Total changes: ~5 lines of code to fix the critical bug.**

---

## 🚀 After Fixing — Next Steps

1. **Local testing** — Full stack running on localhost
2. **Production .env** — Set DATABASE_URL (Neon), SECRET_KEY, RESEND_API_KEY
3. **Cloudflare Pages** — Deploy frontend with `wrangler pages deploy`
4. **AWS App Runner** — Backend auto-deploys on push to `main` (already configured)

---

## 📋 Summary

| Task | Effort | Impact |
|------|--------|--------|
| Fix email `await` bug | 5 min | Unblocks all email flows |
| Run DB migrations | 2 min | Creates all tables |
| Test backend API | 15 min | Validates full stack |
| Frontend setup | 15 min | End-to-end validation |
| **Total** | **~40 min** | **App fully functional** |
