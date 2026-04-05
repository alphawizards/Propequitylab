# UX Gap Fixes — Completed Work

## Phase 1: Quick Fixes

### 1. $4M Net Worth Preset
**File:** `frontend/src/components/onboarding/steps/GoalsStep.jsx`
- Added `4000000` to the target equity presets array
- Presets are now: $1M / $2M / $4M / $5M / $10M

### 2. Summary CTA Copy
**File:** `frontend/src/components/onboarding/steps/SummaryStep.jsx`
- Changed button text from `"Go to Dashboard"` → `"Complete Setup"`
- Changed loading state from `"Setting up..."` → `"Completing..."`

### 3. Investment Property Loan Type (Frontend)
**File:** `frontend/src/components/onboarding/steps/LiabilitiesStep.jsx`
- Added `Building` to lucide-react imports
- Added `{ value: 'investment_loan', label: 'Investment Property Loan', icon: Building }` after Mortgage (PPOR) in `LIABILITY_TYPES`

### 4. Backend Liability Model Updates
**File:** `backend/models/liability.py`
- Updated inline comment on `type` field (line 31) to list all valid types including `mortgage`, `investment_loan`, and `buy_now_pay_later`
- Added `"mortgage"` and `"investment_loan"` to the `LIABILITY_TYPES` reference list

---

## Phase 2: Public Landing Page

### New File
**File:** `frontend/src/pages/LandingPage.jsx`
- Full marketing page for unauthenticated visitors
- **Nav:** logo + Sign in / Get started CTA
- **Hero:** headline, value prop, two CTAs (Start for free / Sign in), "No credit card required"
- **Features section:** 4 cards — Property Portfolio Tracking, Cash Flow Analysis, Growth Projections, Scenario Modelling
- **Trust/Benefits section:** 4 bullet points (Australian market focus, debt types, security) + sign-up call-to-action card
- **Footer:** copyright, Privacy Policy, Terms of Service, Mortgage Calculator links
- Emerald theme, fully responsive, consistent with app design

### Modified File
**File:** `frontend/src/App.js`
- Imported `LandingPage`
- Updated `RootRedirect` component: unauthenticated users now see `<LandingPage />` at `/` instead of being redirected to `/login`
- Authenticated users with incomplete onboarding still redirect to `/onboarding`
- Authenticated users with completed onboarding still redirect to `/dashboard`

---

## Build Verification
- `npm run build` passed with no errors or warnings
- Bundle size delta: +1.71 kB JS, +115 B CSS (landing page only)
