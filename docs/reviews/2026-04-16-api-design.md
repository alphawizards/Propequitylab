# API & Interface Design Review — 2026-04-16

Scope: all files in `backend/routes/` and `backend/server.py`.
Reviewed endpoints: ~65 across 16 route files.

---

## Critical Issues

### 1. Query parameters used for mutation inputs on several endpoints

**Files:** `backend/routes/scenarios.py`, `backend/routes/loans.py`, `backend/routes/onboarding.py`

`POST /api/scenarios/create/{portfolio_id}` accepts `scenario_name` and `scenario_description` as query parameters, not a request body. Same pattern for `PUT /api/scenarios/{scenario_id}` (name, description as query params) and `POST /api/loans/{loan_id}/extra-repayments` (amount, frequency, start_date, end_date as query params), and `POST /api/loans/{loan_id}/lump-sum` (amount, payment_date, description as query params).

Query parameters are logged by proxies, appear in browser history, and are not suited for financial data. All mutation endpoints must accept a Pydantic request body. The `POST /api/plans/project` endpoint correctly uses a body; these must match.

Fix: introduce `ExtraRepaymentCreate`, `LumpSumCreate`, `ScenarioCreate`, `ScenarioUpdate` Pydantic schemas and bind them as body parameters.

### 2. `POST /api/scenarios/create/{portfolio_id}` violates REST verb semantics

The action verb "create" is embedded in the URL. REST encodes the action in the HTTP method. The correct form is `POST /api/scenarios` (or `POST /api/portfolios/{portfolio_id}/scenarios`). The current URL is doubly wrong because it also puts the action in the path segment.

### 3. `DELETE /api/gdpr/delete-account` uses wrong HTTP method for a resource

Deleting an account is a destructive, irreversible operation. Using `DELETE /api/gdpr/delete-account` embeds a verb in the URL. The resource is the account itself: `DELETE /api/users/me` is the conventional form. The `/gdpr/` prefix is an implementation detail that should not be in the URL. The export and summary endpoints similarly belong under `/api/users/me/data-export` and `/api/users/me/data-summary`.

### 4. `POST /api/onboarding/load-demo-data` and `POST /api/onboarding/seed-sample-data` are duplicates with diverging behavior

Both endpoints exist, accept the same auth, and seed demo portfolios. `load-demo-data` wipes existing data silently; `seed-sample-data` refuses if data exists and raises 400. This is contradictory behavior under two nearly identical names. One must be deleted. The survivor should be named `POST /api/onboarding/demo` and document its idempotency contract explicitly.

### 5. `GET /api/projections/{property_id}` and `GET /api/projections/portfolio/{portfolio_id}` — route ordering conflict

FastAPI evaluates path routes in registration order. The static segment `portfolio` in `/projections/portfolio/{portfolio_id}` will be shadowed by the wildcard `{property_id}` in `/projections/{property_id}` if it is registered first. In the file, `/{property_id}` appears at line 223 and `/portfolio/{portfolio_id}` at line 290 — so the portfolio route is registered second and will never be reached for a `portfolio_id` that could be confused with a property ID (both are UUID strings). This is a latent routing bug. Same pattern exists in `GET /api/loans/property/{property_id}` vs `GET /api/loans/{loan_id}` and `GET /api/valuations/property/{property_id}/latest` vs `GET /api/valuations/{valuation_id}`.

Fix: place all static-segment routes (`/property/{id}`, `/portfolio/{id}`) before wildcard routes (`/{id}`) in the file, or restructure URLs to avoid ambiguity.

---

## High Issues

### 6. DELETE responses return 200 with a body instead of 204 No Content

**Files:** all routes — `portfolios.py`, `properties.py`, `income.py`, `expenses.py`, `assets.py`, `liabilities.py`, `loans.py`, `plans.py`, `valuations.py`, `scenarios.py`

Every delete handler returns `{"message": "X deleted successfully"}` with an implicit 200 status. The HTTP standard for a successful deletion that leaves no content is 204 No Content with an empty body. Returning a body with 200 is not wrong but is inconsistent with standard REST and inconsistent with the fact that `POST` handlers correctly return 201.

Fix: add `status_code=status.HTTP_204_NO_CONTENT` and `response_class=Response` to all delete decorators, then return `None`.

### 7. No `response_model` on the majority of DELETE, snapshot, compare, and summary endpoints

**Files:** `portfolios.py` (delete), `loans.py` (delete, extra-repayment, lump-sum), `dashboard.py` (snapshot), `scenarios.py` (delete, compare), `valuations.py` (delete, latest), `onboarding.py` (all POST endpoints), `gdpr.py` (all three endpoints), `plans.py` (projections, project)

Without `response_model`, FastAPI omits these from the OpenAPI schema, cannot validate output, and cannot filter unexpected fields. Every endpoint must declare a `response_model`, even if it is a simple `MessageResponse` Pydantic model.

### 8. `float` used throughout `dashboard.py` response model and financial calculations

`DashboardSummary` (line 30-39, `dashboard.py`) declares all monetary fields as `float`. The project rule is `Decimal` for all financial values. This means net worth, assets, liabilities, income, and cashflow all lose precision in the dashboard response. The `to_monthly()` helper inside the same file also performs arithmetic in `float`. The `plans.py` `ProjectionResult` and `ProjectionYear` schemas similarly use `float` for all monetary fields.

### 9. `GET /api/plans/{plan_id}/projections` requires `portfolio_id` as a query parameter

`GET /api/plans/{plan_id}/projections?portfolio_id=xxx` forces the caller to know both the plan ID and the portfolio ID. A plan already has a `portfolio_id` FK on the model — the handler could read it directly from the plan record. This leaks the relational schema into the URL contract. The `portfolio_id` query parameter should be dropped; the handler resolves it from `plan.portfolio_id`.

### 10. `POST /api/plans/project` has no authentication

`plans.py` line 265: `async def calculate_projection(data: ProjectionInput)` — the function signature has no `current_user` or `session` dependency. This endpoint is completely unauthenticated and publicly callable. While it is a pure calculation with no DB access, it still consumes server CPU and should be rate-limited at minimum, and ideally require auth for consistency.

### 11. `GET /api/expenses/categories`, `GET /api/assets/types`, `GET /api/liabilities/types`, `GET /api/plans/types` are unauthenticated but undocumented as such

These four endpoints intentionally skip auth. None of them document this in the OpenAPI docstring. None set `include_in_schema=False` or equivalent. A security auditor has no way to distinguish intentionally public endpoints from accidentally unauthenticated ones. Each should have an explicit docstring note ("public endpoint — no auth required") and ideally a tag or `dependencies` annotation to make the intent machine-readable.

### 12. `get_latest_valuation` route registered after `get_property_valuations` — static vs wildcard collision

`GET /api/valuations/property/{property_id}/latest` is defined at line 166 in `valuations.py`, after `GET /api/valuations/{valuation_id}` at line 111. The segment `property` in the later route is a static literal, but FastAPI has already committed to treating the first path segment after `/valuations/` as `{valuation_id}`. The `/latest` sub-path on the property route is safe from this particular collision, but the `property` segment will be captured by `{valuation_id}` as the string `"property"`, causing a type coercion failure (valuation_id is `int`). In practice FastAPI will raise a 422, making the `/latest` endpoint unreachable via normal routing if the wildcard fires first.

---

## Medium Issues

### 13. No pagination on any list endpoint

Every `GET` that returns `List[Model]` returns the full unbounded result set:
- `GET /api/portfolios`
- `GET /api/properties/portfolio/{portfolio_id}`
- `GET /api/income/portfolio/{portfolio_id}`
- `GET /api/expenses/portfolio/{portfolio_id}`
- `GET /api/assets/portfolio/{portfolio_id}`
- `GET /api/liabilities/portfolio/{portfolio_id}`
- `GET /api/plans/portfolio/{portfolio_id}`
- `GET /api/loans/property/{property_id}`
- `GET /api/valuations/property/{property_id}`
- `GET /api/scenarios/portfolio/{portfolio_id}`

`GET /api/dashboard/net-worth-history` has a `limit` parameter but no `offset` or cursor. As portfolios grow, unbounded list queries will degrade response times and memory usage.

Standard fix: add `skip: int = 0, limit: int = Query(default=50, le=200)` to all list endpoints and apply `.offset(skip).limit(limit)` in the query. Wrap responses in a `{"items": [...], "total": N, "skip": N, "limit": N}` envelope.

### 14. No API versioning

The API mounts all routes under `/api` with no version prefix. `server.py` declares `version="2.0.0"` in the FastAPI constructor but this is only reflected in the OpenAPI metadata, not in the URL. There is no `/api/v1/` or `/api/v2/` prefix. Breaking changes to any endpoint have no migration path. The recommended fix is to introduce an `APIRouter(prefix="/api/v1")` wrapper and document the versioning strategy. Alternatively, explicit versioning via an `Accept` header is acceptable but harder to implement in this stack.

### 15. Inconsistent URL structure for sub-resources across routers

The API uses two conflicting conventions for listing child resources:

Pattern A (used by properties, income, expenses, assets, liabilities, plans, loans, valuations):
`GET /api/{resource}/portfolio/{portfolio_id}` or `GET /api/{resource}/property/{property_id}`

Pattern B (used by scenarios):
`GET /api/scenarios/portfolio/{portfolio_id}`

Pattern C (would be the RESTful standard):
`GET /api/portfolios/{portfolio_id}/properties`
`GET /api/portfolios/{portfolio_id}/income`
`GET /api/properties/{property_id}/loans`
`GET /api/properties/{property_id}/valuations`

Pattern A/B makes child resources addressable at a top-level path, which is acceptable but means the URL gives no hierarchical context. Pattern C is standard REST. The API mixes all three. This should be resolved to one convention.

### 16. `loan_id` and `valuation_id` are integers; all other IDs are UUID strings

`Loan.id` and `PropertyValuation.id` are auto-increment integers (route params typed as `int`). Every other model uses UUID strings. This inconsistency leaks the ORM implementation detail into the API contract (integers are enumerable/guessable, UUIDs are not). The loan and valuation models should use UUID primary keys to match the rest of the API.

### 17. `scenarios.py::generate_id()` generates 8-character truncated UUIDs

```python
def generate_id() -> str:
    return str(uuid.uuid4())[:8]
```

This is used for portfolio, asset, liability, income, and expense IDs in the scenario deep-copy. An 8-character hex substring has only 4 billion possible values vs 3.4×10^38 for a full UUID. With the Clerk user base growing, this raises collision risk. All other routes use `str(uuid.uuid4())` (full 36-char). This function should be removed and replaced with the standard pattern.

### 18. `DELETE /api/portfolios/{portfolio_id}` performs manual cascade deletion in Python

`portfolios.py` lines 168–206 manually queries and deletes properties, income, expenses, assets, liabilities, and plans in a loop with individual `session.delete()` calls. This is a multi-round-trip N+1 pattern that will become slow as portfolios grow. It also silently misses `Loan`, `PropertyValuation`, `GrowthRatePeriod`, `RentalIncome`, `ExpenseLog`, and `DepreciationSchedule` records attached to properties. The correct fix is to define `CASCADE` delete constraints in the SQLModel relationships or use a single `DELETE FROM ... WHERE portfolio_id = ?` statement.

### 19. `dashboard.py::DashboardSummary` is defined inline in the route file, not in `models/`

Pydantic response schemas that are part of the API contract should live in `models/` so they are discoverable by OpenAPI tooling and importable by tests. `DashboardSummary`, `SnapshotRequest` (dashboard.py), `ProjectionInput`, `ProjectionYear`, `ProjectionResult` (plans.py), and `OnboardingStatus`, `OnboardingStepData` (onboarding.py) are all defined inline in route files. Move them to `models/dashboard.py`, `models/plan.py`, and `models/onboarding.py` respectively.

### 20. `GET /api/dashboard/summary` silently returns empty data when user has no portfolio

`dashboard.py` line 68-72: if no portfolio is found, returns a zero-filled `DashboardSummary` rather than a 404 or a specific status that tells the client why data is empty. The client cannot distinguish "portfolio not found" from "portfolio found but is empty." A distinct `has_portfolio: bool` field in the response, or a 404 with a clear `code` field, would allow the frontend to route the user to onboarding.

---

## Low / Informational

### 21. `gdpr.py` references stale field names that do not match the current Asset/Liability/IncomeSource models

In `gdpr.py` lines 129-174, the export serializer references `a.asset_type`, `a.value`, `l.liability_type`, `l.amount`, `l.current_amount`, `i.source_name`, `i.income_type` — field names that do not exist on the current SQLModel definitions (the actual fields are `type`, `current_value`, `current_balance`, `name`, `type` respectively). This will raise `AttributeError` at runtime for any user who triggers data export. This is a functional bug introduced by model renaming without updating the GDPR route.

### 22. No `X-Request-ID` or correlation header propagated to responses

With Sentry integrated, requests that error will produce a Sentry event ID. The API does not surface this ID in a response header. Adding `X-Request-ID` (generated per request) and `X-Sentry-Event-ID` (on error responses) would allow frontend error UIs to display a reference ID for support.

### 23. `health_check` returns 200 even when database is disconnected

`server.py` line 97-103: when `db_healthy` is `False`, the response body says `"status": "degraded"` but the HTTP status code is still 200. Load balancers and uptime monitors check the HTTP status code, not the body. A degraded state should return 503 so downstream health checkers can act on it.

Fix:
```python
from fastapi import Response
return Response(
    status_code=503 if not db_healthy else 200,
    content=json.dumps({...}),
    media_type="application/json"
)
```

### 24. `onboarding.py::save_onboarding_step` only handles step 1

`PUT /api/onboarding/step/{step}` accepts a `step` integer path parameter implying steps 1–8, but only the `step == 1` branch contains any field-mapping logic (lines 93–111). Steps 2–8 silently advance `onboarding_step` without persisting any of the data sent in `data.data`. Either the remaining steps need handlers, or the endpoint contract should be documented to clarify that step 1 is the only server-persisted step.

### 25. `plans.py::get_plan_projections` hard-codes `current_age=35`

Line 430: `current_age=35`. This ignores the user's `date_of_birth` which is stored on the `User` model. The projection result will be wrong for any user who is not 35 years old, making the plan projections endpoint unreliable.

### 26. Rate limiting is global but not applied per-endpoint

`server.py` configures a global `100/minute` default limit on `limiter`. None of the individual route handlers use `@limiter.limit(...)` decorators. The unauthenticated endpoints (`/plans/project`, expense categories, asset types, liability types, plan types) are particularly exposed since they have no auth cost either. The financial projection endpoint (`/plans/project`) can be CPU-intensive and should have a tighter per-IP limit.

### 27. OpenAPI tags are inconsistent casing

Route tags mix lowercase (`"portfolios"`, `"properties"`, `"income"`, `"loans"`) with title case (`"GDPR"`, `"webhooks"`). The OpenAPI spec will display these as separate tag groups. All tags should follow one convention (title case is standard for display).

### 28. No `summary` field on most OpenAPI route decorators

FastAPI uses the function docstring as the OpenAPI `description` and generates the `summary` from the function name (converting underscores to spaces). Most handlers have a docstring but no explicit `summary=` in the decorator. The auto-generated summaries like "Get Portfolio Properties" are acceptable, but explicitly setting `summary=` on complex or non-obvious endpoints improves the generated docs significantly.

---

## Consistency Improvements

**DELETE response body.** All delete handlers should return either 204 with no body or a consistent `{"deleted": true, "id": "..."}` envelope. Currently some return `"Portfolio deleted successfully"`, others `"Loan deleted successfully"`, etc. Define one `DeleteResponse` schema and reuse it.

**Frequency string normalization.** The `to_monthly()` helper in `dashboard.py` handles 10 frequency variants (weekly, Weekly, monthly, Monthly, etc.) with a dict literal. The same pattern appears independently in `expenses.py` (`to_monthly()`) and `utils/calculations.py` (`annualize_amount()`). These three implementations will drift. One canonical frequency normalizer should live in `utils/calculations.py` and be imported everywhere.

**`_verify_property_access` is duplicated.** The function is defined identically in both `backend/routes/loans.py` (line 32) and `backend/routes/valuations.py` (line 29). Extract it to `utils/auth.py` or a `utils/access.py` module.

**`GET /api/projections/property/{property_id}/summary` vs `GET /api/projections/{property_id}`.** Both operate on a property and return projection data. The `/summary` variant returns a plain dict with no `response_model`, while the full projection returns a typed `PropertyProjectionResponse`. The summary endpoint should declare a `response_model` and the naming distinction should be documented in the OpenAPI description.

**`POST /api/dashboard/snapshot` returns `{"message": ..., "snapshot": snapshot}` where `snapshot` is a full SQLModel object.** This bypasses the `response_model` serializer (there is none declared), so `Decimal` fields may serialize inconsistently depending on the JSON encoder. The endpoint should declare `response_model=NetWorthSnapshot` (or a dedicated `SnapshotResponse`) and return just the object.

**`compare_scenario` returns raw `float` values** for all financial metrics (lines 551-558, `scenarios.py`). This is inconsistent with the rest of the API which returns `Decimal`-backed models.

**`PUT` vs `PATCH` for partial updates.** All update endpoints use `PUT` but implement partial update semantics (`model_dump(exclude_unset=True)`). `PATCH` is the correct HTTP method for partial updates. This should be standardized: either switch to `PATCH` (preferred, matches the partial-update implementation) or accept a full replacement body and use `PUT` correctly.
