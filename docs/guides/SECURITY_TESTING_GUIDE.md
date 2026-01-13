# Security Testing Guide - Phase 9C Security Hardening

**Created:** 2026-01-09  
**Purpose:** Verify security hardening implementations  
**Status:** Ready for testing

---

## 🎯 Overview

This guide provides comprehensive testing procedures for the security hardening implementations in Phase 9C, including:
- Rate limiting
- CORS lockdown
- Secure HTTP headers
- Authentication security

---

## 🧪 Test 1: Rate Limiting

### **1.1 Login Rate Limiting**

**Limit:** 5 requests per 15 minutes per IP

**Test Steps:**
1. Open browser developer tools (Network tab)
2. Go to `https://propequitylab.pages.dev/login`
3. Attempt to login with incorrect credentials **6 times** rapidly
4. On the 6th attempt, you should receive:
   - HTTP Status: `429 Too Many Requests`
   - Error message: "Too many login attempts. Please try again in X seconds."

**Expected Result:**
```json
{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "Too many login attempts. Please try again in 900 seconds.",
    "limit": 5,
    "reset": <timestamp>
  }
}
```

**Pass Criteria:**
- ✅ First 5 attempts return 401 (Unauthorized) or 200 (Success)
- ✅ 6th attempt returns 429 (Too Many Requests)
- ✅ Error message is clear and user-friendly
- ✅ Reset time is provided

---

### **1.2 Registration Rate Limiting**

**Limit:** 3 requests per hour per IP

**Test Steps:**
1. Go to `https://propequitylab.pages.dev/register`
2. Attempt to register **4 different accounts** rapidly
3. On the 4th attempt, you should receive HTTP 429

**Expected Result:**
- First 3 registrations succeed or fail with validation errors
- 4th registration returns 429 with rate limit message

**Pass Criteria:**
- ✅ First 3 attempts allowed
- ✅ 4th attempt blocked with 429
- ✅ Clear error message provided

---

### **1.3 Password Reset Rate Limiting**

**Limit:** 3 requests per hour per IP

**Test Steps:**
1. Go to password reset page (when implemented)
2. Request password reset **4 times** rapidly
3. Verify 4th request is blocked

**Expected Result:**
- 429 status on 4th request

---

## 🧪 Test 2: CORS Configuration

### **2.1 Allowed Origins**

**Test Steps:**
1. Open browser developer tools (Console tab)
2. Go to `https://propequitylab.pages.dev`
3. Open Console and run:
```javascript
fetch('https://your-backend-url.com/api/health', {
  method: 'GET',
  headers: {
    'Origin': 'https://propequitylab.pages.dev'
  }
})
.then(response => console.log('Success:', response.status))
.catch(error => console.error('Error:', error));
```

**Expected Result:**
- ✅ Request succeeds (status 200)
- ✅ No CORS errors in console

---

### **2.2 Blocked Origins**

**Test Steps:**
1. Open browser developer tools (Console tab)
2. Try to make request from unauthorized origin:
```javascript
// This should fail
fetch('https://your-backend-url.com/api/health', {
  method: 'GET',
  headers: {
    'Origin': 'https://evil-site.com'
  }
})
.then(response => console.log('Success:', response.status))
.catch(error => console.error('CORS Error (Expected):', error));
```

**Expected Result:**
- ❌ Request blocked by CORS policy
- ❌ Console shows CORS error
- ✅ This is the expected behavior!

**Pass Criteria:**
- ✅ Only `https://propequitylab.pages.dev` and `http://localhost:3000` are allowed
- ✅ Other origins are blocked

---

## 🧪 Test 3: Security Headers

### **3.1 Verify Headers**

**Test Steps:**
1. Open browser developer tools (Network tab)
2. Go to `https://propequitylab.pages.dev`
3. Click on any API request to backend
4. Check "Response Headers" tab

**Expected Headers:**

| Header | Expected Value | Purpose |
|--------|----------------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |
| `Content-Security-Policy` | (see below) | Content restrictions |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Feature restrictions |

**Content-Security-Policy Expected:**
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self' data:; 
connect-src 'self' https://propequitylab.pages.dev; 
frame-ancestors 'none';
```

**Pass Criteria:**
- ✅ All headers are present
- ✅ Values match expected values
- ✅ No security warnings in browser console

---

### **3.2 Test HSTS**

**Test Steps:**
1. Try to access backend via HTTP (not HTTPS)
2. Browser should automatically redirect to HTTPS

**Expected Result:**
- ✅ Automatic redirect to HTTPS
- ✅ No insecure connection warnings

---

### **3.3 Test X-Frame-Options**

**Test Steps:**
1. Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Frame Test</h1>
  <iframe src="https://propequitylab.pages.dev"></iframe>
</body>
</html>
```
2. Open the file in browser
3. Check browser console

**Expected Result:**
- ❌ iframe fails to load
- ❌ Console shows: "Refused to display in a frame because it set 'X-Frame-Options' to 'deny'"
- ✅ This is the expected behavior (prevents clickjacking)!

---

## 🧪 Test 4: Authentication Security

### **4.1 JWT Token Expiry**

**Test Steps:**
1. Login to the application
2. Open browser developer tools (Application tab)
3. Find `localStorage` → `access_token`
4. Note the token
5. Wait for token expiry (typically 15-60 minutes)
6. Try to access a protected page

**Expected Result:**
- ✅ Token expires after designated time
- ✅ User is redirected to login page
- ✅ Clear message: "Session expired, please login again"

---

### **4.2 Password Hashing**

**Test Steps:**
1. Register a new user with password: `TestPassword123!`
2. Check database (if you have access)
3. Verify password is hashed (not plain text)

**Expected Result:**
- ✅ Password stored as bcrypt hash (starts with `$2b$`)
- ✅ Hash is different for same password (salt is random)

---

### **4.3 Email Verification Required**

**Test Steps:**
1. Register a new user
2. Do NOT verify email
3. Try to login

**Expected Result:**
- ❌ Login fails with message: "Please verify your email address"
- ✅ User cannot access protected routes

---

## 🧪 Test 5: Data Isolation

### **5.1 User A Cannot Access User B's Data**

**Test Steps:**
1. Register User A (email: `usera@test.com`)
2. Login as User A
3. Add a property: "User A Property"
4. Note the property ID in the URL or network request
5. Logout
6. Register User B (email: `userb@test.com`)
7. Login as User B
8. Try to access User A's property by ID:
   - Method 1: Manually navigate to `/finances/properties/{user_a_property_id}`
   - Method 2: Use browser console to make API request:
```javascript
fetch('https://your-backend-url.com/api/properties/{user_a_property_id}', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

**Expected Result:**
- ❌ Request fails with 404 (Not Found) or 403 (Forbidden)
- ❌ User B cannot see User A's property
- ✅ This is the expected behavior!

**Pass Criteria:**
- ✅ User B cannot access User A's data
- ✅ API returns appropriate error
- ✅ No data leakage

---

## 🧪 Test 6: SQL Injection Prevention

### **6.1 Test SQL Injection in Login**

**Test Steps:**
1. Go to login page
2. Try these malicious inputs:
   - Email: `admin' OR '1'='1`
   - Password: `anything`

**Expected Result:**
- ❌ Login fails
- ✅ No SQL error messages exposed
- ✅ Application handles gracefully

---

### **6.2 Test SQL Injection in Search**

**Test Steps:**
1. Login to application
2. Use search feature with: `'; DROP TABLE users; --`

**Expected Result:**
- ✅ Search returns no results or error
- ✅ No database tables dropped
- ✅ Application remains functional

---

## 🧪 Test 7: XSS Prevention

### **7.1 Test XSS in Input Fields**

**Test Steps:**
1. Login to application
2. Try to add a property with name:
   ```html
   <script>alert('XSS')</script>
   ```
3. Save and view the property

**Expected Result:**
- ✅ Script does not execute
- ✅ Text is displayed as plain text (escaped)
- ✅ No alert popup appears

---

## 📊 Security Test Results Summary

| Test Category | Test | Status | Notes |
|---------------|------|--------|-------|
| **Rate Limiting** | Login (5/15min) | ⬜ Pass / ⬜ Fail | |
| | Registration (3/hour) | ⬜ Pass / ⬜ Fail | |
| | Password Reset (3/hour) | ⬜ Pass / ⬜ Fail | |
| **CORS** | Allowed origins | ⬜ Pass / ⬜ Fail | |
| | Blocked origins | ⬜ Pass / ⬜ Fail | |
| **Security Headers** | All headers present | ⬜ Pass / ⬜ Fail | |
| | HSTS working | ⬜ Pass / ⬜ Fail | |
| | X-Frame-Options working | ⬜ Pass / ⬜ Fail | |
| **Authentication** | JWT expiry | ⬜ Pass / ⬜ Fail | |
| | Password hashing | ⬜ Pass / ⬜ Fail | |
| | Email verification | ⬜ Pass / ⬜ Fail | |
| **Data Isolation** | User data separation | ⬜ Pass / ⬜ Fail | |
| **Injection Prevention** | SQL injection | ⬜ Pass / ⬜ Fail | |
| | XSS prevention | ⬜ Pass / ⬜ Fail | |

---

## 🚨 Common Issues & Solutions

### Issue: Rate limiting not working

**Possible Causes:**
- Redis not configured
- `ENABLE_RATE_LIMITING` set to False
- Using different IPs (VPN, mobile network)

**Solutions:**
1. Check `ENABLE_RATE_LIMITING` environment variable
2. Check Redis connection in backend logs
3. Test from same IP address

---

### Issue: CORS errors on frontend

**Possible Causes:**
- `CORS_ORIGINS` not configured correctly
- Frontend URL doesn't match configured origin

**Solutions:**
1. Verify `CORS_ORIGINS` includes `https://propequitylab.pages.dev`
2. Check for trailing slashes in URLs
3. Clear browser cache

---

### Issue: Security headers not appearing

**Possible Causes:**
- Middleware not applied
- Proxy/CDN stripping headers

**Solutions:**
1. Check backend logs for middleware initialization
2. Test directly against backend (bypass CDN)
3. Verify middleware order in server.py

---

## ✅ Sign-Off

**Tested by:** _________________  
**Date:** _________________  
**All tests passed:** ⬜ Yes / ⬜ No  
**Critical issues found:** _________________  
**Ready for production:** ⬜ Yes / ⬜ No

---

## 📞 Support

If tests fail, check:
1. Backend logs for errors
2. Browser console for client-side errors
3. Network tab for request/response details
4. Environment variables configuration

---

*Document created: 2026-01-09*  
*Security hardening testing guide*
