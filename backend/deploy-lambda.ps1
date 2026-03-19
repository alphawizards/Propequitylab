# PropEquityLab Lambda Deployment Script (PowerShell)
# Prerequisites: AWS CLI and SAM CLI installed, AWS credentials configured

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PropEquityLab Lambda Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if SAM CLI is installed
try {
    sam --version | Out-Null
} catch {
    Write-Host "ERROR: AWS SAM CLI is not installed." -ForegroundColor Red
    Write-Host "Install it with: pip install aws-sam-cli" -ForegroundColor Yellow
    exit 1
}

# Check if AWS credentials are configured
try {
    aws sts get-caller-identity | Out-Null
} catch {
    Write-Host "ERROR: AWS credentials not configured." -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env if exists
if (Test-Path ".env") {
    Write-Host "Loading environment from .env file..." -ForegroundColor Green
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Required environment variables
$DATABASE_URL = $env:DATABASE_URL
$JWT_SECRET = $env:JWT_SECRET

if (-not $DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL environment variable is required" -ForegroundColor Red
    Write-Host "Set it with: `$env:DATABASE_URL = 'postgresql://...'" -ForegroundColor Yellow
    exit 1
}

if (-not $JWT_SECRET) {
    Write-Host "ERROR: JWT_SECRET environment variable is required" -ForegroundColor Red
    Write-Host "Set it with: `$env:JWT_SECRET = 'your-secret-key'" -ForegroundColor Yellow
    exit 1
}

# Set defaults
$CORS_ORIGINS = if ($env:CORS_ORIGINS) { $env:CORS_ORIGINS } else { "https://propequitylab.com,https://www.propequitylab.com" }
$SENTRY_DSN = if ($env:SENTRY_DSN) { $env:SENTRY_DSN } else { "" }
$ENVIRONMENT = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "production" }

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  - Environment: $ENVIRONMENT"
Write-Host "  - CORS Origins: $CORS_ORIGINS"
Write-Host "  - Sentry: $(if ($SENTRY_DSN) { 'Enabled' } else { 'Disabled' })"
Write-Host ""

# Build the application
Write-Host "Step 1: Building Lambda package..." -ForegroundColor Cyan
sam build --use-container

# Deploy
Write-Host ""
Write-Host "Step 2: Deploying to AWS Lambda..." -ForegroundColor Cyan
sam deploy `
    --parameter-overrides `
        "Environment=$ENVIRONMENT" `
        "DatabaseUrl=$DATABASE_URL" `
        "JwtSecret=$JWT_SECRET" `
        "CorsOrigins=$CORS_ORIGINS" `
        "SentryDsn=$SENTRY_DSN" `
    --no-confirm-changeset `
    --no-fail-on-empty-changeset

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Get your API endpoint from the outputs above"
Write-Host "2. Update Cloudflare DNS to point api.propequitylab.com to the API Gateway"
Write-Host "3. Update REACT_APP_API_URL in Cloudflare Pages if needed"
Write-Host "4. Test the /api/health endpoint"
Write-Host ""
