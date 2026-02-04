# PropEquityLab Backend Setup & Testing Prompt

Use this prompt with Claude to execute the backend setup and testing tasks.

---

## 🚀 PROMPT FOR CLAUDE

```
You are my senior full-stack developer. I need you to help me with PropEquityLab, a property investment portfolio platform.

## Context
- Project: PropEquityLab (React frontend + FastAPI backend)
- Location: c:\Users\ckr_4\01 Projects\Propequitylab\Propequitylab
- Backend: FastAPI with SQLModel + PostgreSQL
- Setup Guide: docs/PHASE_0_SETUP_GUIDE.md

## Tasks to Complete

### Task 1: Start Backend Server
1. Navigate to the backend directory
2. Install dependencies from requirements.txt
3. Start the uvicorn server on port 8000
4. Verify the /api/health endpoint returns status: healthy

### Task 2: Create Test Users
Create 3 test users to verify the user creation flow works:

| User | Email | Password | Role |
|------|-------|----------|------|
| Free User | free@test.propequitylab.com | TestPass123! | Free tier |
| Premium User | premium@test.propequitylab.com | TestPass123! | Premium tier |
| Pro User | pro@test.propequitylab.com | TestPass123! | Pro tier |

Use the POST /api/auth/register endpoint to create each user.

### Task 3: Add Sample Data
For each test user, add sample data to demonstrate the platform:

**Free User Sample Data:**
- 1 Portfolio: "My First Portfolio"
- 1 Property: 123 Test St, Sydney NSW 2000 ($750,000)
- 1 Income: Salary $85,000/year
- 2 Expenses: Rent $2,000/month, Utilities $200/month

**Premium User Sample Data:**
- 2 Portfolios: "Personal" and "Investment"
- 3 Properties across portfolios
- Multiple income sources
- Assets: Shares $50,000, Super $120,000
- Liabilities: Car loan $15,000

**Pro User Sample Data:**
- 3 Portfolios: "Personal", "Investment", "SMSF"
- 5+ Properties with loans attached
- Complete financial picture with projections
- Multiple plans and goals set

### Task 4: Verify Phase 5 Implementation
Check if Phase 5 (whatever that covers) is implemented in the codebase:
1. Search for Phase 5 references in docs/
2. Check if related endpoints exist
3. Test the endpoints if they exist
4. Report what's implemented vs missing

### Task 5: Create Subscription Tiers
Implement a 3-tier subscription system:

**Tier 1: Free**
- Max 1 portfolio
- Max 3 properties
- 1-year projections only
- CSV export only
- Community support

**Tier 2: Premium ($9.99/month)**
- Max 5 portfolios
- Max 15 properties
- 10-year projections
- CSV + PDF export
- Email support

**Tier 3: Pro ($29.99/month)**
- Unlimited portfolios
- Unlimited properties
- 30-year projections
- CSV + PDF + API export
- Priority support
- White-label reports

Implementation requirements:
1. Add subscription_tier field to User model (enum: free, premium, pro)
2. Add subscription_expires_at field for paid tiers
3. Create middleware to check tier permissions
4. Add tier limits to relevant endpoints
5. Create /api/subscription endpoints for tier management

## Deliverables
1. Running backend server with passing health check
2. 3 test users created and verified
3. Sample data populated for each user
4. Phase 5 status report
5. Subscription tier implementation with:
   - Updated User model
   - Tier permission checks
   - API endpoints for subscription management

## How to Proceed
Start with Task 1 (starting the server), then work through each task sequentially. Report any errors encountered and how you resolved them.
```

---

## 📋 Quick Copy Version

```
Help me with PropEquityLab (c:\Users\ckr_4\01 Projects\Propequitylab\Propequitylab):

1. START BACKEND: cd backend, pip install -r requirements.txt, uvicorn server:app --reload --port 8000

2. CREATE TEST USERS via POST /api/auth/register:
   - free@test.propequitylab.com (Free tier)
   - premium@test.propequitylab.com (Premium tier)  
   - pro@test.propequitylab.com (Pro tier)

3. ADD SAMPLE DATA for each user (portfolios, properties, income, expenses, assets, liabilities)

4. CHECK PHASE 5 STATUS - what's implemented vs missing?

5. CREATE SUBSCRIPTION TIERS:
   - Free: 1 portfolio, 3 properties, 1yr projections
   - Premium: 5 portfolios, 15 properties, 10yr projections
   - Pro: Unlimited everything, 30yr projections

Add subscription_tier and subscription_expires_at to User model, create tier permission middleware.
```

---

*Generated: 2026-01-11*
