# Test Data Seed Plan - User Journey Simulation

> **Purpose**: Create realistic test data that simulates a complete user journey through PropEquityLab, demonstrating all platform features.

---

## 🎯 User Journey Overview

```
User: demo@propequitylab.com (Created: Jan 2024)
│
├── 📁 Portfolio: "Investment Properties"
│   │
│   ├── 🏠 Property 1: "123 Beach Road, Cronulla NSW 2230"
│   │   ├── Purchased: March 2020 @ $500,000
│   │   ├── Type: House | Purpose: Investment
│   │   ├── 📈 Valuations: $500k→$550k→$600k→$650k
│   │   ├── 💰 Loan: $400,000 @ 5.0% (30yr)
│   │   ├── 🏘️ Rental: $500→$550→$600/week
│   │   ├── 📊 Expenses: Rates, Insurance, Maintenance
│   │   └── 📉 Depreciation: Building + Fixtures
│   │
│   └── 🏠 Property 2: "45 City View, Parramatta NSW 2150"  
│       ├── Purchased: June 2023 @ $800,000
│       ├── Type: Unit | Purpose: Investment
│       ├── 📈 Valuations: $800k→$820k→$850k
│       ├── 💰 Loan: $640,000 @ 6.2% (30yr)
│       ├── 🏘️ Rental: $650/week
│       └── 📊 Expenses: Strata, Rates, Insurance
│
├── 💵 Income Sources
│   ├── Salary: $120,000/year (Primary)
│   ├── Rental Income: Property 1 + Property 2
│   └── Dividends: $2,400/year
│
├── 💳 Expenses
│   ├── Living: $3,500/month
│   ├── Property Expenses (linked to properties)
│   └── Investment Expenses: $50/month (subscriptions)
│
├── 🏦 Assets
│   ├── Cash/Savings: $45,000
│   ├── Shares: $85,000
│   ├── Superannuation: $180,000
│   └── Vehicle: $35,000
│
├── 📉 Liabilities
│   ├── Property Loans (linked to properties)
│   ├── Car Loan: $18,000 @ 7.5%
│   └── Credit Card: $2,500 @ 18%
│
└── 🎯 Plans & Goals
    ├── Retirement Plan: Age 55, $2M net worth
    ├── Property Goal: 5 properties by 2030
    └── Debt Payoff: Clear non-mortgage debt by 2026
```

---

## 📊 Detailed Seed Data

### 1. User Account

```json
{
  "email": "demo@propequitylab.com",
  "password": "DemoPass123!",
  "name": "Alex Thompson",
  "date_of_birth": "1985-06-15",
  "subscription_tier": "premium",
  "onboarding_completed": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Portfolio

```json
{
  "name": "Investment Properties",
  "type": "investment",
  "description": "Australian property investment portfolio",
  "is_active": true,
  "created_at": "2024-01-15T10:35:00Z"
}
```

---

### 3. Property 1: Cronulla Beach House

#### 3.1 Property Details
```json
{
  "address": {
    "street": "123 Beach Road",
    "suburb": "Cronulla",
    "state": "NSW",
    "postcode": "2230",
    "country": "Australia"
  },
  "property_type": "house",
  "purpose": "investment",
  "bedrooms": 3,
  "bathrooms": 2,
  "parking": 1,
  "land_size_sqm": 450,
  "building_size_sqm": 180,
  "year_built": 1995,
  "purchase_date": "2020-03-15",
  "purchase_price": 500000,
  "stamp_duty": 17990,
  "legal_fees": 2500,
  "other_purchase_costs": 1500
}
```

#### 3.2 Valuations (Historical)
```json
[
  { "date": "2020-03-15", "value": 500000, "source": "purchase" },
  { "date": "2021-03-15", "value": 525000, "source": "estimate" },
  { "date": "2022-03-15", "value": 550000, "source": "appraisal" },
  { "date": "2023-03-15", "value": 580000, "source": "estimate" },
  { "date": "2024-03-15", "value": 600000, "source": "appraisal" },
  { "date": "2025-01-15", "value": 620000, "source": "estimate" },
  { "date": "2026-01-11", "value": 650000, "source": "current" }
]
```

#### 3.3 Loan
```json
{
  "lender": "Commonwealth Bank",
  "loan_type": "investment",
  "principal_original": 400000,
  "principal_current": 365000,
  "interest_rate": 5.0,
  "rate_type": "variable",
  "loan_term_months": 360,
  "start_date": "2020-03-15",
  "repayment_type": "principal_and_interest",
  "repayment_frequency": "monthly",
  "offset_balance": 15000,
  "extra_repayments": [
    { "date": "2021-06-01", "amount": 5000 },
    { "date": "2022-12-15", "amount": 10000 },
    { "date": "2023-06-01", "amount": 5000 }
  ],
  "interest_rate_changes": [
    { "date": "2020-03-15", "rate": 4.5 },
    { "date": "2022-05-01", "rate": 4.85 },
    { "date": "2022-11-01", "rate": 5.35 },
    { "date": "2023-06-01", "rate": 5.75 },
    { "date": "2024-02-01", "rate": 5.5 },
    { "date": "2025-06-01", "rate": 5.0 }
  ]
}
```

#### 3.4 Rental Income (Historical)
```json
[
  {
    "start_date": "2020-04-01",
    "end_date": "2022-03-31",
    "weekly_rent": 500,
    "tenant_name": "John Smith",
    "lease_type": "fixed",
    "vacancy_weeks": 2
  },
  {
    "start_date": "2022-04-15",
    "end_date": "2024-04-14",
    "weekly_rent": 550,
    "tenant_name": "Sarah Johnson",
    "lease_type": "fixed",
    "vacancy_weeks": 2
  },
  {
    "start_date": "2024-05-01",
    "end_date": null,
    "weekly_rent": 600,
    "tenant_name": "Michael Chen",
    "lease_type": "periodic",
    "vacancy_weeks": 2
  }
]
```

#### 3.5 Property Expenses (Annual)
```json
[
  { "type": "council_rates", "amount": 2400, "frequency": "yearly" },
  { "type": "water_rates", "amount": 1100, "frequency": "yearly" },
  { "type": "insurance_building", "amount": 1800, "frequency": "yearly" },
  { "type": "insurance_landlord", "amount": 450, "frequency": "yearly" },
  { "type": "property_management", "amount_percent": 7.5, "of": "rent" },
  { "type": "maintenance", "amount": 2000, "frequency": "yearly" },
  { "type": "repairs", "amount": 500, "frequency": "yearly" }
]
```

#### 3.6 Depreciation Schedule
```json
{
  "building_cost": 250000,
  "building_rate": 2.5,
  "fixtures_cost": 45000,
  "fixtures_rate": 10,
  "start_date": "2020-03-15"
}
```

#### 3.7 Growth Rate Periods (Forecast)
```json
[
  { "start_year": 2020, "end_year": 2025, "annual_rate": 5.0 },
  { "start_year": 2026, "end_year": 2030, "annual_rate": 3.5 },
  { "start_year": 2031, "end_year": 2035, "annual_rate": 3.0 }
]
```

---

### 4. Property 2: Parramatta Unit

#### 4.1 Property Details
```json
{
  "address": {
    "street": "45/120 City View Boulevard",
    "suburb": "Parramatta",
    "state": "NSW",
    "postcode": "2150"
  },
  "property_type": "unit",
  "purpose": "investment",
  "bedrooms": 2,
  "bathrooms": 2,
  "parking": 1,
  "building_size_sqm": 85,
  "year_built": 2021,
  "purchase_date": "2023-06-20",
  "purchase_price": 800000,
  "stamp_duty": 31490,
  "legal_fees": 2800
}
```

#### 4.2 Valuations
```json
[
  { "date": "2023-06-20", "value": 800000, "source": "purchase" },
  { "date": "2024-06-20", "value": 820000, "source": "estimate" },
  { "date": "2025-06-20", "value": 840000, "source": "estimate" },
  { "date": "2026-01-11", "value": 850000, "source": "current" }
]
```

#### 4.3 Loan
```json
{
  "lender": "Westpac",
  "loan_type": "investment",
  "principal_original": 640000,
  "principal_current": 625000,
  "interest_rate": 6.2,
  "rate_type": "variable",
  "loan_term_months": 360,
  "start_date": "2023-06-20",
  "repayment_type": "interest_only",
  "io_period_months": 60,
  "offset_balance": 8000
}
```

#### 4.4 Rental Income
```json
[
  {
    "start_date": "2023-07-15",
    "end_date": null,
    "weekly_rent": 650,
    "tenant_name": "Emma Wilson",
    "lease_type": "fixed",
    "vacancy_weeks": 3
  }
]
```

#### 4.5 Property Expenses
```json
[
  { "type": "strata", "amount": 4800, "frequency": "yearly" },
  { "type": "council_rates", "amount": 1600, "frequency": "yearly" },
  { "type": "water_rates", "amount": 800, "frequency": "yearly" },
  { "type": "insurance_landlord", "amount": 380, "frequency": "yearly" },
  { "type": "property_management", "amount_percent": 7.5, "of": "rent" }
]
```

---

### 5. Personal Income

```json
[
  {
    "name": "Software Engineering Salary",
    "type": "salary",
    "amount": 120000,
    "frequency": "yearly",
    "employer": "TechCorp Australia",
    "start_date": "2022-03-01",
    "tax_withheld": true,
    "superannuation_rate": 11.5
  },
  {
    "name": "Dividend Income",
    "type": "dividend",
    "amount": 2400,
    "frequency": "yearly",
    "source": "Share Portfolio",
    "franking_percentage": 100
  }
]
```

---

### 6. Personal Expenses

```json
[
  { "name": "Living Expenses", "category": "living", "amount": 3500, "frequency": "monthly" },
  { "name": "Health Insurance", "category": "insurance", "amount": 180, "frequency": "monthly" },
  { "name": "Phone & Internet", "category": "utilities", "amount": 150, "frequency": "monthly" },
  { "name": "Gym Membership", "category": "health", "amount": 80, "frequency": "monthly" },
  { "name": "PropEquityLab Subscription", "category": "investment", "amount": 9.99, "frequency": "monthly" }
]
```

---

### 7. Assets (Non-Property)

```json
[
  {
    "name": "Emergency Savings",
    "type": "savings",
    "value": 45000,
    "institution": "ING",
    "interest_rate": 5.0,
    "as_of_date": "2026-01-11"
  },
  {
    "name": "Share Portfolio",
    "type": "shares",
    "value": 85000,
    "platform": "CommSec",
    "holdings": [
      { "ticker": "VAS", "units": 500, "avg_price": 90 },
      { "ticker": "VGS", "units": 300, "avg_price": 100 },
      { "ticker": "CBA", "units": 50, "avg_price": 120 }
    ],
    "as_of_date": "2026-01-11"
  },
  {
    "name": "Superannuation",
    "type": "superannuation",
    "value": 180000,
    "fund": "AustralianSuper",
    "investment_option": "Balanced",
    "as_of_date": "2026-01-11"
  },
  {
    "name": "Toyota RAV4",
    "type": "vehicle",
    "value": 35000,
    "purchase_date": "2022-08-15",
    "purchase_price": 48000,
    "depreciation_rate": 15
  }
]
```

---

### 8. Liabilities (Non-Property)

```json
[
  {
    "name": "Car Loan",
    "type": "car_loan",
    "balance": 18000,
    "original_amount": 35000,
    "interest_rate": 7.5,
    "lender": "NAB",
    "start_date": "2022-08-15",
    "term_months": 60,
    "minimum_payment": 700,
    "frequency": "monthly"
  },
  {
    "name": "Visa Credit Card",
    "type": "credit_card",
    "balance": 2500,
    "credit_limit": 15000,
    "interest_rate": 18.0,
    "lender": "Westpac",
    "minimum_payment": 100,
    "frequency": "monthly"
  }
]
```

---

### 9. Financial Plans

```json
[
  {
    "name": "Early Retirement Plan",
    "type": "retirement",
    "status": "active",
    "target_age": 55,
    "target_net_worth": 2000000,
    "target_passive_income": 80000,
    "current_age": 40,
    "assumptions": {
      "inflation_rate": 3.0,
      "investment_return": 7.0,
      "super_return": 6.5
    }
  },
  {
    "name": "5 Properties by 2030",
    "type": "property_acquisition",
    "status": "active",
    "target_count": 5,
    "current_count": 2,
    "target_date": "2030-12-31",
    "next_purchase_budget": 700000,
    "deposit_saved": 45000
  },
  {
    "name": "Debt Freedom 2026",
    "type": "debt_payoff",
    "status": "active",
    "target_date": "2026-12-31",
    "debts_included": ["Car Loan", "Visa Credit Card"],
    "total_to_clear": 20500,
    "monthly_extra_payment": 500
  }
]
```

---

### 10. Net Worth Snapshots (Historical)

```json
[
  { "date": "2024-01-15", "net_worth": 385000, "assets": 1210000, "liabilities": 825000 },
  { "date": "2024-04-15", "net_worth": 410000, "assets": 1245000, "liabilities": 835000 },
  { "date": "2024-07-15", "net_worth": 435000, "assets": 1280000, "liabilities": 845000 },
  { "date": "2024-10-15", "net_worth": 460000, "assets": 1310000, "liabilities": 850000 },
  { "date": "2025-01-15", "net_worth": 490000, "assets": 1350000, "liabilities": 860000 },
  { "date": "2025-04-15", "net_worth": 520000, "assets": 1390000, "liabilities": 870000 },
  { "date": "2025-07-15", "net_worth": 545000, "assets": 1420000, "liabilities": 875000 },
  { "date": "2025-10-15", "net_worth": 570000, "assets": 1450000, "liabilities": 880000 },
  { "date": "2026-01-11", "net_worth": 598500, "assets": 1490000, "liabilities": 891500 }
]
```

---

## 🔧 Implementation Plan

### Phase 1: Create Seed Script
Create `backend/scripts/seed_demo_data.py`:

```python
"""
Seed script for PropEquityLab demo data
Run with: python -m scripts.seed_demo_data
"""

async def seed_demo_user():
    """Create demo user with realistic property portfolio"""
    # Implementation here
    pass

async def seed_properties():
    """Add properties with historical data"""
    pass

async def seed_financial_data():
    """Add income, expenses, assets, liabilities"""
    pass

async def main():
    await seed_demo_user()
    await seed_properties()
    await seed_financial_data()
    print("✅ Demo data seeded successfully!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Phase 2: Database Migrations
Ensure all required tables exist for:
- Historical valuations
- Rental income periods
- Interest rate changes
- Growth rate periods
- Depreciation schedules

### Phase 3: API Endpoint Testing
Test each data type can be:
1. Created via API
2. Retrieved with history
3. Updated correctly
4. Deleted (cascade rules)

### Phase 4: Frontend Verification
1. Login as demo user
2. View dashboard with calculated metrics
3. Navigate to each section
4. Verify projections calculate correctly

---

## 📈 Expected Projection Output

With this seed data, the projection engine should calculate:

| Year | Property 1 Value | Property 2 Value | Total Equity | Annual Cashflow |
|------|------------------|------------------|--------------|-----------------|
| 2024 | $600,000 | $820,000 | $415,000 | $18,500 |
| 2025 | $630,000 | $850,000 | $465,000 | $19,200 |
| 2026 | $661,500 | $880,000 | $518,500 | $19,900 |
| 2027 | $695,000 | $912,000 | $575,000 | $20,800 |
| 2028 | $730,000 | $945,000 | $638,000 | $21,700 |
| 2029 | $767,000 | $979,000 | $705,000 | $22,800 |
| 2030 | $806,000 | $1,014,000 | $778,000 | $24,000 |

---

## ✅ Acceptance Criteria

1. Demo user can login and see complete dashboard
2. Net worth history chart shows 9 data points
3. Both properties display with correct current values
4. Loan details show repayment progress
5. Rental income shows current tenant info
6. 10-year projection generates without errors
7. All plans show progress toward goals
8. Export to CSV includes all historical data

---

*Plan created: 2026-01-11*
*Ready for implementation*
