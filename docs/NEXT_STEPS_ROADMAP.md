# Next Steps Roadmap to Production Launch

**Document Version:** 1.0
**Created:** 2026-01-07
**Current Progress:** 71% Complete (2/6 Production Phases Done)

---

## 🎯 Current State Summary

| Phase | Status | Notes |
|-------|--------|-------|
| 9A: Authentication | ✅ Complete | Backend + Frontend integrated |
| 9B: Security/Data Isolation | ✅ Complete | All routes secured |
| 9C: Production Infrastructure | 🔴 Not Started | **NEXT PRIORITY** |
| 9D: User Onboarding Improvements | 🔴 Not Started | Post-deployment |
| 9E: Monitoring & Analytics | 🔴 Not Started | Post-deployment |
| 9F: Legal & Compliance | 🔴 Not Started | Before public launch |

---

## 📋 Immediate Actions (Today)

### Step 0: Local Testing (30 min)
Before any deployment, verify the app works locally.

```powershell
# Terminal 1: Backend
cd backend
uvicorn server:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm start
```

**Test Checklist:**
- [ ] Register a new user at `/register`
- [ ] Verify email (check backend logs for token if email not configured)
- [ ] Login at `/login`
- [ ] Navigate to Dashboard - should load user data
- [ ] Refresh page - should stay logged in
- [ ] Click Logout button - should redirect to login

---

## 🚀 Phase 9C: Production Infrastructure (Priority #1)

This is the **critical path** to getting your website live.

### Step 1: Database Setup (PostgreSQL/Neon) ✅ Already Done
Your backend is already configured for Neon PostgreSQL. Verify:
- [ ] `DATABASE_URL` environment variable is set
- [ ] Tables created successfully on startup

### Step 2: Email Service Setup (1 hour)
**Required for:** Email verification, password reset

**Recommended:** [Resend](https://resend.com) (free tier: 3000 emails/month)

**Tasks:**
1. Sign up at resend.com
2. Verify your domain (or use resend's test domain)
3. Get API key
4. Update `backend/.env`:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```
5. Test by registering a new user

### Step 3: Backend Deployment (1-2 hours)
**Recommended:** [Railway](https://railway.app) or [Render](https://render.com)

**Railway Steps:**
1. Connect GitHub repo
2. Select `backend/` folder as root
3. Set environment variables:
   - `DATABASE_URL` (Neon connection string)
   - `SECRET_KEY` (generate with `openssl rand -hex 32`)
   - `RESEND_API_KEY`
   - `FRONTEND_URL` (your Vercel URL once deployed)
   - `CORS_ORIGINS` (your Vercel domain)
4. Deploy
5. Note the deployed URL (e.g., `https://zapiio-api.railway.app`)

### Step 4: Frontend Deployment (30 min)
**Recommended:** [Vercel](https://vercel.com)

**Vercel Steps:**
1. Connect GitHub repo
2. Set root directory to `frontend/`
3. Set environment variable:
   - `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`
4. Deploy
5. Note the deployed URL (e.g., `https://zapiio.vercel.app`)

### Step 5: Connect Backend + Frontend
1. Update Railway env: `FRONTEND_URL` = Vercel URL
2. Update Railway env: `CORS_ORIGINS` = Vercel URL
3. Redeploy backend
4. Test full auth flow on production

### Step 6: Custom Domain (Optional but Recommended)
1. Buy domain (e.g., `zapiio.com`)
2. Point domain to Vercel for frontend
3. Create subdomain `api.zapiio.com` for Railway backend
4. Update CORS and environment variables

---

## 📧 Phase 9A Remaining Items (Low Priority)

These can be done after deployment:

| Item | Effort | Description |
|------|--------|-------------|
| Forgot Password Page | 2 hours | Create `/forgot-password` frontend page |
| Reset Password Page | 2 hours | Create `/reset-password` frontend page |
| Profile Update Endpoint | 1 hour | Add `PUT /api/auth/profile` |

---

## 🔒 Phase 9B Remaining Items (Pre-Launch)

| Item | Effort | Description |
|------|--------|-------------|
| Rate Limiting | 1 hour | Add slowapi to prevent brute force |
| CORS Lockdown | 15 min | Restrict to production domains only |
| Secure Headers | 30 min | Add CSP, HSTS headers |

---

## 📊 Phase 9E: Monitoring (Post-Launch)

| Item | Effort | Description |
|------|--------|-------------|
| Sentry | 30 min | Error tracking frontend + backend |
| UptimeRobot | 15 min | Free uptime monitoring |
| Plausible/Umami | 30 min | Privacy-friendly analytics |

---

## 📜 Phase 9F: Legal (Before Public Launch)

| Item | Effort | Description |
|------|--------|-------------|
| Privacy Policy | 1 hour | Use a generator, customize |
| Terms of Service | 1 hour | Use a template, customize |
| Cookie Banner | 30 min | Only if using analytics cookies |

---

## 🗓️ Suggested Timeline

### Day 1 (Today)
- [ ] Complete local testing (30 min)
- [ ] Set up Resend email service (1 hour)
- [ ] Deploy backend to Railway (2 hours)
- [ ] Deploy frontend to Vercel (30 min)

### Day 2
- [ ] Test production auth flow
- [ ] Add rate limiting
- [ ] Lock down CORS to production domains
- [ ] Create Forgot/Reset password pages

### Day 3
- [ ] Add Sentry error tracking
- [ ] Create Privacy Policy & Terms pages
- [ ] Final testing
- [ ] **Soft Launch 🚀**

---

## 💰 Estimated Monthly Costs

| Service | Cost |
|---------|------|
| Neon PostgreSQL | Free (0.5GB) |
| Railway | $5/month (Hobby) |
| Vercel | Free |
| Resend | Free (3k emails) |
| Domain | ~$12/year |
| **Total** | **~$5-6/month** |

---

## 🎯 Success Criteria for Launch

- [ ] Users can register and receive verification email
- [ ] Users can login and access dashboard
- [ ] Protected routes redirect unauthenticated users
- [ ] Data isolation works (User A can't see User B's data)
- [ ] Password reset flow works
- [ ] Site loads over HTTPS
- [ ] Privacy policy accessible

---

## 📞 Getting Help

If you need Claude to help with any step, use the following prompts:

**For Deployment:**
```
Help me deploy the backend to Railway. My backend is FastAPI at /backend.
```

**For Email Setup:**
```
Help me configure Resend email service in backend/utils/email.py.
```

**For Frontend Pages:**
```
Create a ForgotPassword.jsx page that calls POST /api/auth/request-password-reset.
```

---

*Document created by Chief Full Stack Developer. Ready for execution.*
