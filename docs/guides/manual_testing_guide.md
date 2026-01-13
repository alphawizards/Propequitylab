# Phase 9A: Manual Testing Guide (Authentication)

Use this guide to verify that the new Authentication system (Backend + Frontend) is working correctly.

## 1. Environment Setup

### Terminal 1: Start Backend
```powershell
cd backend
# Make sure your virtual environment is active if applicable
uvicorn server:app --reload --port 8000
```

### Terminal 2: Start Frontend
```powershell
cd frontend
npm start
```

---

## 2. Test Scenarios

### ✅ Test Case 1: Database Migration / Setup
**Goal:** Ensure the new User table fields exist.
1. Inspect your database (or check logs during backend startup).
2. `server.py` should log: `✅ Database tables verified/created`.

### ✅ Test Case 2: New User Registration
**Goal:** Verify a user can sign up and receives a token.
1. Go to `http://localhost:3000/register`.
2. Enter valid details:
   - Name: `Test User`
   - Email: `test@example.com` (Use a fresh email or clear DB)
   - Password: `Password123!`
3. Click **Register**.
4. **Expected:**
   - Redirected to Dashboard (or Verification page/Login depending on flow).
   - Toast notification: "Registration successful".
   - Check Backend Logs: Should see `POST /api/auth/register 200`.

### ✅ Test Case 3: Login
**Goal:** Verify login works and stores token.
1. Log out if currently logged in.
2. Go to `http://localhost:3000/login`.
3. Enter credentials from Test Case 2.
4. Click **Login**.
5. **Expected:**
   - Redirect to Dashboard.
   - **DevTools Check:** Open Application > Local Storage.
   - Look for `access_token` (or `token`). It should be present.

### ✅ Test Case 4: Protected Route Access
**Goal:** Verify data isolation and protection.
1. While logged in, navigate to `/finances/properties`.
2. **Expected:** Page loads.
3. **DevTools Check:** Open Network Tab.
   - Look for the request to `/api/properties/portfolio/{id}`.
   - Headers: Should see `Authorization: Bearer <token>`.

### ✅ Test Case 5: Persistence & Hydration
**Goal:** Verify staying logged in on refresh.
1. Refresh the page (F5).
2. **Expected:**
   - You should **NOT** be redirected to Login.
   - You should see your user profile data (e.g., Name) in the header/sidebar.

### ✅ Test Case 6: Logout
**Goal:** Verify logout clears state.
1. Click **Logout** in the UI.
2. **Expected:**
   - Redirect to `/login`.
   - Local Storage token should be removed.
3. Try to manually navigate to `/dashboard`.
   - **Expected:** Immediate redirect back to `/login`.

---

## 3. Troubleshooting
- **401 Unauthorized:** Check if the token in Local Storage matches the one expected by the backend.
- **CORS Errors:** Ensure `server.py` has `http://localhost:3000` in `allow_origins`.
- **Database Errors:** You may need to reset your local SQLite/Postgres DB if schema changes conflicts with old data.
