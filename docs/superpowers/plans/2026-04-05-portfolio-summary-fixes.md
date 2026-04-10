# Portfolio Summary Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four correctness bugs in `GET /portfolios/{id}/summary` so that `annual_income`, `annual_expenses`, `annual_cashflow`, `total_value`, `total_equity`, and `goal_year` are semantically accurate.

**Architecture:** All changes are backend-only. The route handler `get_portfolio_summary` in `backend/routes/portfolios.py` is the single fix target. A shared utility (`annualize_amount`) needs a case-sensitivity fix first. Existing regression tests in `test_portfolio_summary.py` are updated to reflect the correct expected values.

**Tech Stack:** Python 3.11, FastAPI, SQLModel, pytest, `backend/utils/calculations.py::annualize_amount`

---

## Background: What Is Wrong and Why

### Bug 1 (HIGH): Income and expenses not annualised
`get_portfolio_summary` sums `income.amount` and `expense.amount` raw. These records store a `frequency` field ("monthly", "weekly", etc.). A salary of $5,000/month is reported as $5,000/year instead of $60,000/year.

### Bug 2 (HIGH): Rental income not annualised
`property.rental_details["income"]` is a raw dollar amount with no frequency conversion. It is summed directly into `annual_income`. It should be treated as monthly rent (× 12), matching the convention used elsewhere in the codebase.

### Bug 3 (MEDIUM): `total_value` = property value only
`total_value` is assigned `total_property_value`. Non-property assets are tracked separately in `total_assets` but excluded from `total_value`, making the field misleading. Correct behaviour: `total_value = total_property_value + total_assets`. `total_equity = total_value - total_debt` follows, and `net_worth` remains unchanged.

### Bug 4 (MEDIUM): `goal_year` key does not match stored data
`portfolio.goal_settings.get("target_year")` is always `None` because the onboarding route stores the key as `"target_retirement_age"` (e.g. `{"target_retirement_age": 55, "fire_target": 2000000, "withdrawal_rate": 4.0}`). Fix: read `"target_retirement_age"` and compute the calendar year using the user's `date_of_birth`.

### Root cause: `annualize_amount` is case-sensitive
`FREQUENCY_MULTIPLIERS` uses Title Case ("Monthly", "Annually"). `IncomeSource.frequency` and `Expense.frequency` store lowercase ("monthly", "annual"). `annualize_amount` silently falls back to ×12 (monthly default) for all unrecognised strings — meaning weekly and annual entries are always wrong. This must be fixed before Bug 1 can be fixed.

---

## File Map

| File | Change |
|---|---|
| `backend/utils/calculations.py` | Add lowercase keys to `FREQUENCY_MULTIPLIERS`; handle "annual" → ×1 |
| `backend/routes/portfolios.py` | Apply `annualize_amount` to income/expenses; treat rental income as monthly; fix `total_value`; fix `goal_year` |
| `backend/tests/test_calculations.py` | Add tests for lowercase frequency strings |
| `backend/tests/test_portfolio_summary.py` | Update expected values for annual figures; update `total_value`, `total_equity`; add `goal_year` test |

---

## Task 1: Fix `annualize_amount` to accept lowercase frequency strings

**Why first:** Bugs 1 and 2 depend on this. Without it, passing "monthly" to `annualize_amount` hits the default (×12) accidentally, and "weekly" returns ×12 instead of ×52.

**Files:**
- Modify: `backend/utils/calculations.py:22-29`
- Modify: `backend/tests/test_calculations.py` (add test class)

- [ ] **Step 1: Write the failing tests**

Add this class at the end of `backend/tests/test_calculations.py`:

```python
class TestAnnualizeAmountLowercaseFrequency:
    """annualize_amount must accept the lowercase frequency strings stored in the DB."""

    def test_monthly_lowercase(self):
        result = annualize_amount(Decimal("1000"), "monthly")
        assert result == Decimal("12000")

    def test_weekly_lowercase(self):
        result = annualize_amount(Decimal("1000"), "weekly")
        assert result == Decimal("52000")

    def test_fortnightly_lowercase(self):
        result = annualize_amount(Decimal("1000"), "fortnightly")
        assert result == Decimal("26000")

    def test_annual_lowercase(self):
        # DB stores "annual" not "annually"
        result = annualize_amount(Decimal("1000"), "annual")
        assert result == Decimal("1000")

    def test_annually_titlecase_still_works(self):
        result = annualize_amount(Decimal("1000"), "Annually")
        assert result == Decimal("1000")

    def test_quarterly_lowercase(self):
        result = annualize_amount(Decimal("1000"), "quarterly")
        assert result == Decimal("4000")
```

- [ ] **Step 2: Run to confirm RED**

```bash
cd backend
py -m pytest tests/test_calculations.py::TestAnnualizeAmountLowercaseFrequency -v
```
Expected: 6 failures (currently "monthly" returns 12000 accidentally via default, "weekly" returns 12000 instead of 52000, "annual" returns 12000 instead of 1000).

- [ ] **Step 3: Fix `FREQUENCY_MULTIPLIERS` in `backend/utils/calculations.py`**

Replace lines 22–29:

```python
FREQUENCY_MULTIPLIERS = {
    # Title case (original, kept for backwards compat)
    "Weekly": Decimal("52"),
    "Fortnightly": Decimal("26"),
    "Monthly": Decimal("12"),
    "Quarterly": Decimal("4"),
    "Annually": Decimal("1"),
    "OneTime": Decimal("1"),
    # Lowercase (stored in DB by IncomeSource and Expense models)
    "weekly": Decimal("52"),
    "fortnightly": Decimal("26"),
    "monthly": Decimal("12"),
    "quarterly": Decimal("4"),
    "annually": Decimal("1"),
    "annual": Decimal("1"),   # IncomeSource default is "annual" not "annually"
    "one_time": Decimal("1"),
}
```

- [ ] **Step 4: Run tests to confirm GREEN**

```bash
py -m pytest tests/test_calculations.py -v
```
Expected: all pass (including new class).

- [ ] **Step 5: Commit**

```bash
git add backend/utils/calculations.py backend/tests/test_calculations.py
git commit -m "fix(calculations): add lowercase frequency support to annualize_amount"
```

---

## Task 2: Annualise income and expenses in `get_portfolio_summary`

**Files:**
- Modify: `backend/routes/portfolios.py:264-290`
- Modify: `backend/tests/test_portfolio_summary.py` (update expected values)

The seed data in `test_portfolio_summary.py` uses:
- `IncomeSource`: amount=5,000, frequency="monthly" → annual = **60,000**
- `Expense`: amount=1,000, frequency="monthly" → annual = **12,000**
- `rental_details["income"]` = 2,000 (treated as monthly) → annual = **24,000**
- Expected `annual_income` = 60,000 + 24,000 = **84,000**
- Expected `annual_expenses` = **12,000**
- Expected `annual_cashflow` = 84,000 − 12,000 = **72,000**

- [ ] **Step 1: Update failing tests with correct expected values**

In `backend/tests/test_portfolio_summary.py`, update these test methods in `TestPortfolioSummaryValues`:

```python
def test_annual_income_combines_rental_and_other(self, engine, user_a):
    pid = _full_portfolio(engine, user_a)
    r = _call_summary(engine, user_a, pid)
    # IncomeSource: 5000/month × 12 = 60,000; rental: 2000/month × 12 = 24,000
    assert r.annual_income == Decimal("84000")

def test_annual_expenses(self, engine, user_a):
    pid = _full_portfolio(engine, user_a)
    r = _call_summary(engine, user_a, pid)
    # Expense: 1000/month × 12 = 12,000
    assert r.annual_expenses == Decimal("12000")

def test_annual_cashflow_equals_income_minus_expenses(self, engine, user_a):
    pid = _full_portfolio(engine, user_a)
    r = _call_summary(engine, user_a, pid)
    # 84,000 - 12,000 = 72,000
    assert r.annual_cashflow == Decimal("72000")
```

- [ ] **Step 2: Run to confirm RED**

```bash
py -m pytest tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_annual_income_combines_rental_and_other tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_annual_expenses tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_annual_cashflow_equals_income_minus_expenses -v
```
Expected: 3 failures — current code returns 7,000 / 1,000 / 6,000.

- [ ] **Step 3: Fix the route handler**

In `backend/routes/portfolios.py`, add the import at the top of the file (after existing imports):

```python
from utils.calculations import annualize_amount
```

Then replace lines 264–284 (the income/expense/rental totalling block):

```python
    # Annualise income sources
    income_stmt = select(IncomeSource).where(
        IncomeSource.portfolio_id == portfolio_id,
        IncomeSource.user_id == current_user.id
    )
    incomes = session.exec(income_stmt).all()
    total_income = sum(
        annualize_amount(income.amount or Decimal(0), income.frequency or "monthly")
        for income in incomes
    )

    # Annualise expenses
    expense_stmt = select(Expense).where(
        Expense.portfolio_id == portfolio_id,
        Expense.user_id == current_user.id
    )
    expenses = session.exec(expense_stmt).all()
    total_expenses = sum(
        annualize_amount(expense.amount or Decimal(0), expense.frequency or "monthly")
        for expense in expenses
    )

    # Annualise rental income (treat rental_details["income"] as monthly)
    total_rental_income = sum(
        annualize_amount(
            Decimal(str(prop.rental_details.get("income", 0))) if prop.rental_details else Decimal(0),
            prop.rental_details.get("frequency", "monthly") if prop.rental_details else "monthly"
        )
        for prop in properties
    )
```

- [ ] **Step 4: Run tests to confirm GREEN**

```bash
py -m pytest tests/test_portfolio_summary.py -v
```
Expected: all 17 pass.

- [ ] **Step 5: Run full test suite**

```bash
py -m pytest tests/ -q
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add backend/routes/portfolios.py backend/tests/test_portfolio_summary.py
git commit -m "fix(portfolio-summary): annualise income, expenses, and rental income"
```

---

## Task 3: Fix `total_value` to include non-property assets

**Context:** `total_value` currently equals `total_property_value` only. The field should represent total portfolio value = properties + assets. `total_equity` is updated to follow: `total_value - total_debt`. `net_worth` formula stays the same numerical result.

**Updated test expected values:**
- `total_value`: 500,000 + 10,000 = **510,000**
- `total_equity`: 510,000 − 400,000 = **110,000** (was 100,000)
- `net_worth`: 510,000 − 400,000 − 3,000 = **107,000** (unchanged — same formula, different decomposition)

**Files:**
- Modify: `backend/routes/portfolios.py:286-305`
- Modify: `backend/tests/test_portfolio_summary.py`

- [ ] **Step 1: Update failing tests**

In `backend/tests/test_portfolio_summary.py`, update:

```python
def test_total_value(self, engine, user_a):
    pid = _full_portfolio(engine, user_a)
    r = _call_summary(engine, user_a, pid)
    # property (500k) + asset (10k) = total portfolio value
    assert r.total_value == Decimal("510000")

def test_total_equity(self, engine, user_a):
    pid = _full_portfolio(engine, user_a)
    r = _call_summary(engine, user_a, pid)
    # total_value (510k) - total_debt (400k)
    assert r.total_equity == Decimal("110000")
```

- [ ] **Step 2: Run to confirm RED**

```bash
py -m pytest tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_total_value tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_total_equity -v
```
Expected: 2 failures.

- [ ] **Step 3: Fix the route handler**

In `backend/routes/portfolios.py`, replace the net_worth/summary construction block (lines ~286-305):

```python
    # Total portfolio value = properties + other assets
    total_value = total_property_value + total_assets

    # Total equity = total portfolio value minus property debt
    total_equity = total_value - total_property_debt

    # Net worth = total equity minus non-property liabilities
    net_worth = total_equity - total_liabilities

    # Annual cashflow
    annual_cashflow = total_rental_income + total_income - total_expenses

    summary = PortfolioSummary(
        portfolio_id=portfolio_id,
        properties_count=len(properties),
        total_value=total_value,
        total_debt=total_property_debt,
        total_equity=total_equity,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
        annual_income=total_rental_income + total_income,
        annual_expenses=total_expenses,
        annual_cashflow=annual_cashflow,
        goal_year=None,   # updated in Task 4
    )
```

- [ ] **Step 4: Run tests to confirm GREEN**

```bash
py -m pytest tests/test_portfolio_summary.py -v
```
Expected: all 17 pass.

- [ ] **Step 5: Commit**

```bash
git add backend/routes/portfolios.py backend/tests/test_portfolio_summary.py
git commit -m "fix(portfolio-summary): total_value includes assets; total_equity = total_value - debt"
```

---

## Task 4: Fix `goal_year` using correct key and user DOB

**Context:** `portfolio.goal_settings` stores `{"target_retirement_age": 55, ...}`, not `"target_year"`. The `User` model has `date_of_birth: Optional[str]`. We compute `goal_year` as:

```
current_year + (target_retirement_age - current_age)
```

If `date_of_birth` is missing or unparseable, `goal_year` returns `None` gracefully.

**Files:**
- Modify: `backend/routes/portfolios.py` (goal_year computation at end of function)
- Modify: `backend/tests/test_portfolio_summary.py` (add goal_year test)

- [ ] **Step 1: Write the failing test**

Add to `TestPortfolioSummaryValues` in `backend/tests/test_portfolio_summary.py`:

```python
def test_goal_year_computed_from_retirement_age_and_dob(self, engine):
    """goal_year should reflect target_retirement_age + user DOB."""
    from datetime import date as dt
    user = make_user("goal")
    user.date_of_birth = "1990-01-01"    # age = current_year - 1990
    with Session(engine) as s:
        pid = str(uuid.uuid4())
        s.add(Portfolio(
            id=pid,
            user_id=user.id,
            name="Goal Portfolio",
            type="actual",
            goal_settings={"target_retirement_age": 55, "fire_target": 2000000},
        ))
        s.commit()
    r = _call_summary(engine, user, pid)
    current_year = dt.today().year
    current_age = current_year - 1990
    expected_year = str(current_year + (55 - current_age))
    assert r.goal_year == expected_year

def test_goal_year_none_when_no_goal_settings(self, engine, user_a):
    """goal_year is None when portfolio has no goal_settings."""
    pid = _empty_portfolio(engine, user_a)
    r = _call_summary(engine, user_a, pid)
    assert r.goal_year is None

def test_goal_year_none_when_no_dob(self, engine):
    """goal_year is None when user has no date_of_birth."""
    user = make_user("nodob")
    user.date_of_birth = None
    with Session(engine) as s:
        pid = str(uuid.uuid4())
        s.add(Portfolio(
            id=pid,
            user_id=user.id,
            name="No DOB Portfolio",
            type="actual",
            goal_settings={"target_retirement_age": 65},
        ))
        s.commit()
    r = _call_summary(engine, user, pid)
    assert r.goal_year is None
```

- [ ] **Step 2: Run to confirm RED**

```bash
py -m pytest tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_goal_year_computed_from_retirement_age_and_dob tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_goal_year_none_when_no_goal_settings tests/test_portfolio_summary.py::TestPortfolioSummaryValues::test_goal_year_none_when_no_dob -v
```
Expected: failures — current code uses wrong key and always returns None.

- [ ] **Step 3: Add the helper and fix `goal_year` computation**

Add this helper function to `backend/routes/portfolios.py` just before the route decorator (above the `@router.get("/{portfolio_id}/summary"...)` line):

```python
def _compute_goal_year(goal_settings: Optional[dict], date_of_birth: Optional[str]) -> Optional[str]:
    """Compute the target retirement calendar year from goal_settings and user DOB.

    Returns None if either target_retirement_age or date_of_birth is missing/invalid.
    """
    if not goal_settings or not date_of_birth:
        return None
    target_age = goal_settings.get("target_retirement_age")
    if target_age is None:
        return None
    try:
        from datetime import date
        birth_year = int(date_of_birth[:4])
        current_year = date.today().year
        current_age = current_year - birth_year
        return str(current_year + (int(target_age) - current_age))
    except (ValueError, TypeError):
        return None
```

Then update the `summary` constructor in `get_portfolio_summary` (the `goal_year=` line):

```python
        goal_year=_compute_goal_year(portfolio.goal_settings, current_user.date_of_birth),
```

- [ ] **Step 4: Run tests to confirm GREEN**

```bash
py -m pytest tests/test_portfolio_summary.py -v
```
Expected: all 20 pass.

- [ ] **Step 5: Run full suite**

```bash
py -m pytest tests/ -q
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add backend/routes/portfolios.py backend/tests/test_portfolio_summary.py
git commit -m "fix(portfolio-summary): compute goal_year from target_retirement_age and user DOB"
```

---

## Final Verification

- [ ] Run the full test suite one last time:
  ```bash
  py -m pytest tests/ -v
  ```
  Expected: 62+ tests passing, 0 failures.

- [ ] Confirm the four fixed behaviours end-to-end:
  1. `annual_income` for a user with $5k/month salary + $2k/month rental = $84,000
  2. `annual_expenses` for $1k/month expense = $12,000
  3. `total_value` includes both property value and other assets
  4. `goal_year` returns a calendar year string when DOB and retirement age are known

---

## Self-Review Checklist

- [x] All four high/medium severity bugs addressed
- [x] Task 1 (frequency fix) must complete before Task 2 (annualisation)
- [x] No placeholder steps — all code is shown inline
- [x] Test expected values updated to match correct annualised figures: 84k/12k/72k
- [x] `net_worth` formula unchanged numerically despite `total_value` and `total_equity` changes
- [x] `goal_year` tests cover: happy path, no goal_settings, no DOB
- [x] `_compute_goal_year` helper handles ValueError/TypeError from bad DOB strings
- [x] All tasks have commit steps
