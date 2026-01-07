# Phase 9A: Frontend Authentication Implementation Plan

**Date:** 2026-01-07
**Status:** 🔴 **NOT STARTED** (Backend Complete, Frontend Pending)
**Phase:** 9A - Authentication & User Management (Frontend Integration)

---

## 🎯 Objective

Replace the mock user system with real JWT-based authentication that connects the frontend to the secured backend.

**Current State:**
- ✅ Backend auth endpoints complete ([backend/routes/auth.py](backend/routes/auth.py))
- ✅ API client with token refresh interceptor ([frontend/src/services/api.js](frontend/src/services/api.js))
- ✅ ProtectedRoute component exists ([frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx))
- ✅ Register.jsx already calls `useAuth().register` ([frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx))
- ❌ **AuthContext.jsx is MISSING** (imported but doesn't exist)
- ❌ Login.jsx uses mock authentication ([frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx))

---

## 🔒 Critical Security Rules - Read First

### Rule 1: Secure Token Storage
- **ALWAYS** store JWT tokens in `localStorage` (not sessionStorage or cookies for this app)
- **ALWAYS** check for token presence before making authenticated requests
- **NEVER** expose tokens in URLs, console logs, or error messages

### Rule 2: Authentication State Hydration
- **ALWAYS** check for stored token on app load (`useEffect` in AuthProvider)
- **ALWAYS** validate token by calling `GET /api/auth/me` to hydrate user state
- **NEVER** trust token presence alone - always verify with backend

### Rule 3: Logout Cleanup
- **ALWAYS** clear tokens from localStorage on logout
- **ALWAYS** clear user state and reset contexts
- **ALWAYS** redirect to `/login` after logout

### Rule 4: Error Handling
- **ALWAYS** show user-friendly error messages ("Invalid credentials", not raw API errors)
- **ALWAYS** handle network errors gracefully
- **NEVER** expose backend error details to users

### Rule 5: Protected Route Security
- **ALWAYS** show loading state while checking authentication
- **ALWAYS** redirect unauthenticated users to `/login`
- **ALWAYS** preserve intended destination for post-login redirect

---

## 📋 Implementation Checklist

### Task 1: Create AuthContext.jsx ⚠️ CRITICAL

**File:** `frontend/src/context/AuthContext.jsx`

**Status:** 🔴 Does not exist (but is imported in App.js, Register.jsx, ProtectedRoute.jsx, UserContext.jsx)

#### Step 1.1: Create the AuthContext file

**Location:** `frontend/src/context/AuthContext.jsx`

**Dependencies:**
- React (useState, useEffect, useContext, createContext)
- api.js functions: `login`, `register`, `logout`, `getProfile`

#### Step 1.2: Implement AuthProvider component

**Required State:**
```javascript
const [user, setUser] = useState(null)           // User object from backend
const [isAuthenticated, setIsAuthenticated] = useState(false)  // Auth status
const [loading, setLoading] = useState(true)     // Loading state for initial check
```

#### Step 1.3: Implement authentication initialization (useEffect)

**Pattern:**
```javascript
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      // Verify token is valid by fetching user profile
      const userData = await getProfile()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  initAuth()
}, [])
```

**🔒 Security Alert:** This is CRITICAL for security. Without this check, the app won't verify tokens on reload.

#### Step 1.4: Implement login function

**Pattern:**
```javascript
const handleLogin = async (email, password) => {
  try {
    setLoading(true)
    const data = await login(email, password)  // Calls api.js login()

    setUser(data.user)
    setIsAuthenticated(true)

    return { success: true }
  } catch (error) {
    // Extract user-friendly error message
    const message = error.response?.data?.detail || 'Invalid email or password'
    return { success: false, error: message }
  } finally {
    setLoading(false)
  }
}
```

**Error Handling:** Return `{ success, error }` object for UI feedback

#### Step 1.5: Implement register function

**Pattern:**
```javascript
const handleRegister = async (userData) => {
  try {
    setLoading(true)
    const data = await register(userData)  // Calls api.js register()

    setUser(data.user)
    setIsAuthenticated(true)

    return { success: true }
  } catch (error) {
    const message = error.response?.data?.detail || 'Registration failed'
    return { success: false, error: message }
  } finally {
    setLoading(false)
  }
}
```

#### Step 1.6: Implement logout function

**Pattern:**
```javascript
const handleLogout = async () => {
  try {
    await logout()  // Calls api.js logout() (clears tokens)
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Always clear state regardless of API call success
    setUser(null)
    setIsAuthenticated(false)
  }
}
```

**🔒 Security Alert:** Always clear state even if API call fails

#### Step 1.7: Create context value object

**Pattern:**
```javascript
const value = {
  user,
  isAuthenticated,
  loading,
  login: handleLogin,
  register: handleRegister,
  logout: handleLogout,
}
```

#### Step 1.8: Export useAuth hook

**Pattern:**
```javascript
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

**Verification:**
- [ ] File created at `frontend/src/context/AuthContext.jsx`
- [ ] AuthProvider component exports AuthContext.Provider
- [ ] useAuth hook throws error if used outside provider
- [ ] Initial auth check runs on mount (useEffect)
- [ ] All functions return `{ success, error }` format
- [ ] Tokens stored/cleared correctly in localStorage

---

### Task 2: Update Login.jsx ⚠️ REQUIRED

**File:** `frontend/src/pages/Login.jsx`

**Current State:** Uses mock authentication with `onLogin` prop (lines 8, 17)

**Required Changes:**

#### Step 2.1: Remove mock authentication

**Before (Line 8):**
```javascript
const Login = ({ onLogin }) => {
```

**After:**
```javascript
const Login = () => {
```

#### Step 2.2: Add useAuth hook

**Add after imports:**
```javascript
import { useAuth } from '../context/AuthContext';

// Inside component:
const { login } = useAuth();
```

#### Step 2.3: Update handleSubmit function

**Before (Lines 14-22):**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (email && password) {
    onLogin({ email, name: email.split('@')[0] });
    navigate('/dashboard');
  } else {
    setError('Please enter email and password');
  }
};
```

**After:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Please enter email and password');
    return;
  }

  const result = await login(email, password);

  if (result.success) {
    // AuthContext handles user state
    // Navigate to intended destination or dashboard
    navigate('/dashboard');
  } else {
    setError(result.error);
  }
};
```

#### Step 2.4: Add loading state (optional)

**Pattern:**
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  // ... validation
  setLoading(true);
  const result = await login(email, password);
  setLoading(false);
  // ... handle result
};

// Update button:
<Button type="submit" disabled={loading}>
  {loading ? 'Signing In...' : 'Sign In'}
</Button>
```

**Verification:**
- [ ] Removed `onLogin` prop
- [ ] Added `useAuth` hook import
- [ ] `handleSubmit` is async and calls `login(email, password)`
- [ ] Errors displayed from `result.error`
- [ ] Navigation to `/dashboard` on success
- [ ] Optional: Loading state with disabled button

---

### Task 3: Verify Register.jsx ✅ ALREADY DONE

**File:** `frontend/src/pages/Register.jsx`

**Current State:**
- ✅ Already imports `useAuth` (line 3)
- ✅ Already calls `register()` function (line 12, 107)
- ✅ Already handles success/error (lines 109-114)
- ✅ Already validates form data (lines 39-70)

**Action Required:** ✅ **NONE** - Register.jsx is already correctly implemented!

**Verification:**
- [✅] Imports `useAuth` from AuthContext
- [✅] Calls `await register(registrationData)`
- [✅] Handles `result.success` and `result.error`
- [✅] Navigates to `/dashboard` on success
- [✅] Displays errors in UI

---

### Task 4: Verify ProtectedRoute.jsx ✅ ALREADY DONE

**File:** `frontend/src/components/ProtectedRoute.jsx`

**Current State:**
- ✅ Already imports `useAuth` (line 3)
- ✅ Already checks `isAuthenticated` and `loading` (line 13)
- ✅ Already shows loading spinner (lines 17-26)
- ✅ Already redirects to `/login` if not authenticated (lines 29-31)
- ✅ Already preserves intended destination (line 31)

**Action Required:** ✅ **NONE** - ProtectedRoute.jsx is already correctly implemented!

**Verification:**
- [✅] Imports `useAuth` hook
- [✅] Destructures `isAuthenticated` and `loading`
- [✅] Shows spinner while `loading === true`
- [✅] Redirects to `/login` with `state={{ from: location }}`
- [✅] Renders `children` when authenticated

---

### Task 5: Verify App.js Routing ✅ ALREADY DONE

**File:** `frontend/src/App.js`

**Current State:**
- ✅ AuthProvider wraps entire app (line 116)
- ✅ UserProvider nested inside AuthProvider (line 117)
- ✅ ProtectedRoute wraps protected routes (lines 76-80, 83-86)
- ✅ Public routes for `/login` and `/register` (lines 69-70)
- ✅ RootRedirect component handles auth flow (lines 34-62)

**Action Required:** ✅ **NONE** - App.js routing is already correctly configured!

**Verification:**
- [✅] Provider hierarchy: ThemeProvider → AuthProvider → UserProvider → PortfolioProvider
- [✅] Public routes accessible without auth
- [✅] Protected routes wrapped in ProtectedRoute
- [✅] RootRedirect checks auth and onboarding status

---

### Task 6: Update UserContext.jsx ✅ ALREADY DONE

**File:** `frontend/src/context/UserContext.jsx`

**Current State:**
- ✅ Already imports `useAuth` (line 3)
- ✅ Already gets `user` from AuthContext (line 8)
- ✅ Already syncs with `authUser` (lines 17-21)
- ✅ Already checks `isAuthenticated` (line 26)

**Action Required:** ✅ **NONE** - UserContext.jsx is already correctly integrated!

**Verification:**
- [✅] Imports and uses `useAuth` hook
- [✅] Syncs with AuthContext user state
- [✅] Fetches onboarding status when authenticated
- [✅] Provides user data to child components

---

### Task 7: Verify API Client ✅ ALREADY DONE

**File:** `frontend/src/services/api.js`

**Current State:**
- ✅ Axios instance configured (lines 31-37)
- ✅ Request interceptor adds Bearer token (lines 40-49)
- ✅ Response interceptor handles 401 with token refresh (lines 52-126)
- ✅ Token refresh queue prevents race conditions (lines 10-28)
- ✅ Auth functions: `login`, `register`, `logout`, `getProfile` (lines 132-198)

**Action Required:** ✅ **NONE** - API client is production-ready!

**Verification:**
- [✅] Bearer token added to all requests
- [✅] 401 errors trigger token refresh
- [✅] Failed requests queued during refresh
- [✅] Redirect to `/login` on refresh failure
- [✅] Auth functions store tokens in localStorage

---

## 🧪 Testing & Verification

### Manual Testing Protocol

#### Test 1: Registration Flow
1. Navigate to `/register`
2. Fill form with valid data
3. Submit registration
4. **Expected:**
   - User created in database
   - Tokens stored in localStorage
   - User object in AuthContext state
   - Redirect to `/dashboard` or `/onboarding`

#### Test 2: Login Flow
1. Navigate to `/login`
2. Enter valid credentials
3. Submit login
4. **Expected:**
   - Tokens stored in localStorage
   - User object in AuthContext state
   - Redirect to `/dashboard`

#### Test 3: Invalid Credentials
1. Navigate to `/login`
2. Enter invalid email/password
3. Submit login
4. **Expected:**
   - Error message displayed: "Invalid email or password"
   - No navigation
   - No tokens stored

#### Test 4: Token Persistence
1. Login successfully
2. Refresh page (F5)
3. **Expected:**
   - User stays logged in
   - App calls `GET /api/auth/me`
   - User state hydrated from backend
   - No redirect to `/login`

#### Test 5: Token Expiration (Automatic Refresh)
1. Login successfully
2. Wait 30+ minutes (access token expires)
3. Make an authenticated request
4. **Expected:**
   - 401 received
   - Token refresh triggered automatically
   - Original request retried with new token
   - No user disruption

#### Test 6: Refresh Token Expiration
1. Login successfully
2. Manually delete `access_token` from localStorage
3. Wait 7+ days (refresh token expires) OR manually delete `refresh_token`
4. Refresh page
5. **Expected:**
   - Auth check fails
   - Redirect to `/login`
   - Tokens cleared from localStorage

#### Test 7: Logout Flow
1. Login successfully
2. Click logout button (if implemented)
3. **Expected:**
   - `POST /api/auth/logout` called
   - Tokens cleared from localStorage
   - User state cleared
   - Redirect to `/login`

#### Test 8: Protected Routes
1. Without logging in, navigate to `/dashboard`
2. **Expected:**
   - Immediate redirect to `/login`
   - Location saved for post-login redirect

#### Test 9: Onboarding Flow Integration
1. Register new account
2. **Expected:**
   - Redirect to `/onboarding` (if not completed)
   - Complete onboarding steps
   - After completion, redirect to `/dashboard`

---

### Automated Testing Scripts

#### Script 1: Auth Context Tests

**File:** `frontend/src/context/__tests__/AuthContext.test.jsx`

```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('hydrates user from token on mount', async () => {
    localStorage.setItem('access_token', 'mock-token');
    api.getProfile.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.email).toBe('test@example.com');
    });
  });

  it('logs in successfully', async () => {
    api.login.mockResolvedValue({
      access_token: 'token-123',
      refresh_token: 'refresh-123',
      user: { id: 'user-1', email: 'test@example.com' },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    let response;
    await act(async () => {
      response = await result.current.login('test@example.com', 'password');
    });

    expect(response.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('access_token')).toBe('token-123');
  });

  it('handles login error', async () => {
    api.login.mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    let response;
    await act(async () => {
      response = await result.current.login('test@example.com', 'wrong');
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs out successfully', async () => {
    // Setup authenticated state
    localStorage.setItem('access_token', 'token-123');
    api.logout.mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(localStorage.getItem('access_token')).toBe(null);
  });
});
```

#### Script 2: Integration Test (Cypress/Playwright)

**File:** `frontend/cypress/e2e/auth.cy.js`

```javascript
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('redirects to login when not authenticated', () => {
    cy.url().should('include', '/login');
  });

  it('registers new user', () => {
    cy.visit('/register');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!@#');
    cy.get('input[name="confirmPassword"]').type('Password123!@#');

    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard or onboarding
    cy.url().should('match', /\/(dashboard|onboarding)/);

    // Token should be stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.exist;
    });
  });

  it('logs in existing user', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('Password123!@#');

    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');

    // Token should be stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.exist;
    });
  });

  it('persists auth state on reload', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('Password123!@#');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Reload page
    cy.reload();

    // Should stay on dashboard (not redirect to login)
    cy.url().should('include', '/dashboard');
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');

    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains('Invalid').should('be.visible');

    // Should NOT navigate
    cy.url().should('include', '/login');
  });
});
```

---

## 🚀 Production Readiness Checklist

### Security ✅
- [ ] Tokens stored securely in localStorage
- [ ] Auth state hydrated from backend on app load
- [ ] 401 errors trigger automatic token refresh
- [ ] Refresh token failure redirects to login
- [ ] Protected routes block unauthenticated access
- [ ] No tokens exposed in console logs or errors

### User Experience ✅
- [ ] Loading states shown during auth operations
- [ ] User-friendly error messages displayed
- [ ] Intended destination preserved after login
- [ ] Logout clears all state and redirects
- [ ] Onboarding flow integrated with auth

### Code Quality ✅
- [ ] AuthContext follows React best practices
- [ ] All components use `useAuth` hook consistently
- [ ] Error handling comprehensive
- [ ] No prop drilling (all via context)

### Testing ✅
- [ ] Unit tests for AuthContext functions
- [ ] Integration tests for login/register/logout
- [ ] E2E tests for complete auth flows
- [ ] Token refresh tested manually

---

## 📊 Implementation Summary

### Files to Create (1)
1. ✅ **`frontend/src/context/AuthContext.jsx`** - JWT authentication context

### Files to Modify (1)
1. ✅ **`frontend/src/pages/Login.jsx`** - Replace mock auth with real auth

### Files Already Complete (5)
1. ✅ `frontend/src/pages/Register.jsx` - Already uses useAuth
2. ✅ `frontend/src/components/ProtectedRoute.jsx` - Already uses useAuth
3. ✅ `frontend/src/App.js` - Routing already configured
4. ✅ `frontend/src/context/UserContext.jsx` - Already integrates with AuthContext
5. ✅ `frontend/src/services/api.js` - Token refresh already implemented

### Estimated Effort
- **AuthContext.jsx:** 1-2 hours (create + test)
- **Login.jsx update:** 30 minutes
- **Manual testing:** 1 hour
- **Total:** 2.5-3.5 hours

---

## 🎯 Definition of Done

Phase 9A Frontend is complete when:

1. ✅ `AuthContext.jsx` created with all required functions
2. ✅ `Login.jsx` updated to use real authentication
3. ✅ Users can register and receive JWT tokens
4. ✅ Users can login and receive JWT tokens
5. ✅ Users can logout and tokens are cleared
6. ✅ Token persists across page reloads
7. ✅ Token refresh works automatically on 401 errors
8. ✅ Protected routes redirect to login when unauthenticated
9. ✅ All manual tests pass
10. ✅ No console errors related to authentication

---

## ⏭️ Next Steps After Completion

**Phase 9B Frontend:** Email Verification Flow
- Add email verification UI
- Resend verification email
- Handle verification link clicks
- Show verification status in UI

**Phase 9C:** Production Deployment
- Deploy backend to Railway/Render
- Deploy frontend to Vercel
- Configure environment variables
- Test production auth flow

---

## 📚 Reference Documentation

### Backend Auth Endpoints (Already Implemented)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Related Files
- Backend: [backend/routes/auth.py](backend/routes/auth.py)
- Backend: [backend/utils/auth.py](backend/utils/auth.py)
- Frontend: [frontend/src/services/api.js](frontend/src/services/api.js)
- Frontend: [frontend/src/App.js](frontend/src/App.js)
- Documentation: [PHASE_9A_BACKEND_IMPLEMENTATION_PLAN.md](PHASE_9A_BACKEND_IMPLEMENTATION_PLAN.md)

---

**Plan Created By:** Claude Sonnet 4.5
**Plan Date:** 2026-01-07
**Status:** ✅ Ready for Implementation

---

*End of Phase 9A Frontend Implementation Plan*
