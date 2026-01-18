"""
Sentry Error Monitoring Configuration for FastAPI
Captures errors, performance data, and tracks issues in production
"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import os


def init_sentry():
    """
    Initialize Sentry error monitoring
    Only runs in non-development environments
    """
    sentry_dsn = os.getenv("SENTRY_DSN")
    environment = os.getenv("ENVIRONMENT", "development")

    # Only initialize Sentry in production/staging environments
    if sentry_dsn and environment != "development":
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,

            # Integrations
            integrations=[
                FastApiIntegration(),      # Automatic FastAPI error capture
                SqlalchemyIntegration(),   # Database query tracking
            ],

            # Performance Monitoring
            traces_sample_rate=0.1,  # Sample 10% of transactions for performance monitoring

            # Privacy & GDPR Compliance
            send_default_pii=False,  # Do not send personally identifiable information

            # Error Context
            attach_stacktrace=True,  # Include stack traces with all errors
        )

        print(f"✅ Sentry initialized for environment: {environment}")
    else:
        print(f"⚠️  Sentry NOT initialized (environment: {environment})")
