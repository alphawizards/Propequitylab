# Email Verification Testing Checklist

**Purpose:** Verify that the Resend email service is working correctly in production  
**Created:** 2026-01-09  
**Prerequisites:** Resend API key configured in AWS App Runner

---

## 📋 Pre-Testing Checklist

Before starting tests, verify:

- [ ] `RESEND_API_KEY` is set in AWS App Runner environment variables
- [ ] `FROM_EMAIL` is set in AWS App Runner environment variables
- [ ] `FRONTEND_URL` is set to `https://propequitylab.pages.dev`
- [ ] Backend has been redeployed after adding environment variables
- [ ] Frontend is accessible at `https://propequitylab.pages.dev`

---

## 🧪 Test 1: New User Registration & Email Verification

### Steps:

1. **Navigate to Registration Page**
   - URL: `https://propequitylab.pages.dev/register`
   - Verify page loads correctly

2. **Fill Registration Form**
   - Name: `Test User`
   - Email: Use a **real email address you can access**
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`

3. **Submit Registration**
   - Click "Register" button
   - Expected: Success message or redirect

4. **Check Email Inbox** (within 2 minutes)
   - [ ] Email received from `Propequitylab <onboarding@resend.dev>`
   - [ ] Subject: "Welcome to PropEquityLab - Verify Your Email"
   - [ ] Email contains "Verify Email Address" button
   - [ ] Email is properly formatted (not broken HTML)

5. **Click Verification Link**
   - Click "Verify Email Address" button in email
   - Expected: Redirected to login page or success page
   - [ ] Success message displayed

6. **Login with Verified Account**
   - Go to: `https://propequitylab.pages.dev/login`
   - Email: (your test email)
   - Password: `TestPassword123!`
   - [ ] Login successful
   - [ ] Redirected to dashboard
   - [ ] Dashboard loads user data

7. **Test Session Persistence**
   - [ ] Refresh page → Still logged in
   - [ ] Navigate to different pages → Still logged in
   - [ ] Close tab, reopen → Still logged in (if "Remember me" checked)

### Expected Results:

✅ Email received within 1-2 minutes  
✅ Verification link works  
✅ User can login after verification  
✅ Dashboard accessible after login

---

## 🧪 Test 2: Email Not Received (Troubleshooting)

If email is not received in Test 1:

### Step 1: Check Spam/Junk Folder
- [ ] Check spam folder
- [ ] Check "Promotions" tab (Gmail)
- [ ] Check "Other" folder (Outlook)

### Step 2: Check AWS App Runner Logs
1. Go to AWS Console: https://console.aws.amazon.com/apprunner/
2. Select **propequitylab-api** service
3. Go to **Logs** tab
4. Search for recent logs

**Look for:**
```
✓ Email sent to test@example.com: Welcome to PropEquityLab - Verify Your Email
```

**If you see this instead:**
```
⚠️  WARNING: RESEND_API_KEY not set. Email sending will be simulated.
```
→ **Problem:** Environment variable not set correctly

### Step 3: Check Resend Dashboard
1. Go to: https://resend.com/emails
2. Login with your Resend account
3. Check recent emails
4. Look for:
   - [ ] Email appears in sent list
   - [ ] Status: "Delivered" (not bounced)
   - [ ] No error messages

### Step 4: Verify Environment Variables
1. Go to AWS App Runner console
2. Click **propequitylab-api** → **Configuration** tab
3. Verify these variables exist:
   - [ ] `RESEND_API_KEY` = `re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV`
   - [ ] `FROM_EMAIL` = `Propequitylab <onboarding@resend.dev>`
   - [ ] `FRONTEND_URL` = `https://propequitylab.pages.dev`

---

## 🧪 Test 3: Password Reset Email (Future)

**Note:** This test requires the "Forgot Password" page to be implemented first.

### Steps:

1. **Navigate to Login Page**
   - URL: `https://propequitylab.pages.dev/login`

2. **Click "Forgot Password" Link**
   - Expected: Redirected to `/forgot-password`

3. **Enter Email Address**
   - Email: (your verified test account)
   - Click "Send Reset Link"

4. **Check Email Inbox**
   - [ ] Email received within 1-2 minutes
   - [ ] Subject: "Reset Your PropEquityLab Password"
   - [ ] Email contains "Reset Password" button

5. **Click Reset Link**
   - Click "Reset Password" button
   - Expected: Redirected to `/reset-password?token=...`

6. **Enter New Password**
   - New Password: `NewTestPassword123!`
   - Confirm Password: `NewTestPassword123!`
   - Click "Reset Password"

7. **Login with New Password**
   - Go to login page
   - Use new password
   - [ ] Login successful

### Expected Results:

✅ Password reset email received  
✅ Reset link works  
✅ New password accepted  
✅ Can login with new password

---

## 🧪 Test 4: Multiple User Data Isolation

**Purpose:** Verify that users can only see their own data

### Steps:

1. **Register Second User**
   - Register with a different email: `test2@example.com`
   - Verify email
   - Login as User 2

2. **Add Data as User 2**
   - Add a property: "User 2 Property"
   - Add an asset: "User 2 Asset"
   - Note the data

3. **Logout and Login as User 1**
   - Logout
   - Login as first test user

4. **Verify Data Isolation**
   - [ ] User 1 does NOT see "User 2 Property"
   - [ ] User 1 does NOT see "User 2 Asset"
   - [ ] User 1 only sees their own data

5. **Check Dashboard**
   - [ ] Net worth calculations only include User 1's data
   - [ ] Charts only show User 1's data

### Expected Results:

✅ User 1 cannot see User 2's data  
✅ User 2 cannot see User 1's data  
✅ Dashboard calculations are isolated per user

---

## 🧪 Test 5: Email Verification Token Expiry

**Purpose:** Verify that old verification tokens expire

### Steps:

1. **Register New User**
   - Register with email: `test3@example.com`
   - **DO NOT click verification link yet**

2. **Wait 25 Hours** (or modify token expiry in code for testing)

3. **Click Verification Link After Expiry**
   - Expected: Error message "Verification link expired"
   - [ ] User cannot login
   - [ ] User must request new verification email

### Expected Results:

✅ Expired tokens are rejected  
✅ User must request new verification link

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| New User Registration | ⬜ Pass / ⬜ Fail | |
| Email Delivery | ⬜ Pass / ⬜ Fail | |
| Email Verification | ⬜ Pass / ⬜ Fail | |
| Login After Verification | ⬜ Pass / ⬜ Fail | |
| Password Reset (Future) | ⬜ Pass / ⬜ Fail / ⬜ N/A | |
| Data Isolation | ⬜ Pass / ⬜ Fail | |
| Token Expiry | ⬜ Pass / ⬜ Fail / ⬜ Skipped | |

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid or expired verification token"

**Causes:**
- Token already used
- Token expired (>24 hours old)
- Database issue

**Solutions:**
1. Register again with new email
2. Check backend logs for errors
3. Verify database connection

### Issue: "User already exists"

**Causes:**
- Email already registered
- Previous test account not cleaned up

**Solutions:**
1. Use a different email address
2. Or manually delete test user from database

### Issue: CORS errors in browser console

**Causes:**
- `CORS_ORIGINS` not configured correctly
- Frontend URL mismatch

**Solutions:**
1. Check `CORS_ORIGINS` includes `https://propequitylab.pages.dev`
2. Check browser console for exact error
3. Verify backend is accessible

---

## ✅ Sign-Off

**Tested by:** _________________  
**Date:** _________________  
**All tests passed:** ⬜ Yes / ⬜ No  
**Issues found:** _________________  
**Ready for production:** ⬜ Yes / ⬜ No

---

## 📞 Support

If tests fail, check:
1. `/docs/RESEND_EMAIL_SETUP.md` - Full configuration guide
2. AWS App Runner logs - Backend errors
3. Browser console - Frontend errors
4. Resend dashboard - Email delivery status

---

*Document created: 2026-01-09*  
*Last updated: 2026-01-09*
