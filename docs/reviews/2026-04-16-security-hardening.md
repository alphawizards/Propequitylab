# Security & Hardening Review — 2026-04-16

## Passed Checks

- All 16 route files use `Depends(get_current_user)` on every protected endpoint — with one exception (CRIT-1).
- Every DB query returning user-owned data includes `.where(Model.user_id == current_user.id)`. No wholesale IDOR found.
- Clerk JWT verification uses RS256 with JWKS key cache. `ExpiredSignatureError` caught, returns 401.
- No hardcoded secrets. `JWT_SECRET_KEY` unused (Clerk replaced it). `password_hash = "clerk_managed"` correct.
- Sentry backend: `send_default_pii=False` set at `backend/utils/sentry_config.py:36`.
- All security headers present: HSTS, X-Frame-Options: DENY, X-Content-Type-Options, CSP, Referrer-Policy.
- CORS origins loaded from env var, not wildcarded.
- Frontend tokens: Clerk manages JWT in memory via `getToken()`. No JWT in `localStorage`.
- Clerk webhook signature verification enforced via svix.
- No raw SQL string interpolation anywhere. All queries use parameterised ORM.

---

## Critical Issues

### CRIT-1 — POST /api/plans/project is unauthenticated

**Location:** `backend/routes/plans.py:266`

```python
@router.post("/project", response_model=ProjectionResult)
async def calculate_projection(data: ProjectionInput):
```

No `Depends(get_current_user)`. Any unauthenticated caller can invoke this endpoint.

**Exploit 1 — DoS:** `ProjectionInput` has zero field bounds. `life_expectancy=100000`, `current_age=0` = 100,000 loop iterations per request. SlowAPI 100/min is per-IP — bypassed via shared IPs.

**Exploit 2 — Auth surface gap:** Only public endpoint in the entire API. Discoverable by scanners.

**Fix:**
```python
@router.post("/project", response_model=ProjectionResult)
async def calculate_projection(
    data: ProjectionInput,
    current_user: User = Depends(get_current_user),
):
    if data.life_expectancy - data.current_age > 100:
        raise HTTPException(status_code=400, detail="Age range too large")
```

---

### CRIT-2 — GDPR delete-account does not cascade financial data; hard-delete job missing

**Location:** `backend/routes/gdpr.py:295-317`

```python
current_user.email = f"deleted-{current_user.id}@zapiio.deleted"
current_user.name = "Deleted User"
session.add(current_user)
session.commit()
# All Portfolio, Property, Asset, Liability, IncomeSource, Expense rows remain untouched
```

Response promises permanent deletion in 30 days but no scheduled job exists in the codebase. During the 30-day window all financial records — property addresses, loan amounts, income figures, liability balances — remain fully queryable linked to the original `user_id` UUID.

Australian Privacy Act (APP 11.2) + GDPR Article 17 violation.

Secondary: response references `support@zapiio.com` — stale brand. Live domain is `propequitylab.com`.

**Fix:**
1. On delete, immediately null out child PII: property addresses, expense descriptions, income source names.
2. Implement hard-delete scheduled job (Railway cron or APScheduler) with a verifying test.
3. Fix support email in response body.

---

### CRIT-3 — IDOR risk in deep_copy_portfolio: sub-table queries have no user_id filter

**Location:** `backend/routes/scenarios.py:113-115`, throughout `deep_copy_portfolio` (lines 181, 194, 208, 218, 229, 247, 267, 285) and `delete_scenario` (lines 478–500)

```python
old_properties = session.exec(
    select(Property).where(Property.portfolio_id == source_portfolio.id)
).all()
# No user_id filter — same pattern repeated for Loan, RentalIncome, Valuation, GrowthRate, Asset, Liability, etc.
```

Outer `create_scenario` verifies source portfolio ownership, so safe under normal operation. But FK corruption or future code change would cause this to silently clone another user's financial records.

**Fix:** Add `Property.user_id == user.id` (and equivalent) to every sub-table query inside both `deep_copy_portfolio` and `delete_scenario`.

---

## High Issues

### HIGH-1 — Financial amounts passed as URL query parameters (written to server logs)

**Location:** `backend/routes/loans.py:206-213`, `240-248`

```python
async def add_extra_repayment(loan_id: int, amount: float, frequency: str, start_date: str, ...):
```

Requests appear in Railway + Cloudflare logs as:
```
POST /api/loans/42/extra-repayments?amount=1500.00&frequency=monthly&start_date=2026-01-01
```

**Fix:** Move `amount`, `frequency`, `start_date`, `end_date` to a Pydantic request body.

---

### HIGH-2 — JWT audience verification disabled

**Location:** `backend/utils/clerk_auth.py:108`

```python
options={"verify_aud": False},
```

Token issued for a different app on the same Clerk instance would be accepted — token confusion risk.

**Fix:** Set `"aud": "propequitylab-backend"` in Clerk JWT template, then:
```python
payload = jwt.decode(token, public_key, algorithms=["RS256"],
    issuer=CLERK_ISSUER, audience="propequitylab-backend")
```

---

### HIGH-3 — Loan amounts accepted as Python float, not Decimal

**Location:** `backend/routes/loans.py:206`, `240`

`amount: float` violates the `DECIMAL(19,4)` codebase rule. `Decimal(str(amount))` cast mitigates worst-case but float is already imprecise before the cast.

**Fix:** Move to a Pydantic request body and parse directly as `Decimal`.

---

### HIGH-4 — compare_scenario fetches source portfolio without ownership check

**Location:** `backend/routes/scenarios.py:537-544`

```python
source = session.exec(
    select(Portfolio).where(Portfolio.id == scenario.source_portfolio_id)
).first()
```

**Fix:**
```python
source = session.exec(
    select(Portfolio).where(
        Portfolio.id == scenario.source_portfolio_id,
        Portfolio.user_id == current_user.id,
    )
).first()
```

---

## Medium Issues

### MED-1 — Frontend Sentry reads non-existent localStorage key; missing sendDefaultPii: false

**Location:** `frontend/src/utils/sentry.js:74-85`

```javascript
const userStr = localStorage.getItem('user');  // Nothing writes this key — dead code
```

If any future code writes user data to `localStorage`, it silently forwards emails into Sentry. Also missing `sendDefaultPii: false` in frontend `Sentry.init`.

**Fix:** Remove the `localStorage.getItem('user')` block. Add `sendDefaultPii: false`.

---

### MED-2 — ProjectionInput has no field bounds (CPU exhaustion)

**Location:** `backend/routes/plans.py:31-40`

Authenticated users can submit `life_expectancy=10000` triggering a 10,000-iteration loop.

**Fix:**
```python
life_expectancy: int = Field(default=95, ge=50, le=120)
current_age: int = Field(default=35, ge=0, le=100)
withdrawal_rate: float = Field(default=4.0, gt=0.0, le=20.0)
```

---

### MED-3 — generate_id() uses 8-character UUID prefix — collision-prone

**Location:** `backend/routes/scenarios.py:38-39`

```python
def generate_id() -> str:
    return str(uuid.uuid4())[:8]
```

32 bits of entropy. ~1% collision at 9,300 records. All other routes use full `str(uuid.uuid4())`.

**Fix:** Replace with `str(uuid.uuid4())` throughout `scenarios.py`.

---

### MED-4 — CORS origins logged at INFO on every startup

**Location:** `backend/server.py:57`

```python
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")
```

Production domain names in Railway logs on every cold start. **Fix:** `logger.debug()`.

---

### MED-5 — partner_details stored as unvalidated raw JSON with no GDPR consent

**Location:** `backend/routes/onboarding.py:109-111`

Stores arbitrary dict of third party personal data (partner income, DOB, financials) with no schema validation and no consent mechanism.

**Fix:** Define `PartnerDetails` Pydantic schema. Add UI consent checkpoint.

---

## Low / Informational

- **LOW** — CSP has `unsafe-inline` and `unsafe-eval` (`backend/server.py:150`): Known React + Clerk trade-off — track for nonce-based approach.
- **LOW** — Clerk webhook returns 500 when secret unconfigured (`backend/routes/clerk_webhooks.py:79`): Should be 503 so Clerk retries delivery.
- **LOW** — `delete_portfolio` does not delete Loan/PropertyValuation/RentalIncome sub-records (`backend/routes/portfolios.py:169`): Orphan rows accumulate; compounds CRIT-2 GDPR gap.
- **LOW** — Frontend Sentry sends user email + full name (`frontend/src/utils/sentry.js:110`): Reduce to `id` only.
- **LOW** — Health check discloses `"stack": "PostgreSQL + Railway"` to unauthenticated callers (`backend/server.py:99`): Remove `stack` field from production response.

---

## Summary

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 4 |
| Medium | 5 |
| Low | 5 |

**Verdict: BLOCKED** — CRIT-1 (unauthenticated endpoint) and CRIT-2 (GDPR delete non-cascade + missing hard-delete job) must be resolved before next production deploy.
