# Day 4: Testing & Alpha Launch Guide

**Date:** January 9, 2026
**Status:** Ready to Execute
**Priority:** CRITICAL (Must complete before alpha launch)
**Time:** 4-6 hours

---

## 🎯 Overview

Day 4 is about thorough testing before inviting alpha users. This is your **quality gate** - the last chance to catch issues before real users experience them.

**Goal:** Ensure PropEquityLab is stable, secure, and performs well for alpha users.

---

## 📋 Testing Checklist

Use this checklist to track your progress:

### Pre-Launch Testing:
- [ ] End-to-end user flows (2 hours)
- [ ] Security testing (1 hour)
- [ ] Performance testing (1 hour)
- [ ] Cross-browser testing (30 min)
- [ ] Mobile responsiveness testing (30 min)
- [ ] Legal pages verification (15 min)
- [ ] Monitoring verification (15 min)

### Alpha Launch:
- [ ] Invite 5-10 alpha users
- [ ] Monitor for issues (first 24-48 hours)
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Prepare for beta launch

---

## 🧪 Part 1: End-to-End Testing (2 hours)

### Test Flow 1: New User Registration & Onboarding

**As a new visitor, I want to:**

#### Step 1: Homepage Visit
1. Visit: https://propequitylab.com
2. **Verify:**
   - [ ] Page loads in < 3 seconds
   - [ ] Hero section displays correctly
   - [ ] Calculator cards visible
   - [ ] CTA buttons work
   - [ ] No console errors (F12 → Console)

#### Step 2: View Calculator (Unauthenticated)
1. Click "Mortgage Calculator" card
2. **Verify:**
   - [ ] Calculator page loads
   - [ ] Input fields responsive
   - [ ] Can enter values without logging in
   - [ ] Results display correctly
   - [ ] "Sign up to save" prompt appears

#### Step 3: Register Account
1. Click "Sign Up" in navigation
2. Fill form:
   - Name: Test User
   - Email: test+[timestamp]@example.com
   - Password: TestPass123!
3. Submit
4. **Verify:**
   - [ ] Registration succeeds
   - [ ] Welcome email sent (check AWS SES logs)
   - [ ] Redirected to dashboard or calculator
   - [ ] User name displayed in header
   - [ ] Token stored in localStorage

#### Step 4: Use Calculator (Authenticated)
1. Go to Mortgage Calculator
2. Enter values:
   - Property value: $800,000
   - Deposit: $160,000 (20%)
   - Interest rate: 6.5%
   - Loan term: 30 years
3. **Verify:**
   - [ ] Calculations instant (< 500ms)
   - [ ] Results accurate
   - [ ] Charts render
   - [ ] Can save calculation
   - [ ] Save persists after refresh

#### Step 5: Password Reset Flow
1. Log out
2. Click "Forgot Password"
3. Enter email
4. **Verify:**
   - [ ] Reset email sent
   - [ ] Email contains reset link
   - [ ] Link redirects to reset page
   - [ ] Can set new password
   - [ ] Can log in with new password

#### Step 6: User Settings
1. Log in
2. Go to Settings/Profile
3. **Verify:**
   - [ ] Can view profile information
   - [ ] Can update name/email
   - [ ] Can change password
   - [ ] Changes persist
   - [ ] Success messages display

---

### Test Flow 2: Returning User Experience

**As a returning user, I want to:**

#### Step 1: Login
1. Visit homepage
2. Click "Login"
3. Enter credentials
4. **Verify:**
   - [ ] Login succeeds
   - [ ] Redirected to dashboard
   - [ ] Previous calculations visible
   - [ ] Session persists (refresh page)

#### Step 2: View Saved Calculations
1. Navigate to "My Calculations" or Dashboard
2. **Verify:**
   - [ ] All saved calculations listed
   - [ ] Can filter/sort
   - [ ] Can open saved calculation
   - [ ] Values pre-populated
   - [ ] Can edit and re-save

#### Step 3: Use Multiple Calculators
1. Try each calculator:
   - [ ] Mortgage Calculator
   - [ ] Stamp Duty Calculator (if implemented)
   - [ ] Equity Calculator (if implemented)
2. **Verify:**
   - [ ] Each calculator functions independently
   - [ ] Navigation between calculators smooth
   - [ ] No data bleeding between calculators

#### Step 4: Share Calculation (if implemented)
1. Perform a calculation
2. Click "Share" button
3. **Verify:**
   - [ ] Share dialog opens
   - [ ] Can copy link
   - [ ] Shared link works (open in incognito)
   - [ ] Recipient sees calculation (read-only)

#### Step 5: Export Data (if implemented)
1. Perform a calculation
2. Click "Export" → PDF or CSV
3. **Verify:**
   - [ ] Download initiates
   - [ ] File opens correctly
   - [ ] Data accurate
   - [ ] Formatting professional

---

### Test Flow 3: Error Handling

**As a user, when things go wrong:**

#### Network Errors
1. Disconnect internet
2. Try to login
3. **Verify:**
   - [ ] Error message displays
   - [ ] Message is user-friendly
   - [ ] No console errors crash app
   - [ ] Sentry captures error (check dashboard)

#### Invalid Inputs
1. Try invalid calculator inputs:
   - Negative numbers
   - Text in number fields
   - Extreme values (e.g., $999,999,999)
2. **Verify:**
   - [ ] Validation messages clear
   - [ ] App doesn't crash
   - [ ] Can correct and continue

#### Session Expiration
1. Log in
2. Delete JWT token from localStorage
3. Try to save calculation
4. **Verify:**
   - [ ] Prompted to log in again
   - [ ] Redirected to login
   - [ ] After login, returned to calculator

#### 404 Errors
1. Visit invalid URL: /nonexistent-page
2. **Verify:**
   - [ ] 404 page displays
   - [ ] Navigation still works
   - [ ] Can return to homepage

---

## 🔒 Part 2: Security Testing (1 hour)

### Authentication Security

#### Test 1: SQL Injection
1. Try SQL injection in login form:
   - Email: `admin'--`
   - Email: `' OR '1'='1`
2. **Verify:**
   - [ ] Login fails safely
   - [ ] No database errors exposed
   - [ ] Sentry captures attempt (if configured)

#### Test 2: XSS (Cross-Site Scripting)
1. Try XSS in text inputs:
   - Name: `<script>alert('XSS')</script>`
   - Email: `<img src=x onerror=alert('XSS')>`
2. **Verify:**
   - [ ] Input sanitized
   - [ ] Script doesn't execute
   - [ ] Displays as plain text

#### Test 3: CSRF Protection
1. Open DevTools → Network
2. Perform authenticated action (save calculation)
3. **Verify:**
   - [ ] JWT token sent in Authorization header
   - [ ] Backend validates token
   - [ ] Cannot replay request without valid token

#### Test 4: Password Security
1. Try weak passwords:
   - `12345678`
   - `password`
   - `test`
2. **Verify:**
   - [ ] Rejected (if password requirements enforced)
   - [ ] Error message guides user
   - [ ] Suggests strong password

#### Test 5: Rate Limiting (if implemented)
1. Attempt multiple rapid logins (wrong password)
2. **Verify:**
   - [ ] Account locked or rate limited after N attempts
   - [ ] Clear error message
   - [ ] Can retry after cooldown

---

### API Security

#### Test 6: Unauthorized API Access
1. Log out
2. Use Postman or curl to call API:
   ```bash
   curl https://[backend-url]/api/v1/calculations \
     -H "Content-Type: application/json"
   ```
3. **Verify:**
   - [ ] Returns 401 Unauthorized
   - [ ] No data leaked

#### Test 7: Authorization Bypass
1. Log in as User A
2. Copy User A's calculation ID
3. Log in as User B
4. Try to access User A's calculation via API
5. **Verify:**
   - [ ] Returns 403 Forbidden
   - [ ] User B cannot see User A's data

---

## ⚡ Part 3: Performance Testing (1 hour)

### Page Load Performance

#### Test 1: Homepage Load Speed
1. Open Chrome DevTools → Network
2. Hard refresh (Ctrl+Shift+R)
3. **Verify:**
   - [ ] First Contentful Paint < 1.5s
   - [ ] Largest Contentful Paint < 2.5s
   - [ ] Total page weight < 2MB
   - [ ] JavaScript bundle < 500KB

#### Test 2: Calculator Page Load
1. Navigate to Mortgage Calculator
2. Check Network tab
3. **Verify:**
   - [ ] Page interactive in < 2s
   - [ ] No unnecessary API calls
   - [ ] Images optimized (WebP/AVIF)
   - [ ] CSS not blocking render

#### Test 3: API Response Times
1. DevTools → Network → Filter: XHR
2. Perform actions (login, save calculation)
3. **Verify:**
   - [ ] Login: < 500ms
   - [ ] Save calculation: < 300ms
   - [ ] Fetch calculations: < 400ms
   - [ ] All API calls < 1s

---

### Lighthouse Audit

#### Test 4: Run Lighthouse
1. DevTools → Lighthouse tab
2. Select:
   - Categories: Performance, Accessibility, Best Practices, SEO
   - Device: Desktop & Mobile
3. Run audit
4. **Verify:**
   - [ ] Performance: > 90
   - [ ] Accessibility: > 90
   - [ ] Best Practices: > 90
   - [ ] SEO: > 90

---

### Stress Testing (Optional)

#### Test 5: Concurrent Users (Manual)
1. Open 5-10 browser tabs
2. Log in different users in each tab
3. Perform calculations simultaneously
4. **Verify:**
   - [ ] All requests succeed
   - [ ] No race conditions
   - [ ] Correct data isolation (users don't see each other's data)

---

## 📱 Part 4: Cross-Browser Testing (30 min)

### Desktop Browsers

Test in each browser:
- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest, if on Mac)
- [ ] **Edge** (latest)

**For each browser, verify:**
1. Homepage renders correctly
2. Calculator functions work
3. Forms submit correctly
4. No console errors
5. Authentication works

---

### Mobile Browsers

Test on real devices (or Chrome DevTools Device Mode):
- [ ] **iPhone Safari** (iOS)
- [ ] **Chrome Android**
- [ ] **Samsung Internet**

**For each mobile browser, verify:**
1. Touch interactions work
2. Inputs show mobile keyboard
3. Calculator results readable
4. Navigation menu responsive
5. No horizontal scrolling

---

## 📱 Part 5: Mobile Responsiveness (30 min)

### Breakpoints to Test

Test at these screen widths:
- [ ] **Mobile**: 375px (iPhone SE)
- [ ] **Mobile Large**: 428px (iPhone 14 Pro Max)
- [ ] **Tablet**: 768px (iPad)
- [ ] **Desktop**: 1280px
- [ ] **Large Desktop**: 1920px

**For each breakpoint, verify:**
1. Layout doesn't break
2. Text readable (not too small)
3. Buttons tappable (min 44x44px)
4. Images scale correctly
5. Navigation works

---

### Specific Mobile Tests

#### Test 1: Mortgage Calculator on Mobile
1. Open on iPhone (or 375px viewport)
2. **Verify:**
   - [ ] Input fields full width
   - [ ] Number keyboard appears for number inputs
   - [ ] Results card scrollable
   - [ ] Charts responsive
   - [ ] CTAs visible without scrolling

#### Test 2: Navigation on Mobile
1. Open hamburger menu (if applicable)
2. **Verify:**
   - [ ] Menu opens smoothly
   - [ ] All links accessible
   - [ ] Closes when clicking outside
   - [ ] No overlap with content

#### Test 3: Forms on Mobile
1. Test registration on mobile
2. **Verify:**
   - [ ] Fields don't zoom in excessively
   - [ ] Error messages visible
   - [ ] Submit button reachable
   - [ ] Success message displays correctly

---

## 📄 Part 6: Legal Pages Verification (15 min)

### Test Each Legal Page

#### Privacy Policy
1. Visit: /privacy-policy
2. **Verify:**
   - [ ] Page loads correctly
   - [ ] Content displays (no 404 or blank)
   - [ ] Date is January 9, 2026
   - [ ] All sections present (from legal documents PR)
   - [ ] Navigation works
   - [ ] Footer link works

#### Terms of Service
1. Visit: /terms-of-service
2. **Verify:**
   - [ ] Page loads correctly
   - [ ] Content complete
   - [ ] Date correct
   - [ ] No broken links

#### Cookie Policy
1. Visit: /cookie-policy
2. **Verify:**
   - [ ] Page loads correctly
   - [ ] Lists all cookies used
   - [ ] Opt-out instructions clear

#### Contact Page (if exists)
1. Visit: /contact
2. **Verify:**
   - [ ] Form works
   - [ ] Email sent (check AWS SES)
   - [ ] Success message displays

---

## 📊 Part 7: Monitoring Verification (15 min)

### Sentry Error Tracking

#### Test 1: Verify Sentry Initialized
1. Open DevTools → Console
2. Visit site
3. **Verify:**
   - [ ] See: `[Sentry] Error tracking initialized`
   - [ ] No Sentry errors in console

#### Test 2: Trigger Test Error
1. Open console, run:
   ```javascript
   throw new Error('[TEST] Manual error for Sentry verification');
   ```
2. **Verify:**
   - [ ] Error appears in Sentry dashboard within 30s
   - [ ] User context attached (if logged in)
   - [ ] Stack trace visible
   - [ ] Browser/OS information present

---

### UptimeRobot Monitoring

#### Test 1: Verify Monitors Active
1. Log in to UptimeRobot dashboard
2. **Verify:**
   - [ ] Frontend monitor showing "Up" (green)
   - [ ] Backend API monitor showing "Up" (green)
   - [ ] Response times < 1000ms
   - [ ] No recent downtime incidents

#### Test 2: Test Alert
1. Pause one monitor (triggers downtime)
2. **Verify:**
   - [ ] Alert email received within 5 minutes
   - [ ] Alert contains correct information
   - [ ] Restart monitor
   - [ ] "Back Up" email received

---

### Analytics (if configured)

#### Test 1: Verify GA4 Tracking
1. Log in to GA4 → Reports → Realtime
2. Visit site and use calculators
3. **Verify:**
   - [ ] See yourself as active user
   - [ ] Page views tracked
   - [ ] Calculator events visible
   - [ ] User properties attached (if logged in)

---

## 👥 Part 8: Alpha User Invitation (30 min)

### Select Alpha Users

**Ideal alpha users:**
- [ ] 5-10 people total
- [ ] Mix of technical and non-technical
- [ ] Australian residents (for relevance)
- [ ] Interested in property investment
- [ ] Willing to provide detailed feedback

**Suggested sources:**
- Friends/family in property market
- LinkedIn connections (real estate/finance)
- Online communities (Reddit r/AusFinance, PropertyChat)
- Colleagues interested in property

---

### Prepare Alpha Invitation

**Email template:**

```
Subject: [Alpha Invite] PropEquityLab - Property Investment Calculators

Hi [Name],

I'm excited to invite you to be an alpha tester for PropEquityLab - a new Australian property investment calculator platform.

**What is it?**
PropEquityLab provides free, accurate calculators for:
- Mortgage repayments
- Stamp duty (all Australian states)
- Property equity
- Rental income analysis

**What I need from you:**
- 30-60 minutes to explore the platform
- Honest feedback on what works and what doesn't
- Report any bugs or confusing parts
- Suggestions for improvement

**Get started:**
1. Visit: https://propequitylab.com
2. Create a free account
3. Try the calculators
4. Email me feedback: [your-email]

**Important:**
This is an early alpha version. You may encounter bugs - that's expected! Your feedback will directly shape the final product.

**Timeline:**
Please test by [date, 7 days from now]. After alpha, I'll incorporate feedback and launch to the public.

Thank you for helping me build something valuable for Australian property investors!

Best regards,
[Your Name]

---

**Feedback areas:**
- Is the homepage clear?
- Are calculators easy to use?
- Do results make sense?
- Any bugs or errors?
- What's missing?
- Would you use this regularly?
```

---

### Invite Process

1. **Send invitations:**
   - [ ] Email 5-10 selected alpha users
   - [ ] Include link: https://propequitylab.com
   - [ ] Set deadline: 7 days

2. **Provide support:**
   - [ ] Be available for questions
   - [ ] Monitor Sentry for errors
   - [ ] Check UptimeRobot for downtime
   - [ ] Respond to feedback quickly

3. **Collect feedback:**
   - [ ] Create feedback form (Google Forms/Typeform)
   - [ ] Questions to ask:
     - What did you like most?
     - What frustrated you?
     - Did you encounter any bugs?
     - What features are missing?
     - Would you recommend to others?
     - Rating: 1-10

---

## 📊 Part 9: Monitor Alpha Period (48 hours)

### First 24 Hours

**Hourly checks:**
- [ ] UptimeRobot status (any downtime?)
- [ ] Sentry dashboard (any errors?)
- [ ] AWS App Runner logs (any crashes?)
- [ ] User feedback emails

**If issues found:**
1. Prioritize: Critical (blocks usage) > High (annoying) > Medium (minor) > Low (polish)
2. Fix critical issues immediately
3. Document all feedback
4. Deploy fixes quickly

---

### After 48 Hours

**Review metrics:**
- [ ] How many alpha users signed up?
- [ ] How many calculations performed?
- [ ] Any error patterns in Sentry?
- [ ] Average session duration (GA4)
- [ ] Most popular calculator

**Collect feedback:**
- [ ] Email alpha users for detailed feedback
- [ ] Schedule 15-min calls with 2-3 users (optional)
- [ ] Analyze feedback themes

---

## ✅ Success Criteria

Alpha launch is successful when:

### Technical:
- [ ] No critical bugs blocking usage
- [ ] Uptime > 99% during alpha period
- [ ] All calculators functioning correctly
- [ ] Authentication working reliably
- [ ] Performance acceptable (< 3s page loads)

### User Experience:
- [ ] At least 3/5 alpha users completed testing
- [ ] Average rating ≥ 7/10
- [ ] No major usability complaints
- [ ] Positive sentiment overall

### Business:
- [ ] At least 50 calculations performed
- [ ] No security incidents
- [ ] Monitoring systems working
- [ ] Clear feedback for improvements

---

## 🚀 After Alpha: Next Steps

Once alpha testing is complete:

1. **Fix critical issues** (Priority 1)
2. **Incorporate feedback** (Priority 2-3 items)
3. **Prepare for beta launch:**
   - [ ] Expand to 50-100 users
   - [ ] Enable analytics
   - [ ] Add more calculators (if feedback requests)
   - [ ] Improve onboarding based on feedback

4. **Public launch planning:**
   - [ ] SEO optimization
   - [ ] Content marketing
   - [ ] Social media presence
   - [ ] Partnership outreach

---

## 📝 Testing Checklist Summary

**Before inviting alpha users, ensure:**
- [ ] All end-to-end flows tested
- [ ] Security vulnerabilities checked
- [ ] Performance acceptable (Lighthouse > 90)
- [ ] Mobile responsive
- [ ] Legal pages live
- [ ] Monitoring active (Sentry + UptimeRobot)
- [ ] No critical console errors

**Ready to launch alpha!** 🎉

---

**Time Budget:**
- End-to-end testing: 2 hours
- Security testing: 1 hour
- Performance testing: 1 hour
- Cross-browser/mobile: 1 hour
- Legal pages + monitoring: 30 min
- Alpha invitation: 30 min
- **Total:** ~6 hours

---

**Status:** Ready to execute
**Next:** Complete testing, then invite alpha users
