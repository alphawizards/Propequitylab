# 🚀 Quick Deploy: Resend Email Configuration

**Time Required:** 5-10 minutes  
**Resend API Key:** `re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV`

---

## ⚡ Fast Track: GitHub Actions Method

### 1️⃣ Add GitHub Secrets (2 minutes)

Go to: `https://github.com/alphawizards/Propequitylab/settings/secrets/actions`

Click **"New repository secret"** for each:

```
Name: RESEND_API_KEY
Value: re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV
```

```
Name: FROM_EMAIL
Value: Propequitylab <onboarding@resend.dev>
```

```
Name: FRONTEND_URL
Value: https://propequitylab.pages.dev
```

### 2️⃣ Push Updated Files (2 minutes)

```bash
cd /path/to/Propequitylab
git add .
git commit -m "Configure Resend email service"
git push origin main
```

### 3️⃣ Monitor Deployment (3-5 minutes)

Watch: `https://github.com/alphawizards/Propequitylab/actions`

Wait for ✅ green checkmark on "Deploy Backend to AWS App Runner"

### 4️⃣ Test Email (2 minutes)

1. Go to: `https://propequitylab.pages.dev/register`
2. Register with your real email
3. Check inbox for verification email
4. Click "Verify Email Address"
5. Login and access dashboard

---

## 🔧 Alternative: AWS Console Method

If you prefer not to trigger a full deployment:

### 1️⃣ Open AWS App Runner

1. Go to: https://console.aws.amazon.com/apprunner/
2. Region: **ap-southeast-2** (Sydney)
3. Service: **propequitylab-api**

### 2️⃣ Add Environment Variables

Configuration tab → Edit → Add variables:

```
RESEND_API_KEY = re_QbATcdYx_Bh8CmKDpL6vomyVwYRoBzMMV
FROM_EMAIL = Propequitylab <onboarding@resend.dev>
FRONTEND_URL = https://propequitylab.pages.dev
```

Save → Auto-redeploys (3-5 minutes)

### 3️⃣ Test Email

Same as above: Register → Check email → Verify → Login

---

## ✅ Success Indicators

**Backend Logs (AWS App Runner):**
```
✓ Email sent to user@example.com: Welcome to Zapiio - Verify Your Email
```

**User Experience:**
- ✉️ Receives verification email within 1 minute
- 🔗 Clicks verification link
- ✅ Sees "Email verified successfully" message
- 🔐 Can login and access dashboard

---

## 🚨 If Something Goes Wrong

**No email received?**
1. Check spam folder
2. Check AWS App Runner logs for errors
3. Verify `RESEND_API_KEY` is set correctly
4. Check Resend dashboard: https://resend.com/emails

**"Invalid API Key" error?**
- Double-check the API key (no extra spaces)
- Try regenerating in Resend dashboard

**CORS errors?**
- Ensure `CORS_ORIGINS` includes `https://propequitylab.pages.dev`

---

## 📚 Full Documentation

See: `/docs/RESEND_EMAIL_SETUP.md` for detailed troubleshooting and configuration options.

---

**Ready to deploy? Choose your method above and follow the steps!** 🚀
