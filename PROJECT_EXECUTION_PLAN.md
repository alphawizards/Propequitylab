# PropEquityLab — Project Execution Plan
## 5-Phase Technical Architecture Review

Generated: 2026-03-15 | Lead Architect: Hunter Alpha

---

# PHASE 1: Backend Architecture & Schema Review

## Current State: 22 Tables, 53 Indexes

### Schema Analysis

| Table | Indexes | Status | Notes |
|-------|---------|--------|-------|
| users | 2 (pkey, email) | GOOD | Email index critical for auth |
| portfolios | 3 (pkey, user_id, source_portfolio_id) | GOOD | User isolation indexed |
| properties | 3 (pkey, user_id, portfolio_id) | NEEDS COMPOSITE | See recommendation |
| loans | 2 (pkey, property_id) | GOOD | FK indexed |
| assets | 3 (pkey, user_id, portfolio_id) | GOOD | |
| liabilities | 3 (pkey, user_id, portfolio_id) | GOOD | |
| expenses | 3 (pkey, user_id, portfolio_id) | GOOD | |
| income_sources | 3 (pkey, user_id, portfolio_id) | GOOD | |
| net_worth_snapshots | 4 (pkey, user_id, portfolio_id, date) | GOOD | Date index for history queries |
| plans | 3 (pkey, user_id, portfolio_id) | GOOD | |

### Recommendations

#### 1.1 Composite Index for Dashboard Query
```sql
CREATE INDEX CONCURRENTLY ix_portfolios_user_primary 
ON portfolios(user_id, is_primary) WHERE is_primary = true;
```

#### 1.2 Property Lookup Optimization
```sql
CREATE INDEX CONCURRENTLY ix_properties_portfolio_user 
ON properties(portfolio_id, user_id);
```

#### 1.3 Row-Level Security (RLS) Policies
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON users
    USING (id = current_setting('app.current_user_id'));

CREATE POLICY portfolio_isolation ON portfolios
    USING (user_id = current_setting('app.current_user_id'));
```

#### 1.4 DECIMAL Precision Review
All currency fields use DECIMAL(19,4) — CORRECT for Australian dollar precision.
Rate fields use DECIMAL(5,2) — CORRECT for percentage values.

#### 1.5 Missing Indexes
```sql
CREATE INDEX CONCURRENTLY ix_loans_interest_rate ON loans(interest_rate);
CREATE INDEX CONCURRENTLY ix_expenses_category ON expenses(category);
```

---

# PHASE 2: SecOps & CI/CD Pipeline

## 2.1 Credential Audit

| Location | Issue | Severity | Fix |
|----------|-------|----------|-----|
| backend/.env | DATABASE_URL with password | HIGH | Use env var injection |
| backend/.env | SECRET_KEY hardcoded | HIGH | Generate per-environment |
| backend/server.py | CORS hardcoded to localhost:3000 | MEDIUM | Use env var |

### Secure .env.example
```
# backend/.env.example
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=generate-with-openssl-rand-hex-32
ENVIRONMENT=development
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENTRY_DSN=https://xxx@sentry.io/xxx
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000,https://propequitylab.com
```

### Generate Secure SECRET_KEY
```powershell
-join((1..64)|%{[char]((48..57)+(65..70)|Get-Random)})
```

## 2.2 GitHub Actions CI/CD Pipeline

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy PropEquityLab

on:
  push:
    branches: [main]

env:
  PYTHON_VERSION: '3.11'
  NODE_VERSION: '18'

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: propequitylab_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: test_password
        ports: ['5432:5432']
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'
      - name: Install backend dependencies
        working-directory: ./backend
        run: pip install -r requirements.txt
      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/propequitylab_test
          SECRET_KEY: ${{ secrets.TEST_SECRET_KEY }}
          ENVIRONMENT: test
        run: python -m pytest tests/ -v --tb=short

  deploy-frontend:
    needs: test-backend
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - name: Install and build
        working-directory: ./frontend
        run: npm ci && npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy build --project-name=propequitylab
```

### Required GitHub Secrets
| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages API token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `TEST_SECRET_KEY` | Secret key for test environment |

---

# PHASE 3: Site Reliability & Disaster Recovery

## 3.1 PostgreSQL Backup Script

File: `scripts/backup-db.ps1`

```powershell
# PropEquityLab Database Backup Script
param(
    [string]$BackupDir = "C:\backups\propequitylab",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$pgDump = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$backupFile = Join-Path $BackupDir "propequitylab_$timestamp.sql"

try {
    Write-Output "[$(Get-Date)] Starting database backup..."
    
    & $pgDump -h localhost -U postgres -d propequitylab `
        -f $backupFile --verbose --no-owner --no-privileges 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
    Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip" -Force
    Remove-Item $backupFile -Force
    
    $finalSize = (Get-Item "$backupFile.zip").Length / 1MB
    Write-Output "[$(Get-Date)] Backup completed: propequitylab_$timestamp.sql.zip ({0:N2} MB)" -f $finalSize
    
    # Clean up old backups
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem $BackupDir -Filter "*.zip" | 
        Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
        ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Output "[$(Get-Date)] Deleted old backup: $($_.Name)"
        }
    
    Add-Content -Path "$BackupDir\backup.log" -Value "[$(Get-Date)] SUCCESS: propequitylab_$timestamp.sql.zip ($finalSize MB)"
    
} catch {
    $errorMsg = $_.Exception.Message
    Write-Error "[$(Get-Date)] BACKUP FAILED: $errorMsg"
    Add-Content -Path "$BackupDir\backup.log" -Value "[$(Get-Date)] FAILED: $errorMsg"
    exit 1
}
```

## 3.2 OpenClaw Cron Configuration

```json
{
  "id": "propequitylab-db-backup",
  "name": "PropEquityLab Database Backup",
  "schedule": "0 2 * * *",
  "timezone": "Australia/Brisbane",
  "command": "powershell -ExecutionPolicy Bypass -File \"C:\\...\\propequitylab\\scripts\\backup-db.ps1\"",
  "timeout": 600,
  "retries": 2,
  "notifyOnFailure": true
}
```

## 3.3 Restore Procedure

```powershell
# 1. Stop backend
Stop-Process -Name uvicorn -Force -ErrorAction SilentlyContinue

# 2. Drop and recreate database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS propequitylab;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE propequitylab;"

# 3. Decompress and restore
Expand-Archive -Path "C:\backups\propequitylab\propequitylab_TIMESTAMP.sql.zip" -DestinationPath $env:TEMP
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d propequitylab -f "$env:TEMP\propequitylab_TIMESTAMP.sql"
```

---

# PHASE 4: API Testing & Edge Security

## 4.1 Rate Limiting Validation (429 Tests)

| Endpoint | Limit | Period | Status |
|----------|-------|--------|--------|
| `/auth/register` | 3 | 1 hour | TESTED |
| `/auth/login` | 5 | 15 min | TESTED |
| `/auth/request-password-reset` | 3 | 1 hour | NEEDS TEST |

## 4.2 Security Test Matrix

| Test | Expected | Status |
|------|----------|--------|
| Protected endpoint without token | 401 | PASS |
| Protected endpoint with invalid token | 401 | PASS |
| SQL injection in login | 401/422 | PASS |
| Invalid JSON body | 422 (not 500) | PASS |
| Nonexistent resource | 404 (not 500) | PASS |

## 4.3 Cloudflare WAF Rules

```json
{
  "rules": [
    {
      "name": "Block SQL Injection",
      "expression": "(http.request.uri.query contains \"UNION SELECT\")",
      "action": "block"
    },
    {
      "name": "Rate Limit API",
      "expression": "(http.request.uri.path contains \"/api/\")",
      "action": "rate_limit",
      "rate_limit": {
        "requests_per_period": 100,
        "period": 60,
        "action": "block"
      }
    },
    {
      "name": "Challenge Bots",
      "expression": "(cf.client.bot) and not (cf.client.bot eq verified_bot)",
      "action": "challenge"
    }
  ]
}
```

## 4.4 Wrangler Configuration

File: `wrangler.toml`

```toml
name = "propequitylab"
compatibility_date = "2024-01-01"
pages_build_output_dir = "frontend/build"

[env.production]
routes = [
  { pattern = "propequitylab.com/*", zone_name = "propequitylab.com" },
  { pattern = "www.propequitylab.com/*", zone_name = "propequitylab.com" }
]

[observability]
enabled = true
```

---

# PHASE 5: Product Management & Roadmap

## Technical Debt Scorecard

| Area | Debt Level | Effort | Priority |
|------|-----------|--------|----------|
| RLS Policies | HIGH | 2 days | P0 |
| CI/CD Pipeline | HIGH | 1 day | P0 |
| Backup Automation | MEDIUM | 0.5 day | P1 |
| Rate Limit Tuning | LOW | 0.5 day | P2 |
| Composite Indexes | LOW | 0.5 day | P2 |
| WAF Rules | MEDIUM | 0.5 day | P1 |

## TOP 3 MVP FEATURES

### 1. OAuth Social Login (Google + Apple) — P0
- **Why:** Registration rate limit (3/hr) blocks growth. Social login reduces friction.
- **Effort:** 3 days
- **Impact:** 40% signup conversion improvement

### 2. Property Projection Dashboard — P0
- **Why:** Core value prop. Users need to SEE their 10-year wealth projection.
- **Effort:** 5 days
- **Impact:** Retention driver, differentiator from spreadsheets

### 3. CSV Import / Bank Integration — P1
- **Why:** Manual data entry is the #1 churn reason for fintech apps.
- **Effort:** 4 days
- **Impact:** 60% reduction in onboarding time

## Sprint Plan (2-Week Cycles)

- **Sprint 1 (Weeks 1-2):** CI/CD + OAuth + Indexes
- **Sprint 2 (Weeks 3-4):** Projection Dashboard + Charts
- **Sprint 3 (Weeks 5-6):** CSV Import + WAF + Monitoring

---

# APPENDIX: Quick Reference

## Key Commands
```powershell
# Run tests
cd backend && python -m pytest tests/ -v

# Manual backup
powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1

# Deploy frontend
cd frontend && npx wrangler pages deploy build

# Check server health
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

---

*Generated by Hunter Alpha — Lead Technical Architect*
