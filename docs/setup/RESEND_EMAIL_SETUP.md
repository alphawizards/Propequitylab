# Resend Email Service Configuration Guide

**Created:** 2026-01-09  
**Status:** Ready for deployment  
**Resend API Key:** `re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV`

---

## 🎯 Overview

This guide explains how to configure the Resend email service for the Propequitylab application to enable:
- ✉️ Email verification for new user registrations
- 🔐 Password reset emails
- 📧 Future notification emails

---

## ✅ What's Already Done

1. ✅ Backend email utility (`backend/utils/email.py`) is fully implemented
2. ✅ Email templates for verification and password reset are ready
3. ✅ GitHub Actions workflow updated to include email environment variables
4. ✅ Resend API key obtained: `re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV`

---

## 🔧 Configuration Steps

### **Option 1: Using GitHub Actions (Recommended)**

This method automatically deploys the configuration when you push to the `main` branch.

#### Step 1: Add GitHub Secrets

Go to your GitHub repository: `https://github.com/alphawizards/Propequitylab/settings/secrets/actions`

Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `RESEND_API_KEY` | `re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV` |
| `FROM_EMAIL` | `Propequitylab <noreply@propequitylab.com>` or use Resend test domain |
| `FRONTEND_URL` | `https://propequitylab.pages.dev` |

**Note:** If you haven't verified a custom domain with Resend, use their test domain:
- `FROM_EMAIL`: `Propequitylab <onboarding@resend.dev>`

#### Step 2: Commit and Push the Updated Workflow

The workflow file has already been updated. Commit and push the changes:

```bash
cd /path/to/Propequitylab
git add .github/workflows/deploy-backend.yml
git add docs/RESEND_EMAIL_SETUP.md
git commit -m "Configure Resend email service for production"
git push origin main
```

#### Step 3: Monitor Deployment

1. Go to GitHub Actions: `https://github.com/alphawizards/Propequitylab/actions`
2. Watch the "Deploy Backend to AWS App Runner" workflow
3. Verify it completes successfully

---

### **Option 2: Manual AWS Console Update (Alternative)**

If you prefer to update directly via AWS Console without triggering a full deployment:

#### Step 1: Open AWS App Runner Console

1. Go to AWS Console: https://console.aws.amazon.com/apprunner/
2. Select region: **ap-southeast-2** (Sydney)
3. Find service: **propequitylab-api**

#### Step 2: Update Environment Variables

1. Click on the service name
2. Go to **Configuration** tab
3. Click **Edit** under **Environment variables**
4. Add the following variables:

| Variable Name | Value |
|---------------|-------|
| `RESEND_API_KEY` | `re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV` |
| `FROM_EMAIL` | `Propequitylab <noreply@propequitylab.com>` |
| `FRONTEND_URL` | `https://propequitylab.pages.dev` |

5. Click **Save changes**
6. App Runner will automatically redeploy with the new configuration

---

## 🧪 Testing Email Verification

After deployment, test the email verification flow:

### Step 1: Register a New User

1. Go to: `https://propequitylab.pages.dev/register`
2. Fill in the registration form with a **real email address** you can access
3. Submit the form

### Step 2: Check Your Email

1. Check your inbox for an email from Propequitylab
2. Subject: "Welcome to PropEquityLab - Verify Your Email"
3. Click the "Verify Email Address" button

### Step 3: Verify Login

1. After verification, you should be redirected to the login page
2. Login with your credentials
3. You should be able to access the dashboard

### Step 4: Check Backend Logs (Optional)

If emails are not arriving, check AWS App Runner logs:

1. Go to AWS App Runner console
2. Click on **propequitylab-api** service
3. Go to **Logs** tab
4. Look for email sending confirmation or errors

**Expected log output:**
```
✓ Email sent to user@example.com: Welcome to PropEquityLab - Verify Your Email
```

**If RESEND_API_KEY is not set, you'll see:**
```
⚠️  WARNING: RESEND_API_KEY not set. Email sending will be simulated.
📧 EMAIL SIMULATION (No RESEND_API_KEY configured)
```

---

## 🔍 Troubleshooting

### Issue: Emails Not Arriving

**Check 1: Verify API Key is Set**
- Check AWS App Runner environment variables
- Ensure `RESEND_API_KEY` is present and correct

**Check 2: Check Spam Folder**
- Verification emails might be marked as spam
- Add `noreply@propequitylab.com` or `onboarding@resend.dev` to contacts

**Check 3: Verify FROM_EMAIL Domain**
- If using a custom domain, ensure it's verified in Resend dashboard
- Otherwise, use Resend test domain: `onboarding@resend.dev`

**Check 4: Check Resend Dashboard**
- Go to: https://resend.com/emails
- View sent emails and delivery status
- Check for bounces or errors

### Issue: "Invalid API Key" Error

- Double-check the API key in GitHub Secrets or AWS Console
- Ensure there are no extra spaces or characters
- Regenerate API key in Resend dashboard if needed

### Issue: CORS Errors on Frontend

- Ensure `CORS_ORIGINS` includes `https://propequitylab.pages.dev`
- Check that `FRONTEND_URL` matches the Cloudflare Pages URL

---

## 📊 Resend Account Limits

**Free Tier:**
- 3,000 emails per month
- 100 emails per day
- Perfect for initial launch and testing

**Monitoring Usage:**
- Dashboard: https://resend.com/overview
- Check monthly usage regularly
- Upgrade to paid plan if needed

---

## 🔐 Security Notes

1. **API Key Security:**
   - ✅ API key is stored in GitHub Secrets (encrypted)
   - ✅ Not exposed in code or logs
   - ✅ Only accessible to GitHub Actions and AWS App Runner

2. **Email Verification:**
   - ✅ Verification tokens expire after 24 hours
   - ✅ Tokens are single-use only
   - ✅ Stored securely in database

3. **Password Reset:**
   - ✅ Reset tokens expire after 1 hour
   - ✅ Tokens are single-use only
   - ✅ Old tokens invalidated when new one is requested

---

## ✅ Next Steps After Email Configuration

Once email verification is working:

1. **Test Password Reset Flow:**
   - Create "Forgot Password" page (frontend)
   - Create "Reset Password" page (frontend)
   - Test end-to-end password reset

2. **Add Rate Limiting:**
   - Prevent brute force attacks on auth endpoints
   - Limit email sending per user

3. **Create Legal Pages:**
   - Privacy Policy
   - Terms of Service

4. **Final Security Hardening:**
   - Lock down CORS to production domains only
   - Add secure headers (CSP, HSTS)

5. **Soft Launch 🚀**

---

## 📞 Support

**Resend Documentation:** https://resend.com/docs  
**Resend Support:** https://resend.com/support  
**GitHub Issues:** https://github.com/alphawizards/Propequitylab/issues

---

*Document created: 2026-01-09*  
*Last updated: 2026-01-09*
