---
name: fullstack-web-developer
description: Expert full-stack web developer skill for building, debugging, testing, and deploying production-ready web applications. This skill should be used when building complete web applications, integrating with cloud services (AWS, Neon, Supabase, Cloudflare), debugging frontend/backend issues, implementing testing strategies, or preparing applications for production launch. Covers React/Next.js frontends, Python/FastAPI backends, database integration, CI/CD pipelines, and infrastructure configuration.
---

# Full Stack Web Developer

This skill provides expert guidance for building, debugging, testing, and deploying production-ready web applications with modern best practices.

## Core Competencies

### Frontend Development
- **React/Next.js**: Component architecture, state management, hooks, SSR/SSG
- **Styling**: CSS Modules, Tailwind CSS, styled-components, responsive design
- **Performance**: Code splitting, lazy loading, image optimization, Core Web Vitals
- **Accessibility**: WCAG compliance, semantic HTML, keyboard navigation, ARIA

### Backend Development
- **Python/FastAPI**: RESTful APIs, async/await, dependency injection, middleware
- **Node.js/Express**: API development, authentication, server-side rendering
- **Database Design**: Schema modeling, migrations, query optimization
- **API Design**: OpenAPI/Swagger, versioning, rate limiting, error handling

### Database Integration
- **PostgreSQL (Neon)**: Connection pooling, serverless configuration, branching
- **Supabase**: Auth, RLS policies, realtime subscriptions, edge functions
- **ORMs**: SQLAlchemy, SQLModel, Prisma, type-safe queries

### Cloud & Infrastructure
- **AWS**: Lambda, API Gateway, S3, CloudFront, RDS, Secrets Manager, IAM
- **Cloudflare**: Pages, Workers, D1, R2, Access, DNS, SSL/TLS
- **CI/CD**: GitHub Actions, automated testing, deployment pipelines

---

## Development Workflow

### 1. Project Setup

To initialize a new full-stack project:

1. **Frontend**: Use `npx create-next-app@latest ./ --typescript --tailwind --app --src-dir`
2. **Backend**: Create Python virtual environment and install dependencies
3. **Database**: Configure connection strings with environment variables
4. **Git**: Initialize repository with proper `.gitignore`

### 2. Environment Configuration

Structure environment files properly:

```
.env.local          # Local development (never commit)
.env.example        # Template with placeholder values
.env.production     # Production values (in CI/CD secrets)
```

Required environment variables for typical projects:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Authentication
JWT_SECRET_KEY=<generate-secure-key>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-2

# Supabase
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
```

### 3. Code Quality Standards

Apply these standards to all code:

- **Type Safety**: TypeScript for frontend, type hints for Python
- **Linting**: ESLint + Prettier for JS/TS, Ruff for Python
- **Testing**: Jest/Vitest for frontend, Pytest for backend
- **Documentation**: JSDoc/docstrings for all public APIs

---

## Debugging Strategies

### Frontend Debugging

To diagnose frontend issues:

1. **Console Errors**: Check browser DevTools console for stack traces
2. **Network Tab**: Inspect API requests/responses, check CORS headers
3. **React DevTools**: Examine component state, props, and re-renders
4. **Source Maps**: Enable for production debugging when needed

Common frontend issues:

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Hydration mismatch | Server/client HTML differs | Ensure consistent rendering, use `useEffect` for client-only code |
| CORS errors | API blocks cross-origin requests | Configure backend CORS middleware properly |
| State not updating | Stale closure or missing dependency | Check useEffect/useCallback dependencies |
| Infinite re-renders | State update in render body | Move state updates to event handlers or effects |

### Backend Debugging

To diagnose backend issues:

1. **Logging**: Add structured logging at key points
2. **Request/Response**: Log incoming requests and outgoing responses
3. **Database Queries**: Enable query logging, check execution plans
4. **Stack Traces**: Ensure full traces in development mode

Common backend issues:

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| 500 Internal Error | Unhandled exception | Add try/catch, return proper error responses |
| Slow queries | N+1 or missing indexes | Use eager loading, add database indexes |
| Connection timeout | Pool exhaustion | Configure connection limits, use NullPool for serverless |
| Auth failures | Token/session issues | Verify JWT secret, check token expiration |

### Database Debugging

To diagnose database issues:

1. **Connection**: Test connection string with psql or database client
2. **Migrations**: Ensure all migrations have run successfully
3. **Queries**: Use EXPLAIN ANALYZE to check query performance
4. **Locks**: Check for blocking queries with pg_stat_activity

---

## Testing Strategy

### Unit Testing

To write effective unit tests:

```python
# Python/Pytest example
import pytest
from app.services.calculator import calculate_mortgage

def test_calculate_mortgage_standard_case():
    result = calculate_mortgage(principal=500000, rate=0.05, years=30)
    assert result.monthly_payment == pytest.approx(2684.11, rel=0.01)

def test_calculate_mortgage_zero_rate():
    result = calculate_mortgage(principal=500000, rate=0, years=30)
    assert result.monthly_payment == pytest.approx(1388.89, rel=0.01)
```

```typescript
// TypeScript/Vitest example
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/utils/format'

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats negative amounts', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
  })
})
```

### Integration Testing

To test API endpoints:

```python
# FastAPI integration test
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_property(client, auth_headers):
    response = await client.post(
        "/api/v1/properties",
        json={"address": "123 Test St", "value": 500000},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["address"] == "123 Test St"
```

### End-to-End Testing

To test complete user flows:

1. Use Playwright or Cypress for browser automation
2. Test critical paths: signup, login, core features, checkout
3. Run in CI/CD pipeline before deployment
4. Use realistic test data and clean up after tests

---

## Cloud Integration

### AWS Lambda (Serverless Backend)

To deploy FastAPI to Lambda:

1. **Handler**: Use Mangum adapter
   ```python
   from mangum import Mangum
   from app.main import app
   handler = Mangum(app)
   ```

2. **Database**: Use NullPool for Lambda
   ```python
   engine = create_engine(DATABASE_URL, poolclass=NullPool)
   ```

3. **Deployment**: Use SAM, CDK, or Terraform

### Neon PostgreSQL

To configure Neon for serverless:

```python
# Connection with pooler for serverless
DATABASE_URL = "postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"

# Enable connection caching
from sqlalchemy.pool import NullPool
engine = create_engine(DATABASE_URL, poolclass=NullPool)
```

### Supabase Integration

To integrate Supabase:

```typescript
// Client-side (with RLS)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Server-side (bypass RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
```

### Cloudflare Configuration

To deploy to Cloudflare Pages:

1. Connect GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next` or `dist`
3. Set environment variables in dashboard
4. Configure custom domain and SSL

---

## Production Launch Checklist

### Security

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced everywhere
- [ ] CORS configured for production domains only
- [ ] Authentication on all protected routes
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)

### Performance

- [ ] Images optimized (WebP, lazy loading)
- [ ] JavaScript bundled and minified
- [ ] CSS purged and minified
- [ ] Caching headers configured
- [ ] CDN configured for static assets
- [ ] Database indexes on queried columns
- [ ] Connection pooling configured

### Monitoring

- [ ] Error tracking (Sentry or similar)
- [ ] Application metrics (response times, error rates)
- [ ] Database monitoring (query performance, connections)
- [ ] Uptime monitoring and alerting
- [ ] Log aggregation and search

### Deployment

- [ ] CI/CD pipeline with automated tests
- [ ] Staging environment for pre-production testing
- [ ] Database migrations run automatically
- [ ] Rollback strategy documented and tested
- [ ] Environment variables configured for production
- [ ] DNS and SSL certificates configured

---

## Common Patterns

### API Route Structure

```
/api/v1/
├── auth/
│   ├── login
│   ├── register
│   └── refresh
├── users/
│   ├── me
│   └── {user_id}
├── resources/
│   ├── GET /           (list)
│   ├── POST /          (create)
│   ├── GET /{id}       (read)
│   ├── PUT /{id}       (update)
│   └── DELETE /{id}    (delete)
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  }
}
```

### Authentication Flow

1. User submits credentials
2. Server validates and issues JWT access + refresh tokens
3. Client stores tokens (httpOnly cookies preferred)
4. Client sends access token in Authorization header
5. Server validates token on protected routes
6. Client uses refresh token to get new access token when expired

---

## Troubleshooting Reference

### Build Failures

| Error | Cause | Solution |
|-------|-------|----------|
| Module not found | Missing dependency | Run `npm install` or `pip install -r requirements.txt` |
| Type errors | TypeScript/type hint issues | Fix type annotations, update @types packages |
| Build timeout | Large bundle or slow process | Increase timeout, optimize build process |

### Deployment Failures

| Error | Cause | Solution |
|-------|-------|----------|
| Missing env vars | Not configured in platform | Add to Cloudflare/AWS/Vercel dashboard |
| Port binding | Wrong port configuration | Use `process.env.PORT` or platform default |
| Memory exceeded | Lambda/Worker limits | Optimize code, increase memory allocation |

### Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Connection refused | Database/service unreachable | Check network, security groups, connection string |
| CORS blocked | Missing or wrong headers | Configure CORS middleware for production domains |
| JWT invalid | Wrong secret or expired | Verify secret matches, check token expiration |
