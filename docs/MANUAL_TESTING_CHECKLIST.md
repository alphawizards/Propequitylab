# Manual Testing Checklist - PropEquityLab

**Date:** January 9, 2026
**Status:** Ready for Testing
**Estimated Time:** 2-3 hours
**Tester:** You (Project Owner)

---

## 🎯 Overview

This guide covers all manual testing that must be completed before alpha launch. The automated tests have already verified the infrastructure - now we need to verify the user experience.

**What's Already Verified (Automated):**
- ✅ Backend API health
- ✅ Frontend availability
- ✅ SSL certificates
- ✅ Security headers
- ✅ CORS configuration
- ✅ API endpoints exist

**What You Need to Test (Manual):**
- User interface and interactions
- Registration and login flows
- Calculator functionality
- Email delivery
- Cross-browser compatibility

---

## 📋 Pre-Testing Setup

### 1. Prepare Testing Browsers
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)
- [ ] Mobile browser (iOS Safari or Chrome Android)

### 2. Prepare Testing Email Accounts
Create 3 test email accounts for testing:
- **Account 1:** Your primary email (for main testing)
- **Account 2:** Alternative email (for duplicate registration tests)
- **Account 3:** Disposable email (for edge case testing)

Recommended services:
- Gmail
- Outlook
- Temp-mail.org (for disposable)

### 3. Testing Tools
- [ ] Browser DevTools (F12) open to Console tab
- [ ] Network tab ready for monitoring API calls
- [ ] Calculator ready for verifying calculations
- [ ] Notepad for recording bugs

---

## 🧪 Test Suite 1: New User Journey (30 minutes)

### Homepage Visit
**URL:** https://propequitylab.com

- [ ] Page loads in < 3 seconds
- [ ] Hero section displays correctly
- [ ] "PropEquityLab" branding visible (not "Zapiio" or "Emergent")
- [ ] Navigation menu works
- [ ] Calculator cards display
- [ ] Footer shows correct company info
- [ ] No console errors (F12 → Console tab)

**Expected Result:** Clean, professional homepage with PropEquityLab branding.

---

### Calculator Preview (Unauthenticated)

**Test Mortgage Calculator:**
1. [ ] Click "Mortgage Calculator" card
2. [ ] Calculator page loads
3. [ ] All input fields visible
4. [ ] Enter test data:
   - Loan Amount: $500,000
   - Interest Rate: 6.5%
   - Loan Term: 30 years
5. [ ] Click "Calculate"
6. [ ] Results display correctly
7. [ ] Monthly payment shown (should be ~$3,160)
8. [ ] "Sign up to save" prompt appears
9. [ ] No errors in console

**Expected Result:** Calculator works without login, prompts to sign up.

**Test Other Calculators:**
- [ ] Stamp Duty Calculator loads
- [ ] Equity Calculator loads
- [ ] Investment Property Calculator loads
- [ ] Rental Yield Calculator loads

**Expected Result:** All calculators accessible and functional.

---

### User Registration

**Starting Point:** Click "Sign Up" or "Register" button

1. [ ] Registration form displays
2. [ ] Enter test credentials:
   - Name: Test User
   - Email: [your-test-email@example.com]
   - Password: TestPass123!
3. [ ] Password strength indicator works
4. [ ] "Terms & Conditions" checkbox present
5. [ ] Click "Register" button
6. [ ] Loading indicator appears
7. [ ] Success message or redirect occurs
8. [ ] **Check email inbox**

**Email Verification Test:**
- [ ] Email received within 5 minutes
- [ ] Subject line correct (not "Zapiio")
- [ ] Email content displays properly
- [ ] Verification link present
- [ ] Click verification link
- [ ] Redirected to login or dashboard
- [ ] Success message appears

**Expected Result:** Account created, verification email received and working.

---

### First Login

**Starting Point:** Login page

1. [ ] Enter registered credentials
2. [ ] Click "Login" button
3. [ ] Loading indicator appears
4. [ ] Redirected to dashboard or onboarding
5. [ ] User name displayed in header
6. [ ] No console errors

**Expected Result:** Successful login, user authenticated.

---

### Dashboard Exploration (First Time User)

**Starting Point:** User just logged in

1. [ ] Dashboard loads
2. [ ] Welcome message or onboarding appears
3. [ ] Navigation menu includes:
   - [ ] Dashboard
   - [ ] Calculators
   - [ ] Properties (if applicable)
   - [ ] Settings/Profile
   - [ ] Logout
4. [ ] User profile menu works
5. [ ] Responsive on mobile (resize browser)

**Expected Result:** Clean dashboard with clear navigation.

---

## 🧪 Test Suite 2: Calculator Functionality (45 minutes)

### Mortgage Calculator - Full Test

**URL:** Dashboard → Calculators → Mortgage Calculator

**Test Case 1: Basic Calculation**
1. [ ] Enter:
   - Loan Amount: $800,000
   - Interest Rate: 6.0%
   - Loan Term: 25 years
2. [ ] Click "Calculate"
3. [ ] Results display:
   - [ ] Monthly payment shown
   - [ ] Total interest shown
   - [ ] Total amount shown
   - [ ] Amortization schedule visible
4. [ ] Verify calculation accuracy:
   - Monthly payment should be ~$5,164
   - Total interest should be ~$749,000

**Expected Result:** Accurate calculation with detailed breakdown.

**Test Case 2: Save Calculation**
1. [ ] Click "Save" button
2. [ ] Name prompt appears (e.g., "Home Loan Scenario 1")
3. [ ] Enter name, click save
4. [ ] Success message appears
5. [ ] Calculation appears in "Saved Calculations" list

**Expected Result:** Calculation saved to user account.

**Test Case 3: Export Calculation**
1. [ ] Click "Export PDF" button
2. [ ] PDF downloads
3. [ ] Open PDF
4. [ ] Verify PDF contains:
   - [ ] PropEquityLab branding (not Zapiio)
   - [ ] Calculation details
   - [ ] Results
   - [ ] Proper formatting

**Expected Result:** Professional PDF export.

**Test Case 4: Share Calculation**
1. [ ] Click "Share" button
2. [ ] Share options display (email/link)
3. [ ] Try email share:
   - [ ] Enter recipient email
   - [ ] Send
   - [ ] Success message
4. [ ] Try link share:
   - [ ] Copy link
   - [ ] Open in incognito/private window
   - [ ] Calculation visible (read-only)

**Expected Result:** Sharing works via email and link.

---

### Stamp Duty Calculator

**Test Australian States:**
1. [ ] Select State: NSW
2. [ ] Enter Purchase Price: $1,000,000
3. [ ] First Home Buyer: No
4. [ ] Calculate
5. [ ] Stamp duty displays (~$40,490 for NSW)
6. [ ] Repeat for other states:
   - [ ] VIC
   - [ ] QLD
   - [ ] SA
   - [ ] WA

**Expected Result:** Accurate stamp duty calculations for each state.

---

### Equity Calculator

**Test Case:**
1. [ ] Current Property Value: $1,200,000
2. [ ] Loan Balance: $600,000
3. [ ] Calculate
4. [ ] Results show:
   - [ ] Equity: $600,000
   - [ ] Equity %: 50%
   - [ ] LVR: 50%
5. [ ] Visual chart displays

**Expected Result:** Accurate equity calculation with visualization.

---

### Investment Property Calculator

**Complex Test:**
1. [ ] Purchase Price: $750,000
2. [ ] Rental Income: $600/week
3. [ ] Expenses:
   - [ ] Council rates: $2,000/year
   - [ ] Strata: $4,000/year
   - [ ] Insurance: $1,500/year
   - [ ] Management: 8%
4. [ ] Loan: $600,000 @ 6.5%
5. [ ] Calculate
6. [ ] Results show:
   - [ ] Gross yield
   - [ ] Net yield
   - [ ] Cash flow
   - [ ] Tax implications

**Expected Result:** Comprehensive investment analysis.

---

### Rental Yield Calculator

**Test Case:**
1. [ ] Property Value: $500,000
2. [ ] Weekly Rent: $400
3. [ ] Annual Expenses: $5,000
4. [ ] Calculate
5. [ ] Results show:
   - [ ] Gross yield: 4.16%
   - [ ] Net yield: ~3.16%

**Expected Result:** Accurate rental yield percentages.

---

## 🧪 Test Suite 3: User Account Management (30 minutes)

### Profile Management

**URL:** Dashboard → Settings/Profile

1. [ ] Profile page loads
2. [ ] Current user details displayed
3. [ ] Edit name:
   - [ ] Change name to "Updated Name"
   - [ ] Save changes
   - [ ] Success message
   - [ ] Name updates in header
4. [ ] Change email (if feature exists):
   - [ ] Enter new email
   - [ ] Verify email sent
   - [ ] Confirm change
5. [ ] Change password:
   - [ ] Enter current password
   - [ ] Enter new password
   - [ ] Confirm new password
   - [ ] Save
   - [ ] Success message
6. [ ] Test new password:
   - [ ] Logout
   - [ ] Login with new password
   - [ ] Success

**Expected Result:** All profile updates work correctly.

---

### Saved Calculations Management

**URL:** Dashboard → Saved Calculations (or similar)

1. [ ] List of saved calculations displays
2. [ ] For each saved calculation:
   - [ ] Click to view details
   - [ ] Details load correctly
   - [ ] Edit calculation:
     - [ ] Modify values
     - [ ] Save
     - [ ] Changes persist
   - [ ] Delete calculation:
     - [ ] Click delete
     - [ ] Confirmation prompt
     - [ ] Confirm delete
     - [ ] Calculation removed from list

**Expected Result:** Full CRUD functionality for saved calculations.

---

### Password Reset Flow

**Starting Point:** Logged out

1. [ ] Navigate to login page
2. [ ] Click "Forgot Password"
3. [ ] Enter email address
4. [ ] Submit
5. [ ] Success message (check email)
6. [ ] **Check email inbox:**
   - [ ] Password reset email received
   - [ ] Email branding correct (PropEquityLab)
   - [ ] Reset link present
7. [ ] Click reset link
8. [ ] Redirected to reset password page
9. [ ] Enter new password (twice)
10. [ ] Submit
11. [ ] Success message
12. [ ] Redirected to login
13. [ ] Login with new password
14. [ ] Success

**Expected Result:** Complete password reset flow working.

---

## 🧪 Test Suite 4: Error Handling (20 minutes)

### Registration Errors

**Test Invalid Email:**
1. [ ] Try registering with "notanemail"
2. [ ] Validation error appears
3. [ ] Error message clear

**Test Weak Password:**
1. [ ] Try password: "123"
2. [ ] Validation error appears
3. [ ] Password requirements shown

**Test Duplicate Email:**
1. [ ] Try registering with existing email
2. [ ] Error message: "Email already registered"
3. [ ] Suggested to login instead

**Expected Result:** Clear, helpful error messages.

---

### Login Errors

**Test Wrong Password:**
1. [ ] Enter correct email
2. [ ] Enter wrong password
3. [ ] Error message: "Invalid credentials"
4. [ ] No indication which field is wrong (security)

**Test Non-existent Email:**
1. [ ] Enter unregistered email
2. [ ] Enter any password
3. [ ] Error message: "Invalid credentials"

**Expected Result:** Generic error for security, clear messaging.

---

### Calculator Errors

**Test Invalid Input:**
1. [ ] Mortgage calculator
2. [ ] Enter negative loan amount
3. [ ] Validation error appears
4. [ ] Enter text instead of numbers
5. [ ] Validation error appears
6. [ ] Leave required field empty
7. [ ] Validation error appears

**Expected Result:** Input validation prevents invalid calculations.

---

### Network Errors

**Test Offline Behavior:**
1. [ ] Open calculator
2. [ ] Disable internet connection
3. [ ] Try to calculate
4. [ ] Error message: "Network error" or similar
5. [ ] Re-enable internet
6. [ ] Retry calculation
7. [ ] Works correctly

**Expected Result:** Graceful handling of network issues.

---

## 🧪 Test Suite 5: Cross-Browser Testing (30 minutes)

### Desktop Browsers

**For EACH browser (Chrome, Firefox, Safari, Edge):**

1. [ ] Homepage loads correctly
2. [ ] Registration works
3. [ ] Login works
4. [ ] Calculator works
5. [ ] Styling consistent
6. [ ] No console errors
7. [ ] Logout works

**Record any browser-specific issues in notes.**

---

### Mobile Testing

**Test on Mobile Device (or browser DevTools mobile mode):**

**Responsive Design:**
1. [ ] Homepage mobile-friendly
2. [ ] Navigation menu collapses to hamburger
3. [ ] Calculator inputs easy to tap
4. [ ] Results display properly
5. [ ] Forms usable on mobile
6. [ ] No horizontal scrolling
7. [ ] Text readable without zoom

**Mobile-Specific Features:**
1. [ ] Touch interactions work
2. [ ] Virtual keyboard doesn't break layout
3. [ ] Pinch-to-zoom works on charts
4. [ ] Buttons large enough to tap

**Expected Result:** Fully responsive on mobile devices.

---

## 🧪 Test Suite 6: Legal & Compliance (15 minutes)

### Privacy Policy

1. [ ] Navigate to Privacy Policy
2. [ ] Page loads
3. [ ] Content shows "PropEquityLab" (not Zapiio/Emergent)
4. [ ] Covers:
   - [ ] Data collection
   - [ ] Cookie usage
   - [ ] Third-party services
   - [ ] User rights
5. [ ] Date updated
6. [ ] Contact information present

**Expected Result:** Complete, up-to-date privacy policy.

---

### Terms of Service

1. [ ] Navigate to Terms of Service
2. [ ] Page loads
3. [ ] Content shows "PropEquityLab"
4. [ ] Covers:
   - [ ] Service description
   - [ ] User obligations
   - [ ] Disclaimers
   - [ ] Limitation of liability
5. [ ] Date updated
6. [ ] Contact information present

**Expected Result:** Complete, up-to-date terms of service.

---

### Cookie Consent (if applicable)

1. [ ] Visit site in fresh browser (clear cookies)
2. [ ] Cookie consent banner appears
3. [ ] Options to accept/decline
4. [ ] Preferences saved
5. [ ] Can update preferences later

**Expected Result:** GDPR-compliant cookie consent.

---

## 🧪 Test Suite 7: Performance Testing (15 minutes)

### Page Load Speed

**Use Chrome DevTools → Lighthouse:**

1. [ ] Run Lighthouse audit on homepage
2. [ ] Record scores:
   - Performance: ___/100
   - Accessibility: ___/100
   - Best Practices: ___/100
   - SEO: ___/100
3. [ ] Target scores: All > 90

**Test Other Pages:**
- [ ] Login page
- [ ] Dashboard
- [ ] Calculator page

**Expected Result:** All pages score > 90 on Lighthouse.

---

### Perceived Performance

**User Experience:**
1. [ ] Pages feel responsive
2. [ ] Loading indicators appear for slow operations
3. [ ] No long delays without feedback
4. [ ] Smooth transitions/animations

**Expected Result:** Fast, responsive user experience.

---

## 📝 Bug Reporting Template

When you find a bug, record it with this format:

```
**Bug #:** [number]
**Severity:** Critical / High / Medium / Low
**Page:** [URL or page name]
**Browser:** [Chrome/Firefox/Safari/Edge/Mobile]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]
**Screenshot:** [Attach if applicable]
**Console Errors:** [Any JavaScript errors]

**Workaround:** [If known]
```

---

## ✅ Testing Completion Checklist

After completing all tests:

- [ ] All test suites completed
- [ ] Bugs documented
- [ ] Critical bugs fixed and retested
- [ ] Screenshots taken of key features
- [ ] Performance scores recorded
- [ ] Cross-browser compatibility confirmed
- [ ] Mobile responsiveness verified
- [ ] Email delivery working
- [ ] Legal pages updated

---

## 🎯 Success Criteria

**Ready for Alpha Launch when:**
- ✅ No critical bugs
- ✅ All calculators functional
- ✅ Registration/login working
- ✅ Email delivery working
- ✅ Mobile-responsive
- ✅ Performance scores > 80
- ✅ No security warnings
- ⚠️ Minor bugs acceptable (document for later)

---

## 📊 Final Sign-Off

After completing all testing:

**Date Tested:** _______________
**Tester:** _______________
**Total Bugs Found:** _______________
**Critical Bugs:** _______________
**Bugs Fixed:** _______________
**Status:** ☐ Ready for Alpha ☐ Needs Work

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

**Next Steps After Testing:**
1. Fix critical bugs
2. Configure monitoring (UptimeRobot + Sentry)
3. Invite alpha users (use Alpha Invitation Kit)
4. Monitor for 48 hours
5. Collect feedback
6. Iterate and improve

---

**Testing Guide Created:** January 9, 2026
**Last Updated:** January 9, 2026
**Status:** Ready for Use
