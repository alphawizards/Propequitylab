# PropEquityLab - Error Registry & Known Issues

> **Purpose:** Document bugs found, their fixes, and potential issues to monitor.
> **Last Updated:** 2026-02-05

---

## Table of Contents

1. [Critical Bugs (Fixed)](#critical-bugs-fixed)
2. [Security Concerns (To Monitor)](#security-concerns-to-monitor)
3. [Potential Issues (Watch List)](#potential-issues-watch-list)
4. [Testing & Prevention](#testing--prevention)

---

## Critical Bugs (Fixed)

### 1. Missing `await` in Email Wrapper Functions

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Status** | Fixed (2026-02-05) |
| **File** | `backend/utils/email.py` |
| **Lines Affected** | 157, 264, 352 |
| **Impact** | All emails silently failed - verification, password reset, welcome |

**Description:**

Three async wrapper functions called `send_email()` without the `await` keyword. In Python, calling an async function without `await` returns a coroutine object that is never executed. The coroutine is silently discarded by the garbage collector.

**Before (Broken):**
```python
async def send_verification_email(email: str, name: str, verification_token: str) -> bool:
    # ... builds HTML template
    return send_email(email, subject, html)  # Returns coroutine, not bool!
```

**After (Fixed):**
```python
async def send_verification_email(email: str, name: str, verification_token: str) -> bool:
    # ... builds HTML template
    return await send_email(email, subject, html)  # Actually executes and returns bool
```

**User Impact:**
- Users register but never receive verification email
- Users request password reset but never receive email
- Users verify email but never receive welcome email
- No errors shown to user or logged - complete silent failure

**Why It Wasn't Caught:**
1. No runtime error - Python silently creates and discards the coroutine
2. Manual testing with `RESEND_API_KEY` unset uses simulation mode (logs to console)
3. No automated tests covering email return values
4. Type hints show `-> bool` but Python doesn't enforce return types

**Prevention:**
- Test file added: `backend/tests/test_email_async.py`
- Tests validate return type is `bool`, not `coroutine`
- Tests use mocked `send_email` to verify it's actually called

**Lesson Learned:**
Always test async functions for:
1. Correct return type (not coroutine)
2. Side effects actually occur (use mocks to verify calls)

---

## Security Concerns (To Monitor)

### 2. CORS Configuration

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Monitor |
| **File** | `backend/server.py` |
| **Lines** | 166-172 |

**Current Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Good - uses env var
    allow_credentials=True,
    allow_methods=["*"],            # Permissive - allows all HTTP methods
    allow_headers=["*"],            # Permissive - allows all headers
)
```

**Risk:**
- `allow_methods=["*"]` permits any HTTP method (including OPTIONS, TRACE, etc.)
- `allow_headers=["*"]` permits any custom header

**Recommendation:**
For production, consider restricting to:
```python
allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
allow_headers=["Content-Type", "Authorization"],
```

**Why It Might Be OK:**
- `allow_origins` is properly restricted via `CORS_ORIGINS` env var
- Credentials are handled correctly
- API is not exposing sensitive operations via unusual methods

**Action Required:** Review before production launch.

---

### 3. User ID Logging

| Field | Value |
|-------|-------|
| **Severity** | Low-Medium |
| **Status** | Monitor |
| **File** | `backend/utils/auth.py` |
| **Lines** | 303, 306, 321 |

**Description:**

Authentication functions log user IDs at INFO level:
```python
logger.info(f"Authenticated user: {user.id}, Verified: {user.is_verified}")
logger.warning(f"User {current_user.id} is not verified. Raising 403.")
```

**Consideration:**
- `sentry_config.py` sets `send_default_pii=False` for GDPR compliance
- However, explicit log statements still emit user IDs
- If Sentry captures INFO/WARNING logs, user IDs may be sent externally

**Recommendation:**
1. Review Sentry log capture settings
2. Consider logging session IDs instead of user IDs
3. Or accept that UUIDs are not directly identifying

---

## Potential Issues (Watch List)

### 4. Environment Variable Dependencies

| Variable | Used By | Fallback | Risk if Missing |
|----------|---------|----------|-----------------|
| `RESEND_API_KEY` | email.py | Simulation mode | Emails log to console only |
| `SENTRY_DSN` | sentry_config.py | Disabled | No error monitoring |
| `CORS_ORIGINS` | server.py | `http://localhost:3000` | Production CORS blocked |
| `DATABASE_URL` | database_sql.py | None | App won't start |
| `JWT_SECRET_KEY` | auth.py | None | App won't start |

**Recommendation:** Add startup validation that logs warnings for optional vars and fails fast for required vars.

---

### 5. Decimal Precision in API Responses

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Status** | Monitor |
| **File** | Various route files |

**Description:**

Some Pydantic models return `Decimal` fields without explicit precision:
```python
class ExpenseCategorySummary(BaseModel):
    total: Decimal  # No precision specified
```

**Risk:**
- JSON serialization may produce unexpected precision
- Frontend may receive `0.10000000000000001` instead of `0.10`

**Recommendation:**
- Use `round_currency()` utility before returning
- Or configure Pydantic JSON encoder for Decimal

---

### 6. Async Function Pattern Violations

**Common Mistake to Watch For:**

Anywhere you see this pattern, it's likely a bug:
```python
async def wrapper_function():
    return some_async_function()  # Missing await!
```

**Files to audit for this pattern:**
- `backend/utils/` - all utility modules
- `backend/routes/` - any route calling async helpers

**Prevention:**
- The `test_email_async.py` pattern can be replicated for other modules
- Consider adding a linter rule (though Python linters don't catch this well)

---

### 7. Database Connection Pool Exhaustion

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Monitor in Production |
| **File** | `backend/utils/database_sql.py` |

**Description:**

SQLAlchemy connection pools can be exhausted if:
- Long-running queries hold connections
- Connections aren't returned (missing session cleanup)
- Pool size too small for traffic

**Symptoms:**
- Requests hang waiting for connections
- Timeout errors after 30 seconds
- "QueuePool limit reached" errors

**Monitoring:**
- Add metrics for active connections
- Set up alerts for pool utilization > 80%

---

### 8. Token Expiration Edge Cases

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Status** | Monitor |
| **File** | `backend/utils/auth.py` |

**Scenarios to Test:**
1. User starts long form, token expires mid-submission
2. User opens app in multiple tabs, one refreshes token
3. Clock skew between server and client

**Current Handling:**
- 401 responses should trigger token refresh
- Frontend has retry logic

**Recommendation:** Test these scenarios in alpha testing phase.

---

## Testing & Prevention

### Recommended Test Coverage

| Area | Test File | Priority |
|------|-----------|----------|
| Email async behavior | `test_email_async.py` | High |
| Auth token handling | `test_auth.py` | High |
| Decimal calculations | `test_calculations.py` | Medium |
| API response formats | `test_api_responses.py` | Medium |
| Database transactions | `test_database.py` | Medium |

### CI/CD Checks to Add

1. **Async await linting** - Custom check for unawaited coroutines
2. **Type checking** - `mypy` with strict mode
3. **Security scanning** - `bandit` for Python security issues
4. **Dependency audit** - `pip-audit` for vulnerable packages

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Environment variables set in production
- [ ] Sentry DSN configured
- [ ] CORS origins set correctly
- [ ] Email delivery verified (send test email)
- [ ] Database migrations applied
- [ ] SSL certificates valid

---

## Adding New Errors to This Document

When documenting a new error, include:

1. **Severity:** Critical / High / Medium / Low
2. **Status:** Active / Fixed / Monitor
3. **File and line numbers**
4. **Code example** (before/after if fixed)
5. **User impact**
6. **Root cause**
7. **Prevention measures**

---

*This document is maintained alongside the codebase. Update it when bugs are found or fixed.*
