# Redis Provisioning Guide for PropEquityLab

**Purpose:** Distributed rate limiting and token blacklisting  
**Provider:** Upstash (Recommended) or Railway Redis  
**Region:** ap-southeast-2 (Sydney) for low latency

---

## Why Redis is Critical

⚠️ **PRODUCTION BLOCKER:** Without Redis, rate limiting uses in-memory storage, which means:

- **Problem:** If you deploy to AWS App Runner with 2+ instances, each instance has its own memory
- **Attack Vector:** A hacker can hit Instance A 100 times AND Instance B 100 times, bypassing your "5 requests per 15 minutes" limit
- **Solution:** Redis provides shared state across all instances

---

## Option 1: Upstash (Recommended)

### Why Upstash?
- ✅ Serverless Redis (pay-per-request)
- ✅ Global edge network
- ✅ Free tier: 10,000 commands/day
- ✅ Low latency from Sydney
- ✅ No server management

### Setup Steps:

1. **Create Account**
   - Go to https://upstash.com
   - Sign up with GitHub or email

2. **Create Database**
   - Click "Create Database"
   - Name: `propequitylab-rate-limiting`
   - Region: **ap-southeast-2 (AWS Sydney)**
   - Type: **Regional** (not Global, for lower latency)
   - Eviction: **No eviction** (we manage expiry)

3. **Get Connection String**
   - Click on your database
   - Copy the **REST URL** or **Redis URL**
   - Format: `redis://default:xxxxx@ap-southeast-2-xxxxx.upstash.io:6379`

4. **Add to Environment Variables**
   ```bash
   # backend/.env
   REDIS_URL=redis://default:xxxxx@ap-southeast-2-xxxxx.upstash.io:6379
   ENABLE_RATE_LIMITING=True
   ```

5. **Test Connection**
   ```bash
   cd backend
   source venv/bin/activate
   python3 -c "
   import redis.asyncio as redis
   import asyncio
   
   async def test():
       r = redis.from_url('redis://default:xxxxx@ap-southeast-2-xxxxx.upstash.io:6379')
       await r.set('test', 'hello')
       value = await r.get('test')
       print(f'✓ Redis connected: {value}')
       await r.close()
   
   asyncio.run(test())
   "
   ```

---

## Option 2: Railway Redis

### Why Railway?
- ✅ Simple deployment
- ✅ Integrated with Railway backend deployment
- ✅ $5/month for 512MB
- ✅ No cold starts

### Setup Steps:

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Add Redis to Project**
   - Open your PropEquityLab project (or create new)
   - Click "+ New"
   - Select "Database" → "Redis"
   - Railway will provision automatically

3. **Get Connection String**
   - Click on Redis service
   - Go to "Connect" tab
   - Copy **Redis URL**
   - Format: `redis://default:xxxxx@containers-us-west-xxx.railway.app:6379`

4. **Add to Environment Variables**
   ```bash
   # backend/.env
   REDIS_URL=redis://default:xxxxx@containers-us-west-xxx.railway.app:6379
   ENABLE_RATE_LIMITING=True
   ```

---

## Option 3: AWS ElastiCache (Production-Scale)

### Why ElastiCache?
- ✅ Fully managed by AWS
- ✅ Same region as App Runner (low latency)
- ✅ Auto-scaling
- ✅ Multi-AZ for high availability

### Setup Steps:

1. **Create ElastiCache Cluster**
   - Go to AWS Console → ElastiCache
   - Click "Create" → "Redis"
   - Name: `propequitylab-rate-limiting`
   - Node type: `cache.t4g.micro` (free tier eligible)
   - Region: **ap-southeast-2 (Sydney)**
   - Subnet: Same VPC as App Runner

2. **Configure Security Group**
   - Allow inbound traffic on port 6379
   - From: App Runner security group

3. **Get Connection String**
   - Copy the **Primary Endpoint**
   - Format: `redis://propequitylab-rate-limiting.xxxxx.cache.amazonaws.com:6379`

4. **Add to Environment Variables**
   ```bash
   REDIS_URL=redis://propequitylab-rate-limiting.xxxxx.cache.amazonaws.com:6379
   ```

---

## Verification

### 1. Check Redis Connection on Startup

When you start the backend, you should see:
```
✓ Redis rate limiter initialized
```

If you see:
```
⚠️  REDIS_URL not configured. Rate limiting using in-memory fallback.
```

Then Redis is not connected.

### 2. Test Rate Limiting

```bash
# Trigger rate limit (6 login attempts)
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

On the 6th attempt, you should see:
```json
{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "Too many login attempts. Please try again in 900 seconds."
  }
}
```

### 3. Verify Shared State (Multiple Instances)

If you deploy with 2+ instances:

1. Send 3 requests to Instance A
2. Send 3 requests to Instance B
3. The 6th request should be rate-limited

This proves Redis is sharing state across instances.

---

## Cost Comparison

| Provider | Free Tier | Paid Tier | Latency (Sydney) |
|----------|-----------|-----------|------------------|
| **Upstash** | 10K commands/day | $0.20/100K commands | ~5ms |
| **Railway** | None | $5/month (512MB) | ~50ms (US) |
| **ElastiCache** | 750 hours/month (12 months) | $0.017/hour (~$12/month) | ~1ms |

**Recommendation:** Start with **Upstash** (free tier), upgrade to **ElastiCache** when you hit scale.

---

## Environment Variables Summary

```bash
# backend/.env

# PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-2.aws.neon.tech/propequitylab?sslmode=require

# Redis (Upstash)
REDIS_URL=redis://default:xxxxx@ap-southeast-2-xxxxx.upstash.io:6379
ENABLE_RATE_LIMITING=True

# JWT
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## Troubleshooting

### Error: "redis package not installed"

```bash
pip install redis>=5.0.0
```

### Error: "Connection refused"

- Check REDIS_URL format
- Verify Redis instance is running
- Check firewall/security group rules

### Error: "Authentication failed"

- Verify password in REDIS_URL
- Check Upstash dashboard for correct credentials

### Rate limiting not working across instances

- Verify REDIS_URL is set in production environment
- Check logs for "✓ Redis rate limiter initialized"
- Test with multiple instances

---

## Next Steps

After Redis is provisioned:

1. ✅ Update `.env` with `REDIS_URL`
2. ✅ Restart backend server
3. ✅ Verify "✓ Redis rate limiter initialized" in logs
4. ✅ Test rate limiting
5. ✅ Proceed to Phase 9B (Security Hardening)

---

**Guide Version:** 1.0  
**Last Updated:** January 5, 2026  
**Project:** PropEquityLab - Serverless Fintech Architecture
