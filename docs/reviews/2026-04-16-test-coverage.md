# Test Coverage Review — 2026-04-16

## Executive Summary

The project has a solid unit test foundation for the financial calculation engine and good IDOR
coverage for portfolios and properties. However, the bulk of route files (10 of 16) have zero
pytest-runnable integration tests, the legacy test files are disabled by naming convention, the
financial projection and scenario routes are entirely untested, and there is no frontend test
coverage whatsoever.

---

## Test File Inventory

| File | Type | Runnable by pytest | Notes |
|------|------|--------------------|-------|
| `backend/tests/test_calculations.py` | Unit | Yes | Primary calculation coverage |
| `backend/tests/test_portfolio_summary.py` | Unit (handler direct-call) | Yes | Portfolio summary handler |
| `backend/tests/test_email_async.py` | Unit | Yes | Email utility |
| `tests/integration/test_health.py` | Integration | Yes | 1 test only |
| `tests/integration/test_auth_isolation.py` | Integration | Yes | IDOR checks, portfolios + properties + assets + income + expenses |
| `tests/integration/legacy_test_*.py` (8 files) | Integration | **No** | Prefixed `legacy_` — not discovered by pytest without explicit path |
| `tests/backend_test.py` | Manual script | **No** | Uses `requests` against live URL, not a pytest suite |
| `tests/full_simulation.py` | Manual script | **No** | Not a pytest module |
| `tests/quick_crud.py` | Manual script | **No** | Not a pytest module |
| `tests/playwright_test.py` | E2E | **No** | Playwright, no setup/fixtures wired |

Effectively runnable pytest files: **4** (test_calculations, test_portfolio_summary, test_email_async, test_health, test_auth_isolation — call it 5 counting auth_isolation).

---

## Critical Gaps (no tests at all)

These route files have zero runnable pytest coverage. Every endpoint in them is untested.

### `backend/routes/projections.py`
- `GET /projections/{property_id}` — single property multi-year projection
- `GET /projections/portfolio/{portfolio_id}` — portfolio projection
- `GET /projections/property/{property_id}/summary` — property financial summary
- `years` parameter validation (must be 1–50): the 400 guard is present but never tested
- Override parameters: `expense_growth_override`, `interest_rate_offset`, `asset_growth_override` — zero coverage

### `backend/routes/scenarios.py`
- `POST /scenarios/create/{portfolio_id}` — deep-copy portfolio as scenario
- `GET /scenarios/portfolio/{portfolio_id}` — list scenarios
- `GET /scenarios/{scenario_id}` — get scenario
- `PUT /scenarios/{scenario_id}` — update scenario metadata
- `DELETE /scenarios/{scenario_id}` — cascading delete
- `GET /scenarios/{scenario_id}/compare` — comparison against source portfolio
- Subscription gate: free users blocked with 403 — never tested
- Scenario limit (max 3 per pro user) — never tested
- Deep-copy fidelity (loans, rental income, expense logs, growth rates all copied) — never tested

### `backend/routes/dashboard.py`
- `GET /dashboard/summary` — the primary UI data endpoint, zero integration tests
- `GET /dashboard/net-worth-history` — net worth history
- `POST /dashboard/snapshot` — snapshot creation and persistence
- `savings_rate` division-by-zero when `monthly_income == 0` — code returns 0 but untested
- Empty portfolio path (returns default zeros) — untested

### `backend/routes/loans.py`
- `POST /loans` — create loan
- `GET /loans/property/{property_id}` — list loans for property
- `GET /loans/{loan_id}` — get loan
- `PUT /loans/{loan_id}` — update loan
- `DELETE /loans/{loan_id}` — cascading delete (ExtraRepayment, LumpSumPayment, InterestRateForecast)
- `POST /loans/{loan_id}/extra-repayments` — extra repayment schedule
- `POST /loans/{loan_id}/lump-sum` — lump sum payment
- Note: `_verify_loan_access` uses integer `loan_id` — IDOR path through property ownership never exercised

### `backend/routes/valuations.py`
- `POST /valuations` — create valuation (also updates `property.current_value`)
- `GET /valuations/property/{property_id}` — list valuations
- `GET /valuations/{valuation_id}` — get valuation
- `DELETE /valuations/{valuation_id}` — delete valuation
- `GET /valuations/property/{property_id}/latest` — latest valuation with fallback
- Critical side-effect: creating a valuation updates `property.current_value` if it is the newest — completely untested

### `backend/routes/plans.py`
- All FIRE projection calculation endpoints — entirely untested
- FIRE number computation, success probability, accumulation vs retirement phases

### `backend/routes/gdpr.py`
- `GET /gdpr/export-data` — full user data export
- Account deletion endpoint — destructive, never tested for correctness or safety

### `backend/routes/onboarding.py`
- `GET /onboarding/status` — only covered by auth_isolation (returns user id), no data assertions
- Step save logic (8-step flow) — untested

---

## High Priority Missing Tests

These areas are partially covered but have dangerous gaps.

### Portfolio CRUD — legacy tests disabled
`legacy_test_portfolios.py` has `test_create_portfolio`, `test_get_portfolios`, `test_get_portfolio_detail` but is never run. The `legacy_` prefix disables discovery. These need to be renamed or their content merged into a new file.

Untested portfolio operations:
- `PUT /portfolios/{portfolio_id}` — update, including `goal_settings` JSON merge
- `DELETE /portfolios/{portfolio_id}` — cascade delete (properties, income, expenses, assets, liabilities, plans) — the cascade logic is substantial and completely untested

### Property CRUD — legacy tests disabled
`legacy_test_properties.py` has only `test_create_property`. Untested:
- `GET /properties/{property_id}` — 404 on missing, 404 on other user's property
- `PUT /properties/{property_id}` — partial update via `exclude_unset`
- `DELETE /properties/{property_id}`
- `GET /properties/portfolio/{portfolio_id}` — portfolio access check before returning properties

### Income / Expenses / Assets / Liabilities CRUD
`legacy_test_income.py`, `legacy_test_expenses.py`, `legacy_test_assets.py`, `legacy_test_liabilities.py` are all disabled. All CRUD for these resources is untested at the HTTP layer. `test_auth_isolation.py` verifies the list endpoints return empty for other users but never creates, reads, updates, or deletes records via the API.

Missing for each (income, expenses, assets, liabilities):
- `POST` — create with valid payload, 201 response, DB record matches
- `GET /{id}` — happy path and 404
- `PUT /{id}` — partial update
- `DELETE /{id}` — delete and verify gone

### Dashboard — zero tests
`GET /dashboard/summary` is the most-used frontend endpoint and has no tests. Missing:
- Happy path with full portfolio data
- Empty portfolio (should return zeroed summary, not 500)
- `portfolio_id` query param vs auto-select first portfolio
- Frequency conversion accuracy: weekly/fortnightly/monthly income mixing
- IDOR: other user's `portfolio_id` returns zeroed summary (partially covered in auth_isolation but assertions are shallow)

---

## Medium Priority Missing Tests

### Financial Calculation Edge Cases

`test_calculations.py` is good but missing:

| Missing Case | Risk |
|---|---|
| `calculate_loan_repayment` dispatcher — which `loan_structure` value triggers IO vs PI path | Could silently use wrong formula |
| Negative equity (loan > property value) | LVR > 100%, equity is negative — UI could display incorrectly |
| `calculate_remaining_balance` with `years_elapsed > total_term_years` | Off-by-one on fully paid loans |
| `generate_portfolio_projections` with empty properties list | No properties — currently throws if called with empty list |
| `calculate_portfolio_summary` with multiple properties | Only single-property case tested |
| Decimal precision across a 30-year projection (hundreds of multiplications) | Accumulated rounding error |
| `annualize_amount` with unknown frequency string | Falls back to `Decimal("12")` — silent wrong result |
| `get_growth_rate_for_year` with year before any period start | Returns default but no test confirms it |
| Interest rate = 0 for interest-only loan | Avoids divide-by-zero but untested |

### Expense Category Summary Endpoint
`GET /expenses/portfolio/{portfolio_id}/summary` — computes percentage breakdown using in-file `to_monthly` helper. This helper uses a hardcoded `0.0833` for annual frequency (approximation, not exact). The rounding error accumulates with many categories. No tests exist for this endpoint at all.

### Valuation Side-Effect
`POST /valuations` updates `property.current_value` when the new valuation is the most recent. Tests needed:
- Older valuation does not overwrite `current_value`
- Newer valuation does overwrite `current_value`
- First valuation on a property always updates `current_value`

### Projections — Years Boundary
- `years=0` and `years=51` should both return 400 — `years=0` actually fails the `< 1` check but `years=50` is at boundary and returns 51 data points (inclusive) — this may be unintentional
- Portfolio projection with empty property list returns 404 — reasonable, but no test confirms the error message
- Portfolio projection with one IO loan + growth — verify debt stays flat while value grows (regression-level test)

### Scenarios — Subscription Gate
`check_scenario_limit` raises 403 for `user.subscription_tier == "free"`. There is no test verifying:
- Free users are blocked with 403
- Pro users with < 3 scenarios can create
- Pro users with exactly 3 scenarios are blocked with 400
- `deep_copy_portfolio` correctly copies all child entity types (loans, rental income, etc.)

---

## Test Quality Issues

### 1. `backend_test.py` is not a pytest suite — it is a manual script
It uses `requests` against a hardcoded preview URL (`8ed6ce0a...preview.emergentagent.com`). It cannot run in CI or locally without a live server. It should be replaced with proper pytest tests using the existing `client` fixture, or deleted. Currently it gives a false impression of coverage.

### 2. All legacy integration tests are silently skipped
Eight files prefixed `legacy_test_` are never discovered by pytest. They contain real test logic for portfolios, properties, income, expenses, assets, liabilities, plans, and dashboard. The `legacy_` prefix was presumably added to stop them from running (possibly due to fixture incompatibility), but the result is that no one knows they are broken. They need to be triaged: fix and rename, or delete.

### 3. `test_portfolio_summary.py` calls the handler directly, bypassing FastAPI
This avoids testing HTTP serialization, status codes, and route registration. The handler tests are valuable for business logic but must be supplemented with HTTP-level tests (via `client` fixture) to confirm the route is wired correctly and response JSON matches `PortfolioSummary` schema.

### 4. Assertions in legacy files check status code only — no field validation
`legacy_test_properties.py` calls `POST /api/properties` and asserts `status_code == 201` and one field. It does not verify: `user_id` is set from auth (not from payload), `purchase_date` is parsed correctly, `current_value` defaults to `purchase_price` when omitted, or that `loan_details`/`rental_details` round-trip correctly through JSON columns.

### 5. `test_auth_isolation.py` uses 403 as the unauthenticated assertion
This is correct for Clerk (`get_current_user` raises 403 when no token), but it is only documented in a comment. If auth middleware ever changes to return 401, all three unauthenticated tests silently pass the wrong assertion. The comment should become a `pytest.mark` or the expected code should be extracted to a constant.

### 6. No assertions on `Decimal` type in HTTP response tests
The legacy files compare values like `data["current_balance"] == 27000` against JSON numbers (which are floats). Financial fields serialized via FastAPI may arrive as floats or strings depending on the Pydantic model configuration. No test verifies that monetary fields are serialized as strings (to preserve precision) or that the JSON response can be round-tripped into `Decimal` without loss.

### 7. `cleanup_after_test` fixture calls `session.rollback()` but autouse scope is function
`session_fixture` yields from a `with Session(engine) as session` block. The rollback in `cleanup_after_test` does not isolate tests from each other because `session.commit()` has already been called inside test bodies. Tests that commit data can affect subsequent tests that share the same engine. The engine is re-created per test via `engine_fixture` (function scope), so this is currently safe — but the relationship is fragile and not documented.

---

## Integration vs Unit Test Balance

| Layer | Count | Runnable |
|---|---|---|
| Pure unit (calculations) | ~45 tests | Yes |
| Handler unit (portfolio summary) | ~15 tests | Yes |
| HTTP integration (auth_isolation) | ~12 tests | Yes |
| HTTP integration (health) | 1 test | Yes |
| HTTP integration (legacy, disabled) | ~80 tests | No |
| E2E (Playwright) | Unknown | No |
| Frontend (Jest) | 0 | N/A |

The balance is inverted from what it should be. Unit tests at the calculation level are strong. HTTP integration tests are almost entirely absent for routes that drive actual user value (projections, scenarios, dashboard, loans, valuations). The legacy tests suggest there was once broader HTTP coverage, but it was abandoned rather than maintained.

---

## Frontend Test Coverage

There are zero frontend test files (`*.test.jsx`, `*.spec.jsx`, `*.test.js`) anywhere under `frontend/src/`. No Jest configuration for component tests exists beyond the default CRACO setup. This means:

- All 21 page components are untested
- Context providers (Auth, User, Portfolio, Theme) have no tests
- `api.js` (the centralized Axios client with token refresh) has no tests
- Financial display formatting (currency, percentage, chart data shaping) has no tests
- The onboarding flow (8 steps) has no tests

This is a significant gap for a financial application where display errors can mislead users about their financial position.

---

## Recommendations

### Immediate (before next release)

1. **Rename or delete the 8 `legacy_test_` files.** Either fix their imports and rename them to `test_*.py`, or delete them. They create false confidence. Priority: `legacy_test_portfolios.py`, `legacy_test_properties.py`, `legacy_test_dashboard.py`.

2. **Add HTTP-level tests for `GET /dashboard/summary`.** This is the landing page of the app. At minimum: empty portfolio returns zeros, portfolio with data returns correct figures, other user's portfolio_id leaks nothing.

3. **Add projection boundary tests.** `years=0` (400), `years=51` (400), `years=50` (returns 51 rows), empty portfolio (404 with message). These validate a guard clause that currently has no coverage.

4. **Add valuation side-effect tests.** The mutation of `property.current_value` on valuation create is a business-critical behaviour with zero test coverage.

### High Priority

5. **Add scenario subscription gate tests** — free user gets 403, pro user at limit gets 400. These enforce billing correctness.

6. **Add loan CRUD integration tests** — create, list, update, delete, including the cascading delete of `ExtraRepayment`/`LumpSumPayment`.

7. **Add at least one frontend component test** for the dashboard summary display — verify that `Decimal`-valued monetary fields are rendered correctly and that zero-state (no portfolio) does not throw a render error.

8. **Delete `backend_test.py`** or move it to `scripts/`. It is not part of the test suite and pollutes the test inventory.

### Medium Priority

9. **Add `calculate_loan_repayment` dispatcher tests** — confirm the right formula is selected for `InterestOnly` vs `PrincipalAndInterest` vs `InterestOnlyThenPI` loan structures.

10. **Add negative equity test** to `test_calculations.py` — `property_value < total_debt` should produce a negative equity value and an LVR above 100.

11. **Add multi-property portfolio projection test** — two properties with different growth rates summed correctly at the portfolio level.

12. **Add `annualize_amount` unknown frequency test** — confirm the silent fallback to `12` is intentional and documented.

---

## Files Relevant to This Review

- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\tests\test_calculations.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\tests\test_portfolio_summary.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\tests\conftest.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\tests\integration\test_auth_isolation.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\tests\integration\test_health.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\tests\backend_test.py` (not a pytest suite)
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\projections.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\scenarios.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\dashboard.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\loans.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\valuations.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\plans.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\routes\gdpr.py`
- `C:\Users\ckr_4\01 Web Projects\Propequitylab\backend\utils\calculations.py`
