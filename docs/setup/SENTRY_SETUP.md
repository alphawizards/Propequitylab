# Sentry Error Tracking Setup Guide

**Date:** January 9, 2026
**Status:** Implemented - Needs Configuration
**Priority:** HIGH (Required for production monitoring)

---

## ✅ What's Been Implemented

The Sentry error tracking code has been fully integrated into the frontend:

### Files Added/Modified:
1. **`frontend/src/utils/sentry.js`** - Sentry configuration module
2. **`frontend/src/index.js`** - Sentry initialization
3. **`frontend/src/context/AuthContext.jsx`** - User context tracking
4. **`frontend/package.json`** - Sentry packages installed

### Features Configured:
- ✅ Error tracking and reporting
- ✅ Performance monitoring (10% sample rate)
- ✅ Session replay on errors
- ✅ User context tracking (tied to authentication)
- ✅ Breadcrumb tracking for debugging
- ✅ Environment-based filtering (prod only)
- ✅ Automatic source map upload support

---

## 🔧 Manual Configuration Required

### Step 1: Create Sentry Account (5 minutes)

1. Go to https://sentry.io
2. Sign up for free account (100,000 events/month free tier)
3. Click "Create Project"
4. Select platform: **React**
5. Project name: **propequitylab-frontend**
6. Copy the DSN (it looks like: `https://xxxxx@sentry.io/xxxxx`)

---

### Step 2: Add DSN to GitHub Secrets (2 minutes)

1. Go to your GitHub repository settings:
   ```
   https://github.com/alphawizards/Propequitylab/settings/secrets/actions
   ```

2. Click "New repository secret"

3. Add secret:
   - **Name:** `SENTRY_DSN_FRONTEND`
   - **Value:** Your Sentry DSN from Step 1

---

### Step 3: Add DSN to Cloudflare Pages (3 minutes)

1. Go to Cloudflare Pages dashboard
2. Select your project: **propequitylab**
3. Go to Settings → Environment Variables
4. Add variable:
   - **Name:** `REACT_APP_SENTRY_DSN`
   - **Value:** Your Sentry DSN from Step 1
   - **Type:** Production (and Preview if needed)
5. Click "Save"

---

### Step 4: Verify Configuration (2 minutes)

After deployment, verify Sentry is working:

1. **Check Console Logs:**
   - Open browser DevTools
   - Visit: https://propequitylab.pages.dev
   - Look for: `[Sentry] Error tracking initialized`

2. **Test Error Tracking:**
   - Trigger a test error (click a broken feature)
   - Check Sentry dashboard: https://sentry.io/organizations/[your-org]/issues/
   - Should see error appear within ~30 seconds

3. **Verify User Context:**
   - Log in to the application
   - Trigger an error
   - Check error in Sentry dashboard
   - Should show user email/ID in error details

---

## 📊 What Sentry Tracks

### Automatically Tracked:
- ✅ JavaScript errors (uncaught exceptions)
- ✅ Promise rejections
- ✅ Network errors (failed API calls)
- ✅ React component errors
- ✅ Performance metrics (page load, API calls)
- ✅ Session replays (when errors occur)

### User Context Tracked:
- ✅ User ID
- ✅ User email
- ✅ Authentication state
- ✅ Page navigation history

### Filtered Out (Noise Reduction):
- ❌ Browser extension errors
- ❌ ResizeObserver errors (non-critical)
- ❌ Network timeouts (logged but not alerted)
- ❌ Console.log in development

---

## 🎯 How to Use Sentry

### View Errors:
1. Go to: https://sentry.io/organizations/[your-org]/issues/
2. Errors sorted by frequency and recency
3. Click error to see:
   - Stack trace
   - User who encountered it
   - Browser/OS information
   - Breadcrumbs (events leading to error)
   - Session replay (video of what user did)

### Set Up Alerts:
1. Go to Project Settings → Alerts
2. Create alert rule:
   - Email me when new error occurs
   - Slack notification for high-priority errors
   - Alert when error frequency > 10/hour

### Performance Monitoring:
1. Go to Performance tab
2. See:
   - Page load times
   - API response times
   - Slow database queries
   - Frontend vs backend performance

---

## 🔒 Privacy & Security

### Data Protection:
- ✅ **No sensitive data sent** - passwords, tokens, credit cards filtered
- ✅ **Session replay masks all text** - only UI interactions visible
- ✅ **User emails hashed** - can identify users without exposing emails
- ✅ **GDPR compliant** - users can request data deletion

### What's NOT Sent:
- ❌ Passwords
- ❌ JWT tokens
- ❌ Credit card numbers
- ❌ Personal financial data
- ❌ Full localStorage contents

---

## 📈 Free Tier Limits

**Sentry Free Tier:**
- 100,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month
- 1 team member
- 90-day data retention

**Estimated Usage (1,000 active users):**
- ~5,000 errors/month (well within limit)
- ~2,000 transactions/month (within limit)
- ~20 replays/month (within limit)

**When to Upgrade:**
- > 5,000 active users
- Need more team members
- Want longer data retention
- Cost: $26/month (Team plan)

---

## 🚨 Common Issues & Solutions

### Issue: "Sentry not initialized"
**Solution:** Check `REACT_APP_SENTRY_DSN` environment variable is set in Cloudflare Pages

### Issue: Errors not appearing in dashboard
**Solution:**
1. Check environment is "production" (not dev)
2. Verify DSN is correct
3. Check browser console for Sentry errors

### Issue: Too many errors
**Solution:** Add to `ignoreErrors` array in `frontend/src/utils/sentry.js`

### Issue: Session replays not recording
**Solution:** Upgrade to paid plan (free tier has limit of 50/month)

---

## ✅ Success Criteria

Sentry is properly configured when:
- ✅ Console shows: `[Sentry] Error tracking initialized`
- ✅ Test errors appear in Sentry dashboard
- ✅ User context visible in error reports
- ✅ Performance metrics appearing
- ✅ No PII or sensitive data in error reports

---

## 📝 Next Steps

After Sentry is configured:
1. ✅ Test error tracking (trigger test error)
2. ✅ Set up email alerts for new errors
3. ✅ Configure Slack integration (optional)
4. ✅ Create error response playbook
5. ✅ Monitor dashboard daily for first week

---

## 🔗 Useful Links

- **Sentry Dashboard:** https://sentry.io
- **React Integration Docs:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Performance Monitoring:** https://docs.sentry.io/product/performance/
- **Session Replay:** https://docs.sentry.io/product/session-replay/

---

**Status:** ✅ Code implemented, awaiting DSN configuration
**Time to Complete:** ~15 minutes
**Impact:** Critical for production monitoring
