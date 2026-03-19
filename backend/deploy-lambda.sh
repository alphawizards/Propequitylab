#!/bin/bash
# PropEquityLab Lambda Deployment Script
# Prerequisites: AWS CLI and SAM CLI installed, AWS credentials configured

set -e

echo "=========================================="
echo "PropEquityLab Lambda Deployment"
echo "=========================================="

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "ERROR: AWS SAM CLI is not installed."
    echo "Install it with: pip install aws-sam-cli"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "ERROR: AWS credentials not configured."
    echo "Run: aws configure"
    exit 1
fi

# Load environment variables from .env if exists
if [ -f .env ]; then
    echo "Loading environment from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET environment variable is required"
    exit 1
fi

# Set defaults
CORS_ORIGINS=${CORS_ORIGINS:-"https://propequitylab.com,https://www.propequitylab.com"}
SENTRY_DSN=${SENTRY_DSN:-""}
ENVIRONMENT=${ENVIRONMENT:-"production"}

echo ""
echo "Configuration:"
echo "  - Environment: $ENVIRONMENT"
echo "  - CORS Origins: $CORS_ORIGINS"
echo "  - Sentry: $([ -n "$SENTRY_DSN" ] && echo "Enabled" || echo "Disabled")"
echo ""

# Build the application
echo "Step 1: Building Lambda package..."
sam build --use-container

# Deploy
echo ""
echo "Step 2: Deploying to AWS Lambda..."
sam deploy \
    --parameter-overrides \
        "Environment=$ENVIRONMENT" \
        "DatabaseUrl=$DATABASE_URL" \
        "JwtSecret=$JWT_SECRET" \
        "CorsOrigins=$CORS_ORIGINS" \
        "SentryDsn=$SENTRY_DSN" \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Get your API endpoint from the outputs above"
echo "2. Update Cloudflare DNS to point api.propequitylab.com to the API Gateway"
echo "3. Update REACT_APP_API_URL in Cloudflare Pages if needed"
echo "4. Test the /api/health endpoint"
echo ""
