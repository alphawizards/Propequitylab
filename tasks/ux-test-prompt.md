# PropEquityLab — UX Test Prompt & File Map

> Paste the **PERPLEXITY PROMPT** section into your Perplexity agent.
> Use the **FILE MAP** section to review or fix issues found during testing.

---

## FILE MAP — Relevant source files per test step

| Step | Screen | Frontend Files | Backend Files |
|------|--------|---------------|---------------|
| 1 | Sign Up | `frontend/src/pages/Login.jsx`<br>`frontend/src/pages/Register.jsx`<br>`frontend/src/context/AuthContext.jsx`<br>`frontend/src/context/UserContext.jsx` | `backend/routes/clerk_webhooks.py` |
| 2 | Welcome | `frontend/src/components/onboarding/steps/WelcomeStep.jsx`<br>`frontend/src/components/onboarding/WelcomeModal.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | — |
| 3 | About You | `frontend/src/components/onboarding/steps/AboutYouStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | `backend/routes/onboarding.py` |
| 4 | Income | `frontend/src/components/onboarding/steps/IncomeStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | `backend/routes/income.py`<br>`backend/routes/onboarding.py` |
| 5 | Spending | `frontend/src/components/onboarding/steps/SpendingStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | `backend/routes/expenses.py`<br>`backend/routes/onboarding.py` |
| 6 | Assets | `frontend/src/components/onboarding/steps/AssetsStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | `backend/routes/assets.py`<br>`backend/routes/onboarding.py` |
| 7 | Liabilities | `frontend/src/components/onboarding/steps/LiabilitiesStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | `backend/routes/liabilities.py`<br>`backend/routes/onboarding.py` |
| 8 | Goals / FIRE | `frontend/src/components/onboarding/steps/GoalsStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx` | `backend/routes/portfolios.py`<br>`backend/routes/plans.py` |
| 9 | Summary & Complete | `frontend/src/components/onboarding/steps/SummaryStep.jsx`<br>`frontend/src/components/onboarding/OnboardingWizard.jsx`<br>`frontend/src/context/UserContext.jsx`<br>`frontend/src/context/PortfolioContext.jsx` | `backend/routes/onboarding.py`<br>`backend/routes/portfolios.py` |
| 10 | Dashboard | `frontend/src/pages/Dashboard.jsx`<br>`frontend/src/pages/DashboardNew.jsx`<br>`frontend/src/components/dashboard/KPICard.jsx`<br>`frontend/src/components/dashboard/PortfolioHeader.jsx`<br>`frontend/src/components/dashboard/PortfolioSnapshotWidget.jsx`<br>`frontend/src/context/PortfolioContext.jsx` | `backend/routes/dashboard.py`<br>`backend/routes/portfolios.py` |
| 11 | Add Property | `frontend/src/pages/PropertiesPage.jsx`<br>`frontend/src/components/properties/PropertyFormModal.jsx`<br>`frontend/src/components/properties/PropertyCard.jsx`<br>`frontend/src/components/properties/PropertyDetailsModal.jsx`<br>`frontend/src/components/properties/LoanManager.jsx` | `backend/routes/properties.py`<br>`backend/routes/loans.py`<br>`backend/routes/valuations.py` |
| 12 | Projections | `frontend/src/pages/ProjectionsPage.jsx`<br>`frontend/src/pages/PlansPage.jsx`<br>`frontend/src/components/dashboard/ProjectionChart.jsx`<br>`frontend/src/components/dashboard/ProjectionControls.jsx`<br>`frontend/src/components/dashboard/ForecastTable.jsx` | `backend/routes/projections.py`<br>`backend/routes/plans.py`<br>`backend/routes/scenarios.py` |

### Supporting files relevant to ALL steps

| File | Role |
|------|------|
| `frontend/src/services/api.js` | All API calls — check this if data isn't saving or loading correctly |
| `frontend/src/context/PortfolioContext.jsx` | Portfolio state shared across the whole app |
| `frontend/src/context/UserContext.jsx` | User profile + onboarding completion state |
| `backend/server.py` | Route mounting, CORS, middleware |
| `backend/utils/auth.py` | Clerk JWT verification on every protected endpoint |
| `backend/utils/database.py` | DB session management |

---

## PERPLEXITY PROMPT

Paste everything below this line into your Perplexity agent.

---

```
SYSTEM ROLE
You are a senior UX quality tester evaluating PropEquityLab, an Australian property
investment portfolio management platform. Your job is to act as a real first-time user,
walk through every data entry screen, and produce a world-class test report grading
the user experience.

You are playing the role of this specific user:

  NAME:        Sarah Chen
  AGE:         34 (DOB: 15 March 1991)
  LOCATION:    Queensland (QLD)
  SITUATION:   Married couple, dual income, owns one investment property, wants to
               reach financial independence by 55. Technically comfortable but not
               a developer. Uses mobile and desktop. Has moderate financial literacy.

---

TASK: Complete the full PropEquityLab onboarding and first-use experience at
https://propequitylab.com — then grade every step.

---

STEP-BY-STEP USER STORY

Follow these steps exactly. At each step, record what you observe, what you felt
as Sarah, and score the UX (1–10). Flag any friction, confusion, missing validation,
or broken behaviour.

─────────────────────────────────────────
STEP 1 — SIGN UP
─────────────────────────────────────────
Action: Go to https://propequitylab.com and create a new account.
  • Email: sarah.chen.test.2026@gmail.com
  • Use "Continue with Google" if available, otherwise email/password.

Check:
  □ Does the sign-up page load instantly?
  □ Is it clear what PropEquityLab does before you sign up?
  □ Is there any trust signal (SSL, privacy note, no credit card)?
  □ After signup, where does it send you?

Grade: STEP_1_SCORE /10

─────────────────────────────────────────
STEP 2 — ONBOARDING WIZARD: WELCOME
─────────────────────────────────────────
Action: Read the welcome screen. Do NOT skip — read every word.

Check:
  □ Is the value proposition immediately clear?
  □ Does it explain what the wizard will ask and why?
  □ Is there a skip option visible? Does it feel safe to proceed?
  □ Is the tone warm and encouraging?

Grade: STEP_2_SCORE /10

─────────────────────────────────────────
STEP 3 — ONBOARDING WIZARD: ABOUT YOU
─────────────────────────────────────────
Action: Fill in Sarah's personal details.
  • Planning Type: Couple
  • Your Name: Sarah Chen
  • Date of Birth: 15/03/1991
  • Partner's Name: Michael Chen
  • Partner's Date of Birth: 22/07/1988
  • State: Queensland

Check:
  □ When you select "Couple" — do the partner fields appear immediately without a page reload?
  □ Is the date of birth input intuitive (date picker vs manual)? Try typing it manually.
  □ Does the state dropdown include all 8 Australian states/territories?
  □ Is there any validation if you leave Name blank and click Continue?
  □ Does the progress bar accurately reflect Step 2 of 8?

Grade: STEP_3_SCORE /10

─────────────────────────────────────────
STEP 4 — ONBOARDING WIZARD: INCOME
─────────────────────────────────────────
Action: Add these income sources one at a time.

  Income 1:
  • Name: Sarah's Salary
  • Type: Salary/Wages
  • Amount: 95000
  • Frequency: Annual
  • Growth Rate: 3.5%

  Income 2:
  • Name: Michael's Salary
  • Type: Salary/Wages
  • Amount: 115000
  • Frequency: Annual
  • Growth Rate: 3%

  Income 3:
  • Name: Rental Property – Brisbane
  • Type: Rental Income
  • Amount: 2200
  • Frequency: Monthly
  • Growth Rate: 2.5%

Check:
  □ After adding Income 1, does the "Total Annual Income" card update immediately to $95,000?
  □ After adding all three, does the total calculate correctly?
    Expected: $95,000 + $115,000 + ($2,200 × 12 = $26,400) = $236,400
  □ Can you delete an income source and see the total update instantly?
  □ Try clicking "Add Income" with an empty name — what happens?
  □ Is the Growth Rate field clearly labelled? Do you know what it means?

Grade: STEP_4_SCORE /10

─────────────────────────────────────────
STEP 5 — ONBOARDING WIZARD: SPENDING
─────────────────────────────────────────
Action: Add these monthly expenses.

  Expense 1: Groceries — $1,200/month
  Expense 2: Mortgage (PPOR) — $3,400/month
  Expense 3: Car/Transport — $600/month
  Expense 4: Insurance — $350/month
  Expense 5: Entertainment — $500/month

Check:
  □ Does total annual spending calculate correctly?
    Expected: ($1,200+$3,400+$600+$350+$500) × 12 = $72,600/year
  □ Is there a "savings rate" or "surplus" indicator that shows income minus expenses?
  □ Are there expense category suggestions or icons that help guide entry?
  □ What happens if you add a duplicate category name?
  □ Is it clear this is the Spending step (Step 4 of 7 after Welcome)?

Grade: STEP_5_SCORE /10

─────────────────────────────────────────
STEP 6 — ONBOARDING WIZARD: ASSETS
─────────────────────────────────────────
Action: Add these non-property assets.

  Asset 1:
  • Name: Sarah's Super (AustralianSuper)
  • Type: Superannuation
  • Current Value: 87,000
  • Expected Return: 7.5%
  • Regular Contribution: 950/month

  Asset 2:
  • Name: Share Portfolio (ASX)
  • Type: Shares
  • Current Value: 42,500
  • Expected Return: 8%
  • Regular Contribution: 500/month

  Asset 3:
  • Name: Emergency Fund
  • Type: Cash/Savings
  • Current Value: 25,000
  • Expected Return: 4.5%
  • Regular Contribution: 0

Check:
  □ Is it clear these are NON-property assets and properties are added separately?
  □ Does the "Total Other Assets" counter update live — should show $154,500
  □ Do the contribution fields make sense — is "Regular Contribution" clearly monthly?
  □ If you enter a negative value for Expected Return, what happens?
  □ Is Superannuation available as a type in the dropdown?

Grade: STEP_6_SCORE /10

─────────────────────────────────────────
STEP 7 — ONBOARDING WIZARD: LIABILITIES
─────────────────────────────────────────
Action: Add these liabilities.

  Liability 1:
  • Name: PPOR Mortgage (ANZ)
  • Type: Mortgage
  • Current Balance: 520,000
  • Interest Rate: 6.2%
  • Monthly Repayment: 3,400

  Liability 2:
  • Name: Investment Property Loan (CBA)
  • Type: Mortgage
  • Current Balance: 380,000
  • Interest Rate: 6.5%
  • Monthly Repayment: 2,500

  Liability 3:
  • Name: Car Loan
  • Type: Personal Loan
  • Current Balance: 18,000
  • Interest Rate: 8.9%
  • Monthly Repayment: 550

Check:
  □ Does total liabilities update to $918,000?
  □ Is the interest rate field clearly labelled as % per annum?
  □ Does the form distinguish between a mortgage and a personal loan?
  □ Is there any net worth indicator (assets minus liabilities) visible at this stage?
  □ What happens if you enter 0 for monthly repayment?

Grade: STEP_7_SCORE /10

─────────────────────────────────────────
STEP 8 — ONBOARDING WIZARD: GOALS (FIRE TARGETS)
─────────────────────────────────────────
Action: Set Sarah's financial independence targets.

  • Target Retirement Age: 55 (drag slider from default 60 to 55)
  • Target Net Worth: $4,000,000 (click the $4M preset if available, else type it)
  • Target Passive Income: $150,000/year (click the $150K preset)

Check:
  □ Does the slider for retirement age feel smooth and responsive?
  □ When you drag to age 55, does it instantly recalculate "years away" correctly?
    Sarah's current age is 34, so it should show "21 years away" and year 2047
  □ Do the preset buttons ($1M, $2M, $5M, $10M) instantly populate the field?
  □ Is the "per month" calculator shown for passive income? At $150K/year it should say $12,500/month
  □ Is the FIRE Goal Summary card at the bottom accurate?
  □ Does anything feel confusing about "Target Net Worth" vs "Target Passive Income"?

Grade: STEP_8_SCORE /10

─────────────────────────────────────────
STEP 9 — ONBOARDING WIZARD: SUMMARY & COMPLETE
─────────────────────────────────────────
Action: Review the summary screen. Do not click Complete yet — read everything first.

Check:
  □ Does the summary accurately reflect all data entered across steps 2–8?
  □ Are the calculated totals correct?
    - Annual Income: ~$236,400
    - Annual Expenses: ~$72,600
    - Savings Rate: ~69.3%
    - Total Assets (non-property): $154,500
    - Total Liabilities: $918,000
  □ Is there a way to go back and edit a section from the summary?
  □ Is the "Complete Setup" CTA clear and does it feel like a positive moment?
  □ What happens immediately after you click Complete — where do you land?

Action: Click "Complete Setup"

Grade: STEP_9_SCORE /10

─────────────────────────────────────────
STEP 10 — DASHBOARD (FIRST IMPRESSION)
─────────────────────────────────────────
Action: You've just landed on the dashboard for the first time.

Check:
  □ Does the dashboard load within 2 seconds?
  □ Does it show Sarah's data immediately, or does it feel empty/generic?
  □ Are the KPI cards (net worth, income, etc.) populated with realistic numbers?
  □ Is there a clear "next action" prompt — e.g., "Add your first property"?
  □ Is there any welcome/celebration message acknowledging onboarding completion?
  □ Does the navigation make sense? Is it clear where Properties, Projections, etc. are?

Grade: STEP_10_SCORE /10

─────────────────────────────────────────
STEP 11 — ADD FIRST PROPERTY (POST-ONBOARDING)
─────────────────────────────────────────
Action: Navigate to Properties and add Sarah's existing investment property.

  Property Details:
  • Address: 14 Waterfront Drive, Kangaroo Point QLD 4169
  • Property Type: Unit/Apartment
  • Purchase Price: $620,000
  • Purchase Date: March 2021
  • Current Estimated Value: $715,000
  • Loan Balance: 380,000
  • Interest Rate: 6.5%
  • Weekly Rent: $550
  • Property Manager Fee: 8%
  • Council Rates: $1,800/year
  • Insurance: $1,200/year
  • Strata Fees: $3,600/year

Check:
  □ Is the "Add Property" button easy to find from the dashboard?
  □ Does the property form have all the fields above, or are key fields missing?
  □ Is there an address autocomplete / Google Maps integration?
  □ Does it calculate equity automatically? ($715,000 - $380,000 = $335,000)
  □ Does it calculate gross yield? ($550 × 52 / $715,000 = 4.0%)
  □ Does it calculate net yield after expenses?
  □ After saving, does the property appear on the portfolio with correct KPIs?

Grade: STEP_11_SCORE /10

─────────────────────────────────────────
STEP 12 — PROJECTIONS / FIRE TRACKER
─────────────────────────────────────────
Action: Navigate to Projections or the FIRE tracker page.

Check:
  □ Does the projection graph show Sarah's path to her $4M target by age 55?
  □ Are the projections populated with her real data (income, assets, properties)?
  □ Is there a clear indicator of whether she's on track or behind?
  □ Can she adjust assumptions (growth rate, savings rate) and see projections update?
  □ Is the chart readable and labelled clearly (X = years, Y = net worth in dollars)?

Grade: STEP_12_SCORE /10

---

FINAL REPORT FORMAT

After completing all 12 steps, write a test report in this format:

## PropEquityLab UX Test Report — Sarah Chen Persona

### Scorecard
| Step | Screen | Score | Key Finding |
|------|--------|-------|-------------|
| 1 | Sign Up | /10 | |
| 2 | Welcome | /10 | |
| 3 | About You | /10 | |
| 4 | Income | /10 | |
| 5 | Spending | /10 | |
| 6 | Assets | /10 | |
| 7 | Liabilities | /10 | |
| 8 | Goals / FIRE | /10 | |
| 9 | Summary | /10 | |
| 10 | Dashboard | /10 | |
| 11 | Add Property | /10 | |
| 12 | Projections | /10 | |
| **OVERALL** | | **/10** | |

### Top 3 Moments of Delight
(steps where the UX felt genuinely excellent — be specific)

### Top 3 Points of Friction
(steps where Sarah would have hesitated, been confused, or nearly abandoned)

### Critical Bugs Found
(anything broken — wrong calculations, missing validation, crashes, blank screens)

### One-Line Verdict
(Would Sarah recommend this to a friend? Why / why not?)

### Priority Fix List (ranked)
1.
2.
3.
4.
5.
```
