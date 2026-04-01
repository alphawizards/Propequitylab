# Clerk Full Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom JWT auth system with Clerk for identity management while keeping our PostgreSQL DB as the source of truth for user profiles and subscription tiers.

**Architecture:** Clerk handles authentication (sign-up, sign-in, sessions, MFA, password reset). On first sign-up, a Clerk webhook fires `user.created` → our backend creates a `User` row in Postgres with `subscription_tier = "free"`. All API requests use Clerk session tokens (JWTs signed by Clerk's RS256 key); `get_current_user` verifies them via Clerk's JWKS endpoint, then looks up the user by `clerk_user_id`. Existing users without `clerk_user_id` continue working via the old JWT path (graceful migration).

**Tech Stack:** `@clerk/clerk-react` v5 (frontend), `svix` (webhook verification), `PyJWT` (already installed, used for JWKS verification), Alembic (DB migration)

---

## File Map

### Backend — Create
- `backend/utils/clerk_auth.py` — Clerk JWT verification via JWKS, user lookup by `clerk_user_id`
- `backend/routes/webhooks.py` — Clerk webhook handler (`user.created`, `user.deleted`)
- `backend/alembic/versions/xxxx_add_clerk_user_id.py` — add `clerk_user_id` nullable column

### Backend — Modify
- `backend/models/user.py` — add `clerk_user_id: Optional[str]`, make `password_hash` optional
- `backend/utils/auth.py` — `get_current_user`: try Clerk JWT first, fall back to old JWT
- `backend/server.py` — mount `/api/webhooks` router (must be BEFORE auth middleware)
- `backend/requirements.txt` — add `svix>=1.0.0`

### Frontend — Modify
- `frontend/src/App.js` — wrap with `ClerkProvider`
- `frontend/src/context/AuthContext.jsx` — thin wrapper around Clerk's `useUser`/`useAuth`; keep same `{ user, isAuthenticated, loading, login, logout }` API
- `frontend/src/services/api.js` — replace `localStorage` token with a `setClerkTokenGetter()` pattern; request interceptor calls `getToken()` async
- `frontend/src/pages/Login.jsx` — replace `apiLogin` call with Clerk's `useSignIn()` hook
- `frontend/src/pages/Register.jsx` — replace `apiRegister` call with Clerk's `useSignUp()` hook

### Environment Variables Needed
**Backend `.env`:**
```
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
```
**Frontend `.env`:**
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## Task 1: Add `clerk_user_id` to User model + migration

**Files:**
- Modify: `backend/models/user.py`
- Create: `backend/alembic/versions/xxxx_add_clerk_user_id.py`

- [ ] **Step 1: Update User model**

In `backend/models/user.py`, change the `password_hash` field to optional and add `clerk_user_id`:

```python
# Authentication
email: str = Field(unique=True, index=True, max_length=255)
password_hash: Optional[str] = Field(default=None, max_length=255)  # Optional for Clerk users
is_verified: bool = Field(default=True)  # Clerk verifies email for us

# Clerk Integration
clerk_user_id: Optional[str] = Field(default=None, unique=True, index=True, max_length=255)
```

Also update `UserCreate` — make `password` optional:
```python
class UserCreate(SQLModel):
    email: EmailStr
    name: str
    password: Optional[str] = None
    clerk_user_id: Optional[str] = None
    date_of_birth: Optional[str] = None
    planning_type: str = "individual"
    country: str = "Australia"
    state: str = "NSW"
    currency: str = "AUD"
```

- [ ] **Step 2: Generate Alembic migration**

```bash
cd backend
source venv/Scripts/activate
alembic revision --autogenerate -m "add_clerk_user_id_to_users"
```

Review the generated file — confirm it adds `clerk_user_id VARCHAR(255) UNIQUE` and makes `password_hash` nullable.

- [ ] **Step 3: Apply migration**

```bash
alembic upgrade head
```

Expected output: `Running upgrade ... -> xxxx, add_clerk_user_id_to_users`

- [ ] **Step 4: Commit**

```bash
git add backend/models/user.py backend/alembic/versions/
git commit -m "feat(auth): add clerk_user_id to User model, make password_hash optional"
```

---

## Task 2: Backend — Clerk JWT verification utility

**Files:**
- Create: `backend/utils/clerk_auth.py`

- [ ] **Step 1: Install svix**

```bash
cd backend && pip install svix>=1.0.0
```

Add to `requirements.txt`:
```
svix>=1.0.0
```

- [ ] **Step 2: Create `backend/utils/clerk_auth.py`**

```python
"""
Clerk Authentication Utilities
Verifies Clerk session JWTs using Clerk's JWKS endpoint.
"""

import os
import logging
from typing import Optional
from functools import lru_cache

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
from sqlmodel import Session, select

from models.user import User

logger = logging.getLogger(__name__)

CLERK_FRONTEND_API_URL = os.getenv("CLERK_FRONTEND_API_URL", "")
_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> PyJWKClient:
    """Return a cached JWKS client for Clerk's public keys."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{CLERK_FRONTEND_API_URL}/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def verify_clerk_token(token: str) -> Optional[dict]:
    """
    Verify a Clerk session JWT and return its payload.

    Args:
        token: Raw Bearer token from Authorization header

    Returns:
        Decoded JWT payload dict, or None if invalid
    """
    try:
        client = _get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_exp": True},
        )
        return payload
    except Exception as e:
        logger.debug(f"Clerk token verification failed: {e}")
        return None


def get_user_by_clerk_id(session: Session, clerk_user_id: str) -> Optional[User]:
    """Look up a User by their Clerk user ID."""
    return session.exec(
        select(User).where(
            User.clerk_user_id == clerk_user_id,
            User.is_active == True,
        )
    ).first()


def create_user_from_clerk(
    session: Session,
    clerk_user_id: str,
    email: str,
    name: str,
) -> User:
    """
    Create a new User record from a Clerk user.
    Used by the webhook handler when user.created fires.

    Args:
        session: DB session
        clerk_user_id: Clerk's user ID (e.g. "user_2abc...")
        email: User's primary email from Clerk
        name: User's full name from Clerk

    Returns:
        Newly created User
    """
    import uuid
    user = User(
        id=str(uuid.uuid4()),
        clerk_user_id=clerk_user_id,
        email=email,
        password_hash=None,
        name=name or email.split("@")[0],
        is_verified=True,        # Clerk verifies email
        subscription_tier="free",
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    logger.info(f"Created user {user.id} for Clerk ID {clerk_user_id}")
    return user
```

- [ ] **Step 3: Commit**

```bash
git add backend/utils/clerk_auth.py backend/requirements.txt
git commit -m "feat(auth): add Clerk JWT verification utility with JWKS"
```

---

## Task 3: Backend — Clerk webhook handler

**Files:**
- Create: `backend/routes/webhooks.py`

- [ ] **Step 1: Create `backend/routes/webhooks.py`**

```python
"""
Clerk Webhook Handler
Receives and verifies Clerk events to sync users into our PostgreSQL database.

Supported events:
- user.created  → create User row with subscription_tier="free"
- user.deleted  → soft-delete User (set is_active=False, deleted_at=now)
"""

import os
import logging
from datetime import datetime

from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlmodel import Session, select
from svix.webhooks import Webhook, WebhookVerificationError

from models.user import User
from utils.clerk_auth import create_user_from_clerk, get_user_by_clerk_id
from utils.database_sql import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET", "")


@router.post("/clerk")
async def clerk_webhook(request: Request, session: Session = Depends(get_session)):
    """
    Receive and process Clerk webhook events.

    Verifies the svix signature before processing any event.
    Returns 200 immediately for unknown event types (idempotent).
    """
    if not CLERK_WEBHOOK_SECRET:
        logger.error("CLERK_WEBHOOK_SECRET not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured",
        )

    # Read raw body for signature verification
    body = await request.body()
    headers = {
        "svix-id": request.headers.get("svix-id", ""),
        "svix-timestamp": request.headers.get("svix-timestamp", ""),
        "svix-signature": request.headers.get("svix-signature", ""),
    }

    # Verify signature
    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        event = wh.verify(body, headers)
    except WebhookVerificationError as e:
        logger.warning(f"Clerk webhook verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )

    event_type = event.get("type")
    data = event.get("data", {})

    logger.info(f"Clerk webhook received: {event_type}")

    if event_type == "user.created":
        _handle_user_created(session, data)
    elif event_type == "user.deleted":
        _handle_user_deleted(session, data)
    else:
        logger.debug(f"Unhandled Clerk event type: {event_type}")

    return {"status": "ok"}


def _handle_user_created(session: Session, data: dict) -> None:
    """Create a User in our DB when Clerk fires user.created."""
    clerk_user_id = data.get("id")
    if not clerk_user_id:
        logger.error("user.created event missing user ID")
        return

    # Idempotency — skip if already exists
    existing = get_user_by_clerk_id(session, clerk_user_id)
    if existing:
        logger.info(f"User already exists for Clerk ID {clerk_user_id}, skipping")
        return

    # Extract primary email
    email_addresses = data.get("email_addresses", [])
    primary_email_id = data.get("primary_email_address_id")
    email = ""
    for ea in email_addresses:
        if ea.get("id") == primary_email_id:
            email = ea.get("email_address", "")
            break
    if not email and email_addresses:
        email = email_addresses[0].get("email_address", "")

    # Extract name
    first = data.get("first_name") or ""
    last = data.get("last_name") or ""
    name = f"{first} {last}".strip() or email.split("@")[0]

    create_user_from_clerk(session, clerk_user_id, email, name)


def _handle_user_deleted(session: Session, data: dict) -> None:
    """Soft-delete a User when Clerk fires user.deleted."""
    clerk_user_id = data.get("id")
    if not clerk_user_id:
        return

    user = get_user_by_clerk_id(session, clerk_user_id)
    if not user:
        logger.info(f"No user found for Clerk ID {clerk_user_id}, nothing to delete")
        return

    user.is_active = False
    user.deleted_at = datetime.utcnow()
    session.add(user)
    session.commit()
    logger.info(f"Soft-deleted user {user.id} (Clerk ID {clerk_user_id})")
```

- [ ] **Step 2: Commit**

```bash
git add backend/routes/webhooks.py
git commit -m "feat(auth): add Clerk webhook handler for user.created and user.deleted"
```

---

## Task 4: Backend — Update `get_current_user` + mount webhook router

**Files:**
- Modify: `backend/utils/auth.py` (lines ~200–280, `get_current_user` function)
- Modify: `backend/server.py`

- [ ] **Step 1: Update `get_current_user` in `backend/utils/auth.py`**

Add import at top of file:
```python
from utils.clerk_auth import verify_clerk_token, get_user_by_clerk_id
```

Replace the existing `get_current_user` function:
```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    Authenticate the current user from a Bearer token.

    Tries Clerk JWT first (RS256, has 'azp' claim).
    Falls back to legacy custom JWT (HS256) for backward compatibility.
    Raises 401 if neither validates.
    """
    token = credentials.credentials

    # --- Attempt 1: Clerk JWT ---
    clerk_payload = verify_clerk_token(token)
    if clerk_payload:
        clerk_user_id = clerk_payload.get("sub")
        if clerk_user_id:
            user = get_user_by_clerk_id(session, clerk_user_id)
            if user and user.is_active:
                return user
            # Clerk user exists in Clerk but not yet in our DB (race condition with webhook)
            # Return 401 — client should retry after webhook processes
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found. Please wait a moment and try again.",
            )

    # --- Attempt 2: Legacy custom JWT (backward compat) ---
    payload = verify_token(token, token_type="access")
    if payload:
        user_id = payload.get("sub")
        if user_id:
            user = get_user_by_id(session, user_id)
            if user and user.is_active:
                return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
```

- [ ] **Step 2: Mount webhook router in `backend/server.py`**

Add import near other router imports:
```python
from routes.webhooks import router as webhooks_router
```

Mount it BEFORE other routers (webhooks must not require auth):
```python
# Webhooks — no auth required, signature verified internally
app.include_router(webhooks_router, prefix="/api")
```

- [ ] **Step 3: Commit**

```bash
git add backend/utils/auth.py backend/server.py
git commit -m "feat(auth): get_current_user tries Clerk JWT first, falls back to legacy JWT"
```

---

## Task 5: Frontend — Add ClerkProvider to App.js

**Files:**
- Modify: `frontend/src/App.js`

- [ ] **Step 1: Add `REACT_APP_CLERK_PUBLISHABLE_KEY` to `frontend/.env`**

Add this line to `frontend/.env` (get the key from Clerk Dashboard → API Keys):
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_...
```

Also update `frontend/.env.example`:
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
```

- [ ] **Step 2: Wrap App with ClerkProvider**

In `frontend/src/App.js`, add the import:
```js
import { ClerkProvider } from '@clerk/clerk-react';
```

Wrap the outermost element in `App()`:
```jsx
function App() {
  const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <ThemeProvider>
          <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
            <HelmetProvider>
              <AuthProvider>
                <UserProvider>
                  <PortfolioProvider>
                    <div className="App">
                      <AppRoutes />
                      <WelcomeModalWrapper />
                      <Toaster />
                      <CookieBanner />
                    </div>
                  </PortfolioProvider>
                </UserProvider>
              </AuthProvider>
            </HelmetProvider>
          </Sentry.ErrorBoundary>
        </ThemeProvider>
      </BrowserRouter>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.js frontend/.env.example
git commit -m "feat(auth): add ClerkProvider to App root"
```

---

## Task 6: Frontend — Replace AuthContext with Clerk hooks

**Files:**
- Modify: `frontend/src/context/AuthContext.jsx`

This is the most critical change. We keep the **same exported API** (`user`, `isAuthenticated`, `loading`, `login`, `logout`) so zero other components need changing.

- [ ] **Step 1: Rewrite `frontend/src/context/AuthContext.jsx`**

```jsx
/**
 * AuthContext - Authentication State Management
 * Thin wrapper around Clerk's useUser/useAuth hooks.
 * Maintains the same { user, isAuthenticated, loading, login, logout } API
 * so all consuming components work without changes.
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { setClerkTokenGetter } from '../services/api';
import { setUserContext } from '../utils/sentry';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: userLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useAuth();

  // Wire Clerk's getToken into the API client so every request gets a fresh token
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  // Sync user context to Sentry when auth state changes
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setUserContext({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.fullName,
      });
    } else {
      setUserContext(null);
    }
  }, [isSignedIn, clerkUser]);

  // Map Clerk user to the shape the rest of the app expects
  const user = isSignedIn && clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    name: clerkUser.fullName || '',
    is_verified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
    // subscription_tier comes from our backend via UserContext (/api/auth/me)
  } : null;

  const logout = async () => {
    await signOut();
    setUserContext(null);
  };

  const value = {
    user,
    isAuthenticated: !!isSignedIn,
    loading: !userLoaded,
    logout,
    // login/register are handled directly in Login.jsx and Register.jsx via Clerk hooks
    // Kept as no-ops here for any legacy callers
    login: async () => ({ success: false, error: 'Use Login page' }),
    register: async () => ({ success: false, error: 'Use Register page' }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
```

**Note:** `useAuth` is re-exported from this file as a named export (same as before). The import `useAuth` in Clerk is used internally (aliased to avoid conflict).

Fix the naming conflict — rename the Clerk import:
```jsx
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
// ...
const { getToken, signOut } = useClerkAuth();
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/context/AuthContext.jsx
git commit -m "feat(auth): replace AuthContext JWT logic with Clerk hooks"
```

---

## Task 7: Frontend — Update api.js token getter

**Files:**
- Modify: `frontend/src/services/api.js`

The request interceptor must call Clerk's `getToken()` (async) instead of reading from localStorage.

- [ ] **Step 1: Add `setClerkTokenGetter` and update request interceptor**

At the top of `api.js`, after `import axios from 'axios'`, add:
```js
// Clerk token getter — set by AuthContext once Clerk is loaded
let _clerkTokenGetter = null;

/**
 * Called by AuthContext to wire in Clerk's getToken function.
 * @param {Function|null} getter - async function that returns a Clerk JWT
 */
export const setClerkTokenGetter = (getter) => {
  _clerkTokenGetter = getter;
};
```

Replace the existing request interceptor:
```js
// Request interceptor - Add Clerk token (preferred) or legacy localStorage token
apiClient.interceptors.request.use(
  async (config) => {
    // Try Clerk token first
    if (_clerkTokenGetter) {
      try {
        const token = await _clerkTokenGetter();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch (e) {
        console.warn('Failed to get Clerk token:', e.message);
      }
    }
    // Fall back to legacy localStorage token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

Also remove the response interceptor's token refresh logic (Clerk manages session refresh automatically). Simplify the 401 handler to just redirect to `/login`:
```js
// Response interceptor - Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/api.js
git commit -m "feat(auth): wire Clerk token getter into api.js request interceptor"
```

---

## Task 8: Frontend — Update Login.jsx to use Clerk's useSignIn hook

**Files:**
- Modify: `frontend/src/pages/Login.jsx`

Keep all the existing custom UI. Just replace the auth mechanism.

- [ ] **Step 1: Update Login.jsx**

Replace the import and auth call:
```jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoaded } = useSignIn();

  const successMessage = location.state?.message;
  const prefilledEmail = location.state?.email || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (!isLoaded) return;

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of JSX unchanged (form, inputs, button)
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "feat(auth): Login.jsx uses Clerk useSignIn hook"
```

---

## Task 9: Frontend — Update Register.jsx to use Clerk's useSignUp hook

**Files:**
- Modify: `frontend/src/pages/Register.jsx`

- [ ] **Step 1: Update Register.jsx**

Replace the auth imports and submission handler:
```jsx
import { useSignUp } from '@clerk/clerk-react';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, isLoaded } = useSignUp();

  // ... existing form state unchanged ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Redirect to login with success message
      navigate('/login', {
        state: {
          message: 'Account created! Check your email to verify your address.',
          email: formData.email,
        },
      });
    } catch (err) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Registration failed. Please try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of JSX unchanged ...
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Register.jsx
git commit -m "feat(auth): Register.jsx uses Clerk useSignUp hook"
```

---

## Task 10: Configure Clerk Webhook in Clerk Dashboard

This is a manual step — no code.

- [ ] **Step 1: Create webhook endpoint in Clerk Dashboard**

1. Go to **Clerk Dashboard → Webhooks → Add Endpoint**
2. URL: `https://api.propequitylab.com/api/webhooks/clerk`
3. Events to subscribe: `user.created`, `user.deleted`
4. Copy the **Signing Secret** (`whsec_...`)
5. Add to Railway env vars: `CLERK_WEBHOOK_SECRET=whsec_...`

- [ ] **Step 2: Add remaining env vars to Railway**

In Railway dashboard for the Propequitylab service, add:
```
CLERK_SECRET_KEY=sk_live_...
CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...
```

Get `CLERK_FRONTEND_API_URL` from Clerk Dashboard → API Keys → Frontend API URL.

- [ ] **Step 3: Add REACT_APP_CLERK_PUBLISHABLE_KEY to Cloudflare Pages**

In Cloudflare Pages → propequitylab → Settings → Environment Variables:
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## Task 11: Deploy and verify end-to-end

- [ ] **Step 1: Deploy backend**

```bash
git push origin main
```

CI/CD will deploy to Railway. Verify in Railway logs:
- `Starting up PropEquityLab API` — OK
- No import errors from `clerk_auth` or `webhooks` modules

- [ ] **Step 2: Build and deploy frontend**

```bash
cd frontend && npm run build
npx wrangler pages deploy build --project-name propequitylab
```

- [ ] **Step 3: Test webhook**

In Clerk Dashboard → Webhooks → your endpoint → Send test event (`user.created`).
Expected: Railway logs show `Created user <uuid> for Clerk ID user_test_...`

- [ ] **Step 4: Test full sign-up flow**

1. Go to `https://www.propequitylab.com/register`
2. Create a new account
3. Verify: Clerk Dashboard shows new user
4. Verify: Railway logs show `user.created` webhook received
5. Verify: Neon DB has a new row in `users` table with `clerk_user_id` set

- [ ] **Step 5: Test sign-in flow**

1. Go to `https://www.propequitylab.com/login`
2. Sign in with new account
3. Verify: dashboard loads, no 401 errors in console
4. Verify: API requests include Clerk Bearer token (check Network tab)

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat(auth): complete Clerk integration - sign-up, sign-in, webhooks, JWT verification"
git push origin main
```

---

## Tier System: How it Connects

After Clerk integration, the tier flow is:

1. User signs up → Clerk fires `user.created` → our DB creates `User` with `subscription_tier = "free"`
2. `GET /api/auth/me` returns `subscription_tier` → `UserContext` stores it
3. Components read `user.subscription_tier` from `UserContext` to gate features
4. To upgrade: update `subscription_tier` in our DB (hook into Stripe webhook or admin endpoint)

**Current tier gates:**
- `scenarios.py:check_scenario_limit` — free users blocked entirely, pro capped at 3
- `ScenarioListPanel` — accepts `userTier` prop (already wired)

**To extend tier gating to other features**, follow the pattern in `scenarios.py:check_scenario_limit`.
