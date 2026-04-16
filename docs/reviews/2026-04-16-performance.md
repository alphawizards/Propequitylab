# Performance Review — 2026-04-16

Stack: FastAPI + SQLModel + PostgreSQL (Neon serverless) + React 19 + Cloudflare Pages

---

## Critical Issues

### 1. N+1 Query Pattern in `get_portfolio_projections` — `backend/routes/projections.py:351`

The portfolio projections endpoint loops over every property and calls `_get_property_data()` once per property. `_get_property_data()` fires **6 separate SQL queries** (loans, valuations, growth rates, rental income, expenses, depreciation) for every iteration.

```python
for property_obj in properties:
    property_data = _get_property_data(property_obj.id, session)  # 6 queries per property
```

With 5 properties that is 31 queries (1 portfolio + 1 properties list + 6×5). With 10 properties it is 61. On Neon serverless each round-trip is 5–15 ms on a warm connection; on a cold connection this can compound to seconds.

Fix: bulk-fetch all child records for the full list of property IDs with a single `IN` clause per table, then group in Python before the loop:

```python
property_ids = [p.id for p in properties]
all_loans = session.exec(select(Loan).where(Loan.property_id.in_(property_ids))).all()
loans_by_prop = defaultdict(list)
for loan in all_loans:
    loans_by_prop[loan.property_id].append(loan)
# repeat for each table
```

Estimated impact: 80–90% query reduction on the most expensive endpoint in the app.

---

### 2. `/dashboard/summary` Fires 5 Separate Queries and All Aggregation Happens in Python — `backend/routes/dashboard.py:77`

The dashboard summary endpoint fetches full ORM objects for properties, assets, liabilities, income sources, and expenses, then sums them in Python. These are all aggregations (`SUM`, `GROUP BY`) that the database can compute in a single query.

Current pattern (5 round-trips, full row hydration):
```python
properties   = session.exec(select(Property).where(...)).all()
assets       = session.exec(select(Asset).where(...)).all()
liabilities  = session.exec(select(Liability).where(...)).all()
income_sources = session.exec(select(IncomeSource).where(...)).all()
expenses     = session.exec(select(Expense).where(...)).all()
```

Then Python loops over every object multiple times to produce sums. The `asset_breakdown` block alone iterates the assets list 7 times (once per `type`).

Fix: push the summation into Postgres with `func.sum()` grouped by type. Where full hydration is unavoidable (e.g. for `to_monthly` frequency conversion), at minimum use `select(Model.amount, Model.frequency)` to avoid fetching every column.

Estimated impact: 5 round-trips → 1–2, plus zero Python iteration cost for aggregation.

---

### 3. `DashboardSummary` Uses `float` — `backend/routes/dashboard.py:31`

The response model declares all financial fields as `float`, overriding the `Decimal` precision maintained throughout the calculation layer. Values are explicitly converted with `float(...)` before serialisation. This is a correctness issue (precision loss on large Australian property values) as well as being inconsistent with every other model in the codebase.

```python
class DashboardSummary(BaseModel):
    net_worth: float = 0        # should be Decimal
    total_assets: float = 0     # should be Decimal
    ...
```

---

## High Issues

### 4. No `pool_recycle` Configured for Neon Serverless — `backend/utils/database_sql.py:62`

Neon serverless terminates idle connections after a short timeout (roughly 5 minutes on the free tier, configurable but often low). The engine is created with `pool_pre_ping=True` which detects dead connections before use, but `pool_pre_ping` adds a `SELECT 1` round-trip to every request that picks up a recycled connection. The better fix is to set `pool_recycle` to a value shorter than Neon's idle timeout so connections are replaced proactively.

Current:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=POOL_SIZE,        # default 10
    max_overflow=MAX_OVERFLOW,  # default 20
    pool_timeout=POOL_TIMEOUT,  # default 30
    pool_pre_ping=True,
    poolclass=QueuePool,
)
```

Missing: `pool_recycle=300` (5 minutes) and `connect_args={"connect_timeout": 10}`.

Also: `POOL_SIZE=10` with `MAX_OVERFLOW=20` means up to 30 simultaneous connections to a Neon serverless database. Neon's free tier allows 100 connections but each compute unit scales down when idle; on Railway with a single worker this is oversized and may exhaust compute units needlessly. A `pool_size` of 3–5 is more appropriate for a single-worker deployment.

### 5. `_get_property_data` Has No User Isolation on Child Tables — `backend/routes/projections.py:45`

The helper queries loans, valuations, growth rates, rental income, expenses, and depreciation by `property_id` only. Ownership is verified on the `Property` row at the route level, but the child tables (`loans`, `rental_income`, `expense_logs`, etc.) do not have a `user_id` column and are not cross-checked. If a property ID is guessed or obtained through another bug, child data is directly accessible. This is a latent IDOR risk that will become a real issue if any future endpoint accepts `property_id` without first verifying property ownership.

Short-term: the ownership check on `Property` before calling `_get_property_data` is the correct guard — just make sure it is never bypassed. Longer-term: add `user_id` to the Loan and financial child tables and filter on it.

### 6. `generate_portfolio_projections` in `calculations.py` Calls `calculate_portfolio_summary` Once Per Year — `backend/utils/calculations.py:705`

`generate_portfolio_projections` is a pure-Python function that loops over each year and calls `calculate_portfolio_summary`, which itself loops over all properties and runs 4–5 sub-calculations per property per year. For a 10-property portfolio projected 30 years, this is 10 × 30 × 5 = 1,500 `Decimal` exponential operations (`** int(total_months)` where `total_months` can be 360). Decimal exponentiation is significantly slower than float.

The amortisation formula `one_plus_r ** int(total_months)` at line 167 and line 274 recalculates the same base values every call even though the principal and rate do not change year over year for interest-only loans, and only the elapsed-months value changes for P&I loans.

Fix: memoize or precompute `(1+r)^n` for each loan once at the start of the projection loop, then derive remaining balance by stepping forward from the last result rather than recalculating from scratch each year.

### 7. `POST /dashboard/snapshot` Re-runs the Full Dashboard Query — `backend/routes/dashboard.py:246`

The snapshot endpoint calls `get_dashboard_summary()` internally, which re-runs all 5 queries. This means a snapshot creation costs 5 additional queries on top of however many were already fired to display the dashboard. The caller almost certainly just pressed "save snapshot" after viewing the dashboard, so the data is stale by at most one user interaction.

Fix: accept pre-computed totals as optional input, or cache the most recent summary per portfolio for 60 seconds (see Quick Wins).

---

## Medium Issues

### 8. `PortfolioContext` Fetches Summary on Every `currentPortfolio` Change — `frontend/src/context/PortfolioContext.jsx:45`

The `useEffect` at line 45 depends on `currentPortfolio?.id` and calls `api.getPortfolioSummary()` unconditionally whenever the portfolio changes. There is no stale-while-revalidate, no deduplication, and no error boundary. Every page that calls `selectPortfolio` (even selecting the same portfolio twice) will trigger a network request.

Fix: track `lastFetchedPortfolioId` in a ref. Only re-fetch if the ID actually changed, and skip if a request is already in-flight.

### 9. Asset Breakdown Loops the Same Array 7 Times — `backend/routes/dashboard.py:119`

```python
asset_breakdown = AssetBreakdown(
    super=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'super')),
    shares=float(sum(... for a in assets if a.type == 'shares')),
    etf=float(sum(... for a in assets if a.type == 'etf')),
    # ... 4 more
)
```

Seven generator expressions over the same list. A single `defaultdict` accumulation pass is both faster and more readable:

```python
totals = defaultdict(Decimal)
for a in assets:
    totals[a.type] += a.current_value or Decimal(0)
```

Similarly, `liability_breakdown` and `total_assets` re-sum the same collections again. The full `assets` list is iterated at least 9 times total in the function.

### 10. `calculate_property_value` Applies Growth Year-by-Year in a Python Loop — `backend/utils/calculations.py:360`

```python
for year in range(base_year, target_year):
    growth_rate = get_growth_rate_for_year(year, growth_rates)
    growth_multiplier = Decimal("1") + (growth_rate / Decimal("100"))
    current_value = current_value * growth_multiplier
```

When growth rates are constant across the full range (the common case), this loop runs up to 50 iterations of Decimal multiplication where a single exponentiation would suffice: `value * (1 + r)^n`. Only when growth rates change mid-period do the per-year iterations add value.

Fix: segment the projection range by rate periods, apply compound growth per segment, collapse to a single multiply when a period covers the full range.

### 11. No Database Indexes on `(portfolio_id, user_id)` Composite Queries — `backend/models/`

The dashboard query filters `Property`, `Asset`, `Liability`, `IncomeSource`, and `Expense` all on `(portfolio_id, user_id)` together. The models define separate single-column indexes (`user_id` on Property, `portfolio_id` on financials), but no composite index. On tables with many rows per user, Postgres will pick the more selective single index and filter the other in-memory.

Composite indexes to add via Alembic:

```python
# models/property.py
__table_args__ = (Index("ix_properties_portfolio_user", "portfolio_id", "user_id"),)

# models/asset.py
__table_args__ = (Index("ix_assets_portfolio_user", "portfolio_id", "user_id"),)

# models/liability.py, models/income.py, models/expense.py — same pattern
```

### 12. `to_monthly` Frequency Dict Rebuilt on Every Call — `backend/routes/dashboard.py:156`

The `to_monthly` helper is a nested function that re-constructs a 10-entry dict literal on every invocation. It is called once per income source and once per expense. The `FREQUENCY_MULTIPLIERS` constant already exists in `utils/calculations.py` with monthly equivalents — this is a duplication that diverges (e.g. `one_time`/`OneTime` are present here but missing variants that exist in calculations.py). The dict should be a module-level constant and the function should delegate to `calculations.py`.

### 13. No Pagination on Any List Endpoint — `backend/routes/`

Properties, assets, liabilities, income sources, and expenses are all returned as unbounded lists. A user with a large portfolio (50+ properties across multiple portfolios) will receive the full dataset on every request. Neon serverless charges per compute-second; large result sets keep connections open longer.

The net-worth history endpoint at `dashboard.py:194` does accept a `limit` parameter but defaults to 12 — the pattern is already established, just not applied elsewhere.

---

## Low / Informational

### 14. `health_check` Calls `test_connection()` on Every Request — `backend/server.py:95`

The health endpoint opens a session and runs `SELECT 1` synchronously on every call. If Railway's health check fires every 10 seconds, this is 6 connection acquisitions per minute purely for health-checking, on top of normal traffic. Use a cached status with a TTL of 10–30 seconds instead.

### 15. Security Headers Middleware Runs as a Synchronous Python Middleware — `backend/server.py:140`

The `add_security_headers` middleware awaits `call_next` but the header-setting code itself is synchronous. This is fine, but it means every request passes through Python middleware even for static/OPTIONS responses where headers could be set at the reverse proxy (Railway's Nginx layer or Cloudflare). For a serverless deployment, keeping middleware minimal reduces cold-start overhead.

### 16. `deep_copy_portfolio` in `scenarios.py` Commits One Row at a Time — `backend/routes/scenarios.py:66`

The scenario deep-copy function (first 100 lines read) accumulates new model objects. If it follows the same pattern as similar routes in this codebase (individual `session.add()` + `session.commit()` per object), each child entity is a separate transaction. Bulk-insert all child rows in a single `session.add_all([...])` + one `session.commit()` instead.

### 17. `refreshSummary` in `PortfolioContext` Has No Loading State — `frontend/src/context/PortfolioContext.jsx:79`

`refreshSummary` is `async` but sets no loading flag, meaning the UI has no way to show a spinner while a refresh is in progress. If called from multiple components simultaneously, it fires multiple concurrent requests.

### 18. Only 16 of All Frontend Components Use `useMemo`/`useCallback`/`React.memo`

The grep found 16 files using memoisation across the entire `src/` tree. The context providers (`PortfolioContext`, `UserContext`) create new object literals as the `value` prop on every render, which re-renders every consumer. In `PortfolioContext` the `value` object at line 87 should be wrapped in `useMemo` with the relevant deps.

```jsx
const value = useMemo(() => ({
  portfolios, currentPortfolio, loading, summary,
  fetchPortfolios, createPortfolio, selectPortfolio, refreshSummary,
}), [portfolios, currentPortfolio, loading, summary]);
```

Same applies to `UserContext` at line 166.

### 19. `api.js` Request Timeout Is 30 Seconds — `frontend/src/services/api.js:31`

```js
timeout: 30000,
```

The projection endpoint can legitimately take several seconds for large portfolios. But 30 seconds is too long for the dashboard summary, which should respond in under 2 seconds on a warm connection. Consider per-request timeout overrides for known-expensive endpoints vs fast reads.

---

## Quick Wins

These can be implemented in under an hour each and have measurable immediate impact.

1. **Add `pool_recycle=300`** to the SQLAlchemy engine in `backend/utils/database_sql.py`. One line change. Eliminates the silent connection-drop problem on Neon's serverless scale-to-zero.

2. **Wrap `PortfolioContext.value` in `useMemo`** at `frontend/src/context/PortfolioContext.jsx:87`. Prevents the entire consumer tree re-rendering on every portfolio context state change that does not affect the consumed values.

3. **Collapse the 7-pass asset loop** in `backend/routes/dashboard.py:119` into a single `defaultdict` pass. 10-minute change, eliminates redundant Python iteration.

4. **Add a ref guard to `fetchSummary`** in `PortfolioContext` to skip the API call if `currentPortfolio?.id` has not changed from the last fetch.

5. **Move `to_monthly` out of the function body** in `backend/routes/dashboard.py:156` and replace with the existing `FREQUENCY_MULTIPLIERS` from `utils/calculations.py`. Fixes a silent divergence between the two frequency maps and removes the per-call dict allocation.

6. **Add a `limit` query param** to the properties and assets list endpoints defaulting to 100. Zero schema change needed.

7. **Set `pool_size=5, max_overflow=10`** in `database_sql.py` to match a single Railway worker's realistic concurrency. The current defaults (10/20) hold 30 connections open against Neon when only 1–3 are ever in use simultaneously.
