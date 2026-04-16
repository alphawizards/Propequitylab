# Code Quality Review — 2026-04-16

Scope: `backend/models/`, `backend/routes/`, `backend/utils/calculations.py`, `backend/utils/auth.py`, `backend/utils/clerk_auth.py`, `backend/utils/database_sql.py`, `backend/server.py`

---

## Critical Issues

### 1. Double query in `_verify_loan_access` wastes a DB round-trip
**File:** `backend/routes/loans.py`, lines 50–63

```python
def _verify_loan_access(loan_id: int, user_id: str, session: Session) -> Loan:
    loan = session.exec(select(Loan).where(Loan.id == loan_id)).first()
    ...
    _verify_property_access(loan.property_id, user_id, session)
```

`_verify_property_access` runs a second `SELECT properties` query. Nothing stops a caller from also calling `_verify_property_access` directly. The two-step lookup is correct but the code at line 182–183 in the same file also double-fetches `ExtraRepayment` in `delete_loan`:

```python
# Line 182: fetches and discards the result entirely — dead query
session.exec(select(ExtraRepayment).where(ExtraRepayment.loan_id == loan_id)).all()
# Line 183: fetches again and iterates — this is the real work
for item in session.exec(select(ExtraRepayment).where(ExtraRepayment.loan_id == loan_id)).all():
    session.delete(item)
```

The first call at line 182 executes a SQL query and throws the result away. Fix: delete line 182.

---

### 2. GDPR export references non-existent field names — will 500 in production
**File:** `backend/routes/gdpr.py`, lines 128–170

The export handler builds dicts by accessing field names that do not exist on the current models:

| Code access | Actual model field |
|---|---|
| `a.asset_type` | `Asset.type` |
| `a.value` | `Asset.current_value` |
| `l.liability_type` | `Liability.type` |
| `l.amount` | `Liability.current_balance` |
| `i.source_name` | `IncomeSource.name` |
| `i.income_type` | `IncomeSource.type` |
| `e.description` | `Expense` has no `description` field (field is `name`) |
| `prop.land_value` | `Property` has no `land_value` field |

Every `export_user_data` call will raise `AttributeError` and hit the bare `except Exception` handler, returning a 500. The `data-summary` endpoint is fine. This is effectively a broken GDPR compliance endpoint.

---

### 3. `compare_scenario` fetches source portfolio without ownership check
**File:** `backend/routes/scenarios.py`, lines 537–545

```python
source = session.exec(
    select(Portfolio).where(Portfolio.id == scenario.source_portfolio_id)
).first()
```

There is no `Portfolio.user_id == current_user.id` filter on this query. While a user can only reach their own scenarios (checked above), the source portfolio fetch is unguarded. If `source_portfolio_id` were ever tampered with or pointed cross-user (e.g., by a scenario created through a DB bug), the endpoint would return another user's portfolio metrics. Add the ownership filter:

```python
select(Portfolio).where(
    Portfolio.id == scenario.source_portfolio_id,
    Portfolio.user_id == current_user.id,
)
```

---

### 4. `generate_id()` in scenarios produces 8-char truncated UUIDs — collision risk
**File:** `backend/routes/scenarios.py`, lines 37–39

```python
def generate_id() -> str:
    return str(uuid.uuid4())[:8]
```

This is used as the primary key for copied Portfolios, Assets, Liabilities, and IncomeSource/Expense records. An 8-hex-char UUID space is ~4 billion values, but the birthday paradox gives a 50% collision probability after ~65,000 rows per table. The rest of the codebase uses full UUIDs (`str(uuid.uuid4())`). Replace with a full UUID. The only reason this exists is to make IDs shorter, which is not a valid tradeoff for a primary key.

---

### 5. `add_extra_repayment` and `add_lump_sum_payment` accept `float` for money
**File:** `backend/routes/loans.py`, lines 207–208 and 241

```python
async def add_extra_repayment(
    loan_id: int,
    amount: float,   # <-- violates the DECIMAL-only rule
    ...
```

The conversion `Decimal(str(amount))` on line 223 mitigates the storage issue, but the FastAPI query parameter is typed `float`, meaning floating-point rounding already occurs before the route body runs. Both endpoints should use `Decimal` as the query parameter type, or accept a Pydantic body model. This is also inconsistent with every other financial endpoint in the codebase that uses `Decimal` throughout.

---

## High Issues

### 6. `DashboardSummary` model uses `float` for all financial fields
**File:** `backend/routes/dashboard.py`, lines 30–39

```python
class DashboardSummary(BaseModel):
    net_worth: float = 0
    total_assets: float = 0
    ...
```

All seven monetary fields are `float`. The route then does `float(sum(...))` on `Decimal` values. For a platform where the project rules say "never float for money", this entire response model is non-compliant. Since this is a read-only summary it will not corrupt stored data, but values can be silently wrong after float operations. Change all fields to `Decimal`.

The `to_monthly` helper inside `get_dashboard_summary` (lines 156–167) also uses Python `float` multipliers (`52 / 12`, `26 / 12`) which compounds the precision loss.

---

### 7. Portfolio `summary` route performs N+1 queries — will degrade with scale
**File:** `backend/routes/portfolios.py`, lines 256–315

Six separate `SELECT` statements are issued (properties, assets, liabilities, income, expenses) with no pagination. For a portfolio with many records this runs all data into memory then sums in Python. The `get_dashboard_summary` route in `dashboard.py` (lines 76–114) does the same for the same data set. These two endpoints compute largely the same information through separate DB fetches. Immediate impact is low at current scale; but both should be refactored to aggregate in SQL or, at minimum, to share a single helper.

---

### 8. `onboarding.py` uses `hasattr` guards on known model fields
**File:** `backend/routes/onboarding.py`, lines 57, 97–116, 151–154, 185–188, 219–222

```python
if hasattr(user, 'onboarding_completed'):
    user.onboarding_completed = True
```

`User.onboarding_completed`, `User.onboarding_step`, `User.date_of_birth`, etc. are all defined on the `User` SQLModel (confirmed in `models/user.py`). The `hasattr` calls were defensive guards written when the model was uncertain but are now dead conditionals that hide real AttributeErrors. Remove all `hasattr` guards and set fields directly.

---

### 9. `_provision_user` commits three times — non-atomic user creation
**File:** `backend/utils/clerk_auth.py`, lines 154–180

```python
session.add(user); session.commit(); session.refresh(user)   # commit 1
session.add(account); session.commit(); session.refresh(account)  # commit 2
session.add(membership); session.add(subscription); session.commit()  # commit 3
```

If commit 2 or 3 fails, a `User` row exists without an `Account` or `Subscription`. The user will then be in a broken state on next sign-in (Case 1 lookup finds them, returns them without account). All four `session.add` calls should be batched into a single `session.commit()`. Use `session.flush()` after the user add to get the generated ID for the account FK.

---

### 10. Webhook handler calls `request.json()` after `request.body()` — may fail
**File:** `backend/routes/clerk_webhooks.py`, lines 76 and 89

```python
body = await request.body()   # line 76 — consumes the stream
...
payload = await request.json()  # line 89 — re-reads the same stream
```

Starlette's `Request.body()` caches the body, so `request.json()` after `request.body()` works in practice. However, it's fragile and undocumented behaviour. Parse the JSON from the already-fetched `body` bytes directly:

```python
import json
payload = json.loads(body)
```

---

### 11. `calculate_remaining_balance` shadows the module-level `monthly_rate` function
**File:** `backend/utils/calculations.py`, line 262

```python
# Inside calculate_remaining_balance:
monthly_rate = rate / Decimal("100") / Decimal("12")
```

The function `monthly_rate` is defined at module scope (line 69). This local variable silently shadows it within the function. The shadowing is harmless here (the local variable is used correctly) but it will cause a `TypeError` if a future developer adds a call to the module-level `monthly_rate()` inside `calculate_remaining_balance`. Rename the local variable to `monthly_rate_decimal` or `periodic_rate`.

---

### 12. `scenarios.py` `deep_copy_portfolio` issues a `session.flush()` per loan — O(N) flushes
**File:** `backend/routes/scenarios.py`, lines 158–176

```python
for old_loan in old_loans:
    new_loan = Loan(...)
    session.add(new_loan)
    session.flush()          # one DB round-trip per loan
    loan_id_map[old_loan.id] = new_loan.id
```

The flush inside the loop exists only to get the auto-generated `new_loan.id`. Since `loan_id_map` is never actually used downstream (GrowthRatePeriod, RentalIncome, and other copies use `property_id_map` not `loan_id_map`), this entire pattern is wasted work. The `loan_id_map` variable is built but never read. Remove the per-loan flush and the `loan_id_map` entirely.

---

## Medium Issues

### 13. Duplicate `_verify_property_access` helper defined in two route files
**File:** `backend/routes/loans.py` lines 32–46 and `backend/routes/valuations.py` lines 29–43

Identical function, identical logic. Should live in a shared `utils/` helper or in a base module imported by both routes.

---

### 14. Frequency multiplier duplication between `calculations.py` and `dashboard.py`
**File:** `backend/utils/calculations.py` lines 22–38 (`FREQUENCY_MULTIPLIERS`) and `backend/routes/dashboard.py` lines 157–167 (`to_monthly` inner function)

`dashboard.py` defines its own inline dict of frequency-to-multiplier mappings instead of importing `FREQUENCY_MULTIPLIERS` and `annualize_amount` from `calculations.py`. The same pattern recurs in `expenses.py` lines 100–107 (`to_monthly` inner function). Three separate implementations of the same conversion logic, with slightly different key sets.

---

### 15. `expenses.py` `to_monthly` uses wrong multiplier for `"fortnightly"`
**File:** `backend/routes/expenses.py`, line 103

```python
"fortnightly": Decimal("2.1667"),
```

Fortnightly = 26 payments/year. Monthly equivalent = 26/12 = **2.1667**. This is actually correct numerically but is expressed as a magic constant. The `dashboard.py` version uses `26 / 12` (a float division). Neither imports from `calculations.py`. Unifying removes the risk of future divergence.

---

### 16. `annualize_amount` silently defaults unknown frequencies to monthly
**File:** `backend/utils/calculations.py`, line 65

```python
def annualize_amount(amount: Decimal, frequency: str) -> Decimal:
    multiplier = FREQUENCY_MULTIPLIERS.get(frequency, Decimal("12"))
```

An unknown frequency string (e.g., a typo in stored data) silently returns the monthly multiplier. No warning is logged. This can produce wrong financial figures without any error signal. At minimum, log a warning when the fallback is used.

---

### 17. `create_valuation` reads `latest` before the new valuation is flushed
**File:** `backend/routes/valuations.py`, lines 70–78

```python
session.add(valuation)

latest_stmt = select(PropertyValuation).where(...).order_by(...desc())
latest = session.exec(latest_stmt).first()

if not latest or data.valuation_date >= latest.valuation_date:
    property_obj.current_value = data.value
```

The new `valuation` is added to the session but not yet flushed. The query for `latest` hits the DB before the new row is visible, so `latest` is always the previous newest valuation, not the one just added. The `if not latest` branch will trigger correctly for the very first valuation, but for subsequent valuations the comparison is between the incoming date and the old latest — which is the correct logic. However, if two valuations are submitted with dates out of order, `latest` could point to the wrong row. A `session.flush()` before the query, or simply using the incoming `data.valuation_date` directly (since we already have it), would make this unambiguous.

---

### 18. `update_scenario` name mutation is fragile string split
**File:** `backend/routes/scenarios.py`, lines 440–441

```python
if scenario_name:
    scenario.scenario_name = scenario_name
    scenario.name = f"{scenario.name.split(' - ')[0]} - {scenario_name}"
```

If the original portfolio name contains ` - ` (a hyphen with spaces), `split(' - ')[0]` truncates it. Example: "My Portfolio - Phase 1" becomes "My Portfolio" after the first rename. The base name should be stored separately or the full name should be reconstructed from `source_portfolio.name` fetched from the DB.

---

### 19. `scenarios.py` `check_scenario_limit` checks `user.subscription_tier` as a string attribute but `User` model stores it as `str` (not enum)
**File:** `backend/routes/scenarios.py`, line 47 and `backend/models/user.py`, line 61

```python
# scenarios.py
if user.subscription_tier == "free":

# user.py — field is plain str, not SubscriptionTier enum
subscription_tier: str = Field(default="free", max_length=50)
```

`SubscriptionTier` enum is defined in `user.py` (line 22–25) but never used as the field's type. If `subscription_tier` were accidentally stored as `"Free"` or `"FREE"`, the gate passes and free users get Pro features. Either use `SubscriptionTier` as the field type, or normalise to lowercase on write.

---

### 20. Route files import directly from `utils.clerk_auth` instead of `utils.auth`
**Files:** All route files — `portfolios.py:25`, `properties.py:18`, `loans.py:26`, `dashboard.py:24`, `projections.py:30`, `valuations.py:22`, `scenarios.py:29`, `income.py:19`, `expenses.py:19`, `assets.py:18`, `liabilities.py:18`, `onboarding.py:22`, `gdpr.py:25`

Every route imports `get_current_user` from `utils.clerk_auth` directly. The entire purpose of `utils/auth.py`'s conditional override at lines 369–371 is so routes import from `utils.auth` and get Clerk automatically when `CLERK_ISSUER` is set. By bypassing that, the local-JWT fallback path is permanently broken — rolling back to JWT auth (unsetting `CLERK_ISSUER`) would leave all routes still calling the Clerk version. All routes should import from `utils.auth`, not `utils.clerk_auth`.

---

### 21. `database_sql.py` `get_session` closes session in `finally` after context manager already handles it
**File:** `backend/utils/database_sql.py`, lines 102–106

```python
with Session(engine) as session:
    try:
        yield session
    finally:
        session.close()
```

`Session(engine)` used as a context manager calls `session.close()` on `__exit__`. The explicit `session.close()` in `finally` calls it a second time. SQLAlchemy `Session.close()` is idempotent so this is harmless but it's misleading. Remove the `try/finally` block.

---

### 22. `load_demo_data` and `seed_sample_data` are two overlapping endpoints with near-identical logic
**File:** `backend/routes/onboarding.py`, lines 233 and 526

Both endpoints create a portfolio, properties, assets, liabilities, income, and expenses. `load_demo_data` wipes existing data first; `seed_sample_data` refuses to run if a portfolio exists. They produce almost identical datasets (same Sydney address, same loan structure). The 600 lines of near-duplicate seeding code doubles maintenance burden. One endpoint with a `force: bool = False` parameter would cover both use cases.

---

## Low / Informational

### 23. `utils/auth.py` imports `os` twice
**File:** `backend/utils/auth.py`, lines 1 and 369

```python
import os          # line 1
...
import os as _os   # line 369 — used only for the Clerk conditional
```

The second import is unnecessary; `os.getenv("CLERK_ISSUER")` at line 370 would work identically using the already-imported `os`.

---

### 24. `portfolio.py` `description` field referenced in GDPR export but not defined in model
**File:** `backend/routes/gdpr.py`, line 104 and `backend/models/portfolio.py`

```python
"description": p.description,
```

`Portfolio` has no `description` field. This will raise `AttributeError` at runtime (same root cause as issue 2). The `portfolio.description` access is an additional stale field reference in the GDPR export.

---

### 25. `calculations.py` docstring says "Translated from TypeScript" with reference to a deleted file
**File:** `backend/utils/calculations.py`, line 6

```
Reference: AI_AGENT_IMPLEMENTATION_PROMPT.md Phase 2
```

That file does not exist in the repo. Dead reference in docstring.

---

### 26. `gdpr.py` export filename still uses old brand name "zapiio"
**File:** `backend/routes/gdpr.py`, line 188

```python
"Content-Disposition": f'attachment; filename="zapiio-data-export-...'
```

The product is PropEquityLab. This leaks a previous brand name in every data export.

---

### 27. `scenarios.py` `deep_copy_portfolio` does not copy `DepreciationSchedule`
**File:** `backend/routes/scenarios.py` — no `DepreciationSchedule` copy loop

`delete_scenario` (line 478) does not delete `DepreciationSchedule` rows for copied properties either, but since they were never copied, this is consistent (if silently incomplete). Projections fall back gracefully when depreciation is zero. Worth noting for when depreciation data becomes user-populated.

---

### 28. `plans.py` route is registered in `server.py` but not reviewed — plans model has no `user_id` check noted in other route patterns
**File:** `backend/routes/plans.py` (not fully read)

Flag for a separate check. The `Plan` model in `models/plan.py` should be verified to include `user_id` and all route handlers should filter by it.

---

### 29. No input validation on `years` upper bound at the query-parameter level
**File:** `backend/routes/projections.py`, lines 247–250

The validation `if years < 1 or years > 50` is done inside the handler body. FastAPI supports `Query(ge=1, le=50)` as a parameter annotation which rejects invalid values before the handler runs and produces a proper 422 response with field-level detail, rather than a 400 with a custom message. Minor, but more idiomatic.

---

### 30. `server.py` security middleware adds `X-XSS-Protection: 1; mode=block`
**File:** `backend/server.py`, line 165

`X-XSS-Protection` is deprecated and removed from all modern browsers. Its presence is harmless but signals stale security guidance. It can be removed.

---

## Patterns to Standardize

**A. Auth import path:** All route files must import `get_current_user` from `utils.auth`, never from `utils.clerk_auth` directly. This is already documented intent in `utils/auth.py` lines 363–371 but is not being followed.

**B. Frequency conversion:** Define one canonical helper in `utils/calculations.py` (extend `annualize_amount` to also return a monthly figure) and import it everywhere. Remove the inline `to_monthly` functions in `dashboard.py` and `expenses.py`.

**C. Property access verification helper:** Extract `_verify_property_access` into `utils/route_helpers.py` (or similar) so it is shared between `loans.py` and `valuations.py` without duplication.

**D. Onboarding field writes:** Remove all `hasattr` guards on `User` model fields. Write fields directly. If a field genuinely might not exist in some schema version, that is a migration problem, not a runtime guard problem.

**E. Financial response models:** All Pydantic/SQLModel response schemas that include monetary values (`DashboardSummary`, any inline `dict` responses in `projections.py`) must use `Decimal`, not `float`.

**F. Bare `except Exception` in route handlers:** `onboarding.py` and `gdpr.py` catch all exceptions and return 500. This hides bugs during development. Log the full traceback (already done), but consider letting unexpected exceptions propagate to Sentry via the SDK rather than swallowing them in a generic handler.

**G. Seeding endpoints:** Consider gating `load-demo-data` and `seed-sample-data` behind an `ENABLE_SEED_ENDPOINTS=true` env flag so they cannot be called in production.
