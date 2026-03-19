# Debugging Log: Login Network Error
**Date:** 2026-01-25
**Status:** In Progress
**Incident:** User reports "Network Error" on Login.

## Phase 1: Root Cause Investigation (Gather Evidence)

We need to identify **exactly** which network request is failing and why. The "Network Error" message is a generic symptom.

### Step 1: Inspect the Network Request
1.  Open Chrome DevTools (**F12** or Right Click -> Inspect).
2.  Click on the **Network** tab.
3.  Attempt to **Login** again.
4.  Look for the **red failed request** in the list.
5.  **Click on it** and check these values:
    *   **Request URL:** (Is it `localhost:3000`, `localhost:8000`, or `api.propequitylab.com`?)
    *   **Status Code:** (Is it `404`, `500`, `0`, or `blocked`)?
    *   **Response:** Click the "Response" tab to see if there is a specific error message.

### Step 2: Verify API Reachability
Based on your earlier DNS settings, your API is at `api.propequitylab.com`.
1.  Try to visit this URL in your browser: `https://api.propequitylab.com/api/` (or `https://api.propequitylab.com/docs` if it's FastAPI).
2.  If this fails (e.g., Privacy Error, Not Found), your **API Domain** is not correctly linked to AWS API Gateway.

### Step 3: Check Cloudflare Environment Variables
If Step 1 shows the URL is `localhost:8000`, it means your Cloudflare Page doesn't know where your API is.
1.  Go to Cloudflare Dashboard -> Workers & Pages -> your project -> **Settings** -> **Environment Variables**.
2.  Check if `REACT_APP_API_URL` is defined.
3.  It should likely be: `https://api.propequitylab.com/api` (or the raw AWS URL `https://d-dxexjp5hbx.execute-api...` if the custom domain isn't fully set up on AWS).

## Phase 2: Hypothesis & Solution

| Evidence found in Step 1 | Likely Root Cause | Solution |
| :--- | :--- | :--- |
| URL is `localhost:8000` | **Missing Env Var**. The build defaulted to localhost. | Add `REACT_APP_API_URL` to Cloudflare and **rebuild**. |
| URL is `api.propequitylab.com` & SSL Error | **SSL/Cert Mismatch**. Cloudflare is Proxied (Orange) but AWS doesn't have the cert. | Set `api` DNS to "DNS Only" (Grey Cloud) temporarily OR configure Custom Domain in AWS API Gateway. |
| URL is `api.propequitylab.com` & 404/502 | **API Gateway Path**. The `/api` prefix might be doubled or missing. | Check if AWS expects `/dev`, `/prod`, or `/v1` in the path. |
| URL is correct & CORS error in console | **CORS not configured**. Backend doesn't allow frontend origin. | Add frontend domain to `CORS_ORIGINS` env var on backend. |

---

## Phase 3: Code Analysis Findings

### Frontend API Configuration
**File:** `frontend/src/services/api.js:8`
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

**Issue:** If `REACT_APP_API_URL` is not set in Cloudflare environment variables, the frontend will attempt to call `http://localhost:8000/api` which fails in production.

### Backend CORS Configuration
**File:** `backend/server.py:65-67,139-146`
```python
ALLOWED_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    allow_headers=["Content-Type", "Authorization"],
)
```

**Issue:** If `CORS_ORIGINS` env var is not set on the backend, only `http://localhost:3000` is allowed. Production domains must be added.

---

## Phase 4: Required Environment Variables

### Cloudflare Pages (Frontend)
Add these in Cloudflare Dashboard → Workers & Pages → propequitylab → Settings → Environment Variables:

| Variable | Production Value |
| :--- | :--- |
| `REACT_APP_API_URL` | `https://api.propequitylab.com/api` |

**Important:** After adding, trigger a redeploy for changes to take effect.

### AWS App Runner / Backend
Add these in your backend deployment configuration:

| Variable | Production Value |
| :--- | :--- |
| `CORS_ORIGINS` | `https://propequitylab.com,https://www.propequitylab.com` |

---

## Phase 5: Resolution Status

- [ ] Verified `REACT_APP_API_URL` is set in Cloudflare
- [ ] Verified `CORS_ORIGINS` includes production domains on backend
- [ ] Tested login flow works in production
- [ ] Network Error resolved
