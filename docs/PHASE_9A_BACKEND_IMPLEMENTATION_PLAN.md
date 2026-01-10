# Phase 9A (Backend) Implementation Plan: Authentication & User Management

**Document Version:** 1.0
**Date:** 2026-01-07
**Status:** Ready for Verification & Completion
**Estimated Duration:** 4-6 hours (most infrastructure already exists)

---

## ⚠️ CRITICAL SECURITY RULES - READ FIRST

Before implementing ANY authentication endpoint, internalize these **non-negotiable security rules**:

### 🔒 Rule 1: Password Security
**NEVER store passwords in plain text - ALWAYS use bcrypt hashing**
- Use `hash_password()` from utils/auth.py for all password storage
- Minimum password requirements enforced via `validate_password_strength()`
- Never log or expose password hashes in responses

### 🔒 Rule 2: JWT Token Security
**Always verify token type and expiration**
- Access tokens: 30 minutes expiration (short-lived)
- Refresh tokens: 7 days expiration (longer-lived)
- Token payload must include: `sub` (user_id), `type` (access/refresh), `exp` (expiration)
- Never expose JWT_SECRET_KEY in logs or responses

### 🔒 Rule 3: Rate Limiting
**ALL authentication endpoints MUST have rate limiting**
- Login: 5 requests per 15 minutes
- Register: 3 requests per hour
- Password Reset: 3 requests per hour
- Prevents brute-force attacks

### 🔒 Rule 4: Email Verification
**Users MUST verify email before accessing protected resources**
- Set `is_verified=False` on registration
- Block login if `is_verified=False`
- Generate secure random tokens via `generate_verification_token()`
- Verification tokens should be single-use

### 🔒 Rule 5: Password Reset Security
**Reset tokens MUST expire and be single-use**
- Expiration: 1 hour
- Clear token after successful reset
- Use `generate_reset_token()` for cryptographically secure tokens
- Don't reveal whether email exists (security best practice)

---

## 🎯 Current Status Assessment

### ✅ Already Implemented

Based on code review, the following components are **already complete**:

#### 1. User Model ✅ COMPLETE
**File:** [backend/models/user.py](backend/models/user.py:1-125)

**Status:** Fully implemented with all required fields
- ✅ `id` (primary key)
- ✅ `email` (unique, indexed)
- ✅ `password_hash` (bcrypt storage)
- ✅ `is_verified` (email verification status)
- ✅ `verification_token` (email verification)
- ✅ `reset_token` (password reset)
- ✅ `reset_token_expires` (token expiration)
- ✅ Profile fields (name, DOB, planning_type, etc.)
- ✅ Onboarding fields
- ✅ Timestamps (created_at, updated_at)

**Pydantic Models:**
- ✅ `UserCreate` - Registration request
- ✅ `UserLogin` - Login request
- ✅ `UserUpdate` - Profile update
- ✅ `UserResponse` - Safe response (excludes password_hash)

#### 2. Auth Utilities ✅ COMPLETE
**File:** [backend/utils/auth.py](backend/utils/auth.py:1-358)

**Status:** Comprehensive authentication utilities
- ✅ Password hashing with bcrypt (`hash_password`, `verify_password`)
- ✅ Password strength validation (8 chars, uppercase, lowercase, digit, special char)
- ✅ JWT access token generation (30 min expiry)
- ✅ JWT refresh token generation (7 day expiry)
- ✅ Token verification with type checking
- ✅ Secure token generation for verification/reset
- ✅ User authentication function
- ✅ FastAPI dependencies: `get_current_user`, `get_current_active_user`
- ✅ Token response helper

#### 3. Auth Routes ✅ COMPLETE
**File:** [backend/routes/auth.py](backend/routes/auth.py:1-411)

**Status:** All endpoints implemented
- ✅ `POST /api/auth/register` - User registration with email verification
- ✅ `POST /api/auth/login` - Login with credentials
- ✅ `POST /api/auth/refresh` - Refresh access token
- ✅ `GET /api/auth/me` - Get current user info
- ✅ `POST /api/auth/logout` - Logout (client-side token discard)
- ✅ `GET /api/auth/verify-email` - Email verification endpoint
- ✅ `POST /api/auth/resend-verification` - Resend verification email
- ✅ `POST /api/auth/request-password-reset` - Request password reset
- ✅ `POST /api/auth/reset-password` - Reset password with token

#### 4. Rate Limiting ✅ COMPLETE
**File:** [backend/utils/rate_limiter.py](backend/utils/rate_limiter.py:1-208)

**Status:** Production-ready with Redis support
- ✅ Redis-based distributed rate limiting
- ✅ In-memory fallback for development
- ✅ Predefined limiters: `rate_limit_login`, `rate_limit_register`, `rate_limit_password_reset`
- ✅ Configurable via environment variables

#### 5. Email Service ✅ COMPLETE
**File:** [backend/utils/email.py](backend/utils/email.py:1-375)

**Status:** Resend API integration complete
- ✅ Verification email template
- ✅ Password reset email template
- ✅ Welcome email template
- ✅ Development mode (email simulation when no API key)
- ✅ Production mode (Resend API)

#### 6. Server Integration ✅ COMPLETE
**File:** [backend/server.py](backend/server.py:1-82)

**Status:** Auth router registered
- ✅ Auth router imported
- ✅ Auth router registered in API router
- ✅ CORS middleware configured
- ✅ Database initialization on startup

---

## 📋 Implementation Checklist

### Phase 9A: Backend Verification & Testing

Since the infrastructure is already complete, this phase focuses on **verification, testing, and minor enhancements**.

---

### ✅ Task 1: Verify User Model & Database Schema

**Status:** ✅ Model complete, verify database

- [ ] **Step 1.1:** Check if User table exists in PostgreSQL
  ```bash
  # Connect to PostgreSQL and verify
  psql $DATABASE_URL -c "\d users"
  ```

- [ ] **Step 1.2:** Verify User model fields match database schema
  ```python
  # Run in Python console or create test script
  from utils.database_sql import engine
  from sqlmodel import SQLModel, Session
  from models.user import User

  # This should not raise errors
  SQLModel.metadata.create_all(engine)
  ```

- [ ] **Step 1.3:** Test User CRUD operations
  - Create test user
  - Verify password_hash is stored (not plain password)
  - Verify timestamps are set
  - Verify email uniqueness constraint

**Expected Result:** User table exists with all required fields, constraints enforced.

---

### ✅ Task 2: Verify Auth Utilities

**File:** [backend/utils/auth.py](backend/utils/auth.py)

- [ ] **Step 2.1:** Test password hashing
  ```python
  from utils.auth import hash_password, verify_password

  # Test hashing
  plain = "SecureP@ss123"
  hashed = hash_password(plain)
  assert hashed != plain  # Should be hashed
  assert verify_password(plain, hashed)  # Should verify
  assert not verify_password("WrongPass", hashed)  # Should fail
  ```

- [ ] **Step 2.2:** Test password strength validation
  ```python
  from utils.auth import validate_password_strength

  # Should fail - too short
  is_valid, msg = validate_password_strength("Short1!")
  assert not is_valid

  # Should pass
  is_valid, msg = validate_password_strength("SecureP@ss123")
  assert is_valid
  ```

- [ ] **Step 2.3:** Test JWT token generation and verification
  ```python
  from utils.auth import create_access_token, create_refresh_token, verify_token

  # Create access token
  access = create_access_token({"sub": "user-123", "email": "test@example.com"})
  payload = verify_token(access, "access")
  assert payload["sub"] == "user-123"
  assert payload["type"] == "access"

  # Create refresh token
  refresh = create_refresh_token({"sub": "user-123"})
  payload = verify_token(refresh, "refresh")
  assert payload["type"] == "refresh"

  # Wrong type should fail
  assert verify_token(access, "refresh") is None
  ```

- [ ] **Step 2.4:** Verify environment variables are set
  ```bash
  # Required environment variables
  echo $JWT_SECRET_KEY  # Should be set to secure random string
  echo $ACCESS_TOKEN_EXPIRE_MINUTES  # Default: 30
  echo $REFRESH_TOKEN_EXPIRE_DAYS  # Default: 7
  ```

**Expected Result:** All auth utilities function correctly, environment variables configured.

---

### ✅ Task 3: Test Auth Endpoints (Manual/Automated)

**File:** [backend/routes/auth.py](backend/routes/auth.py)

#### Test Plan:

- [ ] **Step 3.1:** Start development server
  ```bash
  cd backend
  uvicorn server:app --reload --port 8001
  ```

- [ ] **Step 3.2:** Navigate to Swagger UI
  ```
  http://localhost:8001/docs
  ```

- [ ] **Step 3.3:** Test Registration Flow
  1. POST `/api/auth/register`
     - Input: `{"email": "test@example.com", "password": "SecureP@ss123", "name": "Test User"}`
     - Expected: 200 OK, message about email verification
     - Verify: Email simulation logs appear (if no RESEND_API_KEY)

  2. Check database:
     ```sql
     SELECT id, email, name, is_verified, verification_token FROM users WHERE email='test@example.com';
     ```
     - Expected: `is_verified=false`, `verification_token` is set

- [ ] **Step 3.4:** Test Email Verification
  1. GET `/api/auth/verify-email?token={verification_token}`
     - Use token from database
     - Expected: 200 OK, "Email verified successfully"

  2. Check database:
     ```sql
     SELECT is_verified, verification_token FROM users WHERE email='test@example.com';
     ```
     - Expected: `is_verified=true`, `verification_token=null`

- [ ] **Step 3.5:** Test Login Flow
  1. POST `/api/auth/login` (before verification - should fail)
     - Input: `{"email": "test@example.com", "password": "SecureP@ss123"}`
     - Expected: 403 Forbidden, "Email not verified"

  2. Verify email (Step 3.4)

  3. POST `/api/auth/login` (after verification - should succeed)
     - Expected: 200 OK, returns `access_token`, `refresh_token`, `user` object
     - Verify: Tokens are JWT strings

  4. Test wrong password:
     - Input: `{"email": "test@example.com", "password": "WrongPassword"}`
     - Expected: 401 Unauthorized

- [ ] **Step 3.6:** Test Authenticated Endpoint
  1. GET `/api/auth/me` (without token - should fail)
     - Expected: 401 Unauthorized

  2. GET `/api/auth/me` (with valid token)
     - Add header: `Authorization: Bearer {access_token}`
     - Expected: 200 OK, returns user info (excludes password_hash)

- [ ] **Step 3.7:** Test Token Refresh
  1. POST `/api/auth/refresh`
     - Input: `{"refresh_token": "{refresh_token}"}`
     - Expected: 200 OK, returns new `access_token`

  2. Test with invalid refresh token:
     - Expected: 401 Unauthorized

- [ ] **Step 3.8:** Test Password Reset Flow
  1. POST `/api/auth/request-password-reset`
     - Input: `{"email": "test@example.com"}`
     - Expected: 200 OK, generic message
     - Verify: Email simulation logs appear

  2. Check database for reset token:
     ```sql
     SELECT reset_token, reset_token_expires FROM users WHERE email='test@example.com';
     ```
     - Expected: Both fields are set

  3. POST `/api/auth/reset-password`
     - Input: `{"token": "{reset_token}", "new_password": "NewSecureP@ss456"}`
     - Expected: 200 OK

  4. Test login with new password:
     - Expected: Success

  5. Test login with old password:
     - Expected: Failure

- [ ] **Step 3.9:** Test Rate Limiting
  1. Make 6 consecutive login attempts:
     - Expected: First 5 succeed/fail based on credentials, 6th returns 429 Too Many Requests

  2. Wait 15 minutes or clear rate limit:
     - If using Redis: `redis-cli` → `FLUSHDB`
     - If using in-memory: Restart server

**Expected Result:** All auth flows work correctly, rate limiting active, email verification enforced.

---

### ✅ Task 4: Verify Rate Limiting Infrastructure

**File:** [backend/utils/rate_limiter.py](backend/utils/rate_limiter.py)

- [ ] **Step 4.1:** Check environment variables
  ```bash
  echo $REDIS_URL  # Optional - for production
  echo $ENABLE_RATE_LIMITING  # Default: True
  ```

- [ ] **Step 4.2:** Test in-memory fallback (development)
  - Set `REDIS_URL` to empty
  - Restart server
  - Expected: Warning about in-memory fallback
  - Test rate limiting still works

- [ ] **Step 4.3:** (Optional) Test Redis integration
  - Install Redis: `brew install redis` (Mac) or `apt install redis` (Linux)
  - Start Redis: `redis-server`
  - Set `REDIS_URL=redis://localhost:6379`
  - Restart server
  - Expected: "Redis rate limiter initialized" message
  - Test rate limiting persists across server restarts

**Expected Result:** Rate limiting works in both in-memory and Redis modes.

---

### ✅ Task 5: Verify Email Service

**File:** [backend/utils/email.py](backend/utils/email.py)

- [ ] **Step 5.1:** Test in development mode (no API key)
  - Ensure `RESEND_API_KEY` is not set
  - Trigger registration
  - Expected: Email HTML printed to console

- [ ] **Step 5.2:** (Optional) Test with Resend API
  - Sign up for Resend: https://resend.com
  - Get API key
  - Set environment variables:
    ```bash
    export RESEND_API_KEY="re_..."
    export FROM_EMAIL="PropEquityLab <onboarding@yourdomain.com>"
    export FRONTEND_URL="http://localhost:3000"
    ```
  - Trigger registration with your email
  - Expected: Real email received

- [ ] **Step 5.3:** Test email templates
  - Verification email should have:
    - PropEquityLab branding
    - Verification link
    - Clear instructions
  - Password reset email should have:
    - Security warning
    - Reset link
    - 1-hour expiration notice

**Expected Result:** Email service works in both simulation and production modes.

---

### ✅ Task 6: Integration Testing

- [ ] **Step 6.1:** Test complete user journey
  1. Register → Verify Email → Login → Access Protected Route
  2. Request Password Reset → Reset Password → Login with New Password
  3. Test rate limiting on login attempts
  4. Test refresh token flow

- [ ] **Step 6.2:** Test error cases
  - Duplicate email registration
  - Login with unverified email
  - Login with wrong password
  - Invalid verification token
  - Expired reset token
  - Weak password registration

- [ ] **Step 6.3:** Test security measures
  - Verify password_hash is never exposed in responses
  - Verify tokens have correct expiration
  - Verify rate limiting prevents brute force
  - Verify email verification is enforced

**Expected Result:** All user journeys complete successfully, all error cases handled properly.

---

### ✅ Task 7: Environment Variables Configuration

Create/update `.env` file in backend directory:

- [ ] **Step 7.1:** Create `.env` file template
  ```bash
  # Database
  DATABASE_URL=postgresql://user:pass@localhost:5432/propequitylab

  # JWT Configuration
  JWT_SECRET_KEY=your-secret-key-change-this-in-production-use-secrets-token-hex-32
  JWT_ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=30
  REFRESH_TOKEN_EXPIRE_DAYS=7

  # Email Service (Resend)
  RESEND_API_KEY=  # Optional - leave empty for development
  FROM_EMAIL=PropEquityLab <noreply@propequitylab.com>
  FRONTEND_URL=http://localhost:3000

  # Rate Limiting (Optional - Redis)
  REDIS_URL=  # Optional - leave empty for in-memory fallback
  ENABLE_RATE_LIMITING=True

  # CORS
  CORS_ORIGINS=http://localhost:3000,http://localhost:5173
  ```

- [ ] **Step 7.2:** Generate secure JWT secret
  ```python
  import secrets
  print(secrets.token_hex(32))
  # Use output for JWT_SECRET_KEY
  ```

- [ ] **Step 7.3:** Verify `.env` is in `.gitignore`
  ```bash
  grep -q "\.env" .gitignore || echo ".env" >> .gitignore
  ```

**Expected Result:** Environment variables properly configured, secrets secure.

---

### ✅ Task 8: Documentation

- [ ] **Step 8.1:** Document API endpoints in Swagger
  - All endpoints should have clear descriptions
  - Request/response examples should be accurate
  - Already done in code via docstrings

- [ ] **Step 8.2:** Create `.env.example` file
  ```bash
  cp backend/.env backend/.env.example
  # Remove actual secrets from .env.example
  ```

- [ ] **Step 8.3:** Update README with auth setup instructions
  - How to set up environment variables
  - How to run migrations
  - How to test authentication

**Expected Result:** Complete documentation for auth setup.

---

## 🔍 Verification Protocol

After completing all tasks, perform final verification:

### Security Checklist
- [ ] ✅ Passwords are hashed with bcrypt (never stored plain)
- [ ] ✅ JWT tokens have correct expiration times
- [ ] ✅ Rate limiting is active on all auth endpoints
- [ ] ✅ Email verification is required before login
- [ ] ✅ Password reset tokens expire after 1 hour
- [ ] ✅ password_hash is never exposed in API responses
- [ ] ✅ Verification and reset tokens are single-use
- [ ] ✅ Environment variables are in `.gitignore`

### Functionality Checklist
- [ ] ✅ User can register successfully
- [ ] ✅ Verification email is sent/simulated
- [ ] ✅ User can verify email
- [ ] ✅ User can login after verification
- [ ] ✅ User receives access and refresh tokens
- [ ] ✅ User can access protected routes with token
- [ ] ✅ User can refresh access token
- [ ] ✅ User can request password reset
- [ ] ✅ User can reset password with token
- [ ] ✅ Rate limiting prevents brute force

### Error Handling Checklist
- [ ] ✅ Duplicate email returns 400 Bad Request
- [ ] ✅ Weak password returns 400 with clear message
- [ ] ✅ Wrong credentials return 401 Unauthorized
- [ ] ✅ Unverified email blocks login with 403 Forbidden
- [ ] ✅ Invalid token returns 400/401 with clear message
- [ ] ✅ Expired token returns appropriate error
- [ ] ✅ Rate limit exceeded returns 429 Too Many Requests

---

## 🚀 Production Readiness Checklist

Before deploying to production:

### Environment Configuration
- [ ] Generate secure `JWT_SECRET_KEY` (minimum 32 bytes)
- [ ] Set up Resend API account and get `RESEND_API_KEY`
- [ ] Configure production `FROM_EMAIL` with verified domain
- [ ] Set production `FRONTEND_URL`
- [ ] Set up Redis for distributed rate limiting
- [ ] Configure production `DATABASE_URL`

### Security Hardening
- [ ] Review and adjust rate limits for production traffic
- [ ] Enable HTTPS (JWT tokens should only be sent over HTTPS)
- [ ] Configure CORS to allow only production domains
- [ ] Set up monitoring for failed login attempts
- [ ] Implement token blacklisting (optional, requires Redis)
- [ ] Add security headers (CSP, HSTS, etc.)

### Database
- [ ] Run migrations on production database
- [ ] Verify unique constraints on `email` field
- [ ] Set up database backups
- [ ] Create indexes for performance (email already indexed)

### Monitoring
- [ ] Set up logging for authentication events
- [ ] Monitor rate limit violations
- [ ] Track registration/login metrics
- [ ] Alert on authentication failures

---

## ⚠️ Known Limitations & Future Enhancements

### Current Limitations
1. **JWT Logout:** Client-side only (tokens valid until expiration)
   - Enhancement: Implement Redis-based token blacklist

2. **Email Verification Expiration:** Verification tokens don't expire
   - Enhancement: Add `verification_token_expires` field to User model

3. **Account Lockout:** No automatic lockout after failed attempts
   - Enhancement: Implement account lockout after N failed attempts

4. **2FA:** Not implemented
   - Enhancement: Add TOTP-based 2FA support

5. **Session Management:** No session tracking
   - Enhancement: Track active sessions in Redis

### Future Enhancements (Phase 10+)
- [ ] Social login (Google OAuth)
- [ ] Magic link authentication (passwordless)
- [ ] Two-factor authentication (2FA)
- [ ] Account deletion with data export
- [ ] Session management and revocation
- [ ] Audit log for security events

---

## 📊 Success Criteria

Phase 9A Backend is **COMPLETE** when:

1. ✅ All verification tasks pass (Tasks 1-8)
2. ✅ All security checklist items verified
3. ✅ All functionality checklist items pass
4. ✅ All error handling works correctly
5. ✅ Integration tests pass
6. ✅ Documentation complete
7. ✅ Environment variables configured
8. ✅ Production readiness checklist complete

---

## 📝 Testing Script Template

Create `backend/test_auth.py` for automated testing:

```python
"""
Automated Auth Testing Script
Run with: python backend/test_auth.py
"""

import requests
import time

BASE_URL = "http://localhost:8001"

def test_registration():
    """Test user registration"""
    response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": f"test_{int(time.time())}@example.com",
        "password": "SecureP@ss123",
        "name": "Test User"
    })
    assert response.status_code == 200
    assert "message" in response.json()
    print("✓ Registration successful")
    return response.json()

def test_login(email, password):
    """Test user login"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert response.status_code in [200, 403]  # 403 if not verified
    print(f"✓ Login attempt: {response.status_code}")
    return response.json() if response.status_code == 200 else None

def test_get_me(access_token):
    """Test get current user"""
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    user = response.json()
    assert "email" in user
    assert "password_hash" not in user
    print("✓ Get current user successful")
    return user

if __name__ == "__main__":
    print("Starting auth tests...")

    # Test registration
    reg_result = test_registration()

    # Note: Email verification would need to be done manually
    # or by querying the database for the verification token

    print("\nAll tests passed! ✓")
```

---

## 🎯 Next Steps After Phase 9A Backend

Once backend auth is complete and verified:

1. **Phase 9A Frontend** (Separate plan)
   - Create login/register pages
   - Implement auth context in React
   - Build protected route wrapper
   - Create token storage logic
   - Build email verification page
   - Build password reset pages

2. **Phase 9C: Production Infrastructure**
   - Deploy backend to Railway/Render
   - Set up production database
   - Configure production email service
   - Set up Redis for rate limiting
   - Configure environment variables

---

**Ready to Execute?** Start with Task 1 (User Model Verification) and work through the checklist systematically.

---

*Document prepared for Phase 9A Backend execution. All infrastructure exists - focus on verification and testing.*
