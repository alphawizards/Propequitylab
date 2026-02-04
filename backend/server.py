from fastapi import FastAPI, APIRouter, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Import New Utilities
from utils.database_sql import create_db_and_tables
from utils.sentry_config import init_sentry

# Import Routes (SQLModel versions)
from routes.auth import router as auth_router
from routes.portfolios import router as portfolios_router
from routes.properties import router as properties_router
from routes.income import router as income_router
from routes.expenses import router as expenses_router
from routes.assets import router as assets_router
from routes.liabilities import router as liabilities_router
from routes.plans import router as plans_router
from routes.onboarding import router as onboarding_router
from routes.dashboard import router as dashboard_router
from routes.gdpr import router as gdpr_router

# Phase 1-3: Property Portfolio Forecasting Routes
from routes.projections import router as projections_router
from routes.loans import router as loans_router
from routes.valuations import router as valuations_router
from routes.scenarios import router as scenarios_router

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Get allowed origins from environment
ALLOWED_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS]
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting up Zapiio API (Serverless Fintech Stack)...")

    # Initialize Sentry error monitoring (must be first)
    init_sentry()

    logger.info("Starting up PropEquityLab API (Serverless Fintech Stack)...")
    
    # Initialize PostgreSQL Tables
    create_db_and_tables()
    logger.info("✅ Database tables verified/created")

    yield

    logger.info("Shutting down...")

app = FastAPI(
    title="PropEquityLab API",
    description="Property Investment Portfolio Management Platform",
    version="2.0.0",
    lifespan=lifespan
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")

@api_router.get("/health")
@api_router.head("/health")
async def health_check():
    return {"status": "healthy", "stack": "PostgreSQL + App Runner"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(onboarding_router)
api_router.include_router(dashboard_router)
api_router.include_router(portfolios_router)
api_router.include_router(properties_router)
api_router.include_router(income_router)
api_router.include_router(expenses_router)
api_router.include_router(assets_router)
api_router.include_router(liabilities_router)
api_router.include_router(plans_router)
api_router.include_router(gdpr_router)

# Phase 1-3: Property Portfolio Forecasting Routes
api_router.include_router(projections_router)
api_router.include_router(loans_router)
api_router.include_router(valuations_router)
api_router.include_router(scenarios_router)

app.include_router(api_router)


# Security Headers Middleware
# @app.middleware("http")
# async def add_security_headers(request: Request, call_next):
#     # Handle Actual Request
#     response = await call_next(request)
#     
#     # Strict-Transport-Security (HSTS)
#     response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
#     
#     # Content-Security-Policy (CSP)
#     response.headers["Content-Security-Policy"] = (
#         "default-src 'self'; "
#         "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
#         "style-src 'self' 'unsafe-inline'; "
#         "img-src 'self' data: https:; "
#         "font-src 'self' data:; "
#         "connect-src 'self' http://localhost:3000 http://127.0.0.1:3000 http://localhost:8000 http://127.0.0.1:8000 https://propequitylab.com https://propequitylab.pages.dev https://h3nhfwgxgf.ap-southeast-2.awsapprunner.com https://*.awsapprunner.com; "
#         "frame-ancestors 'none';"
#     )
#     
#     # X-Frame-Options
#     response.headers["X-Frame-Options"] = "DENY"
#     
#     # X-Content-Type-Options
#     response.headers["X-Content-Type-Options"] = "nosniff"
#     
#     # X-XSS-Protection
#     response.headers["X-XSS-Protection"] = "1; mode=block"
#     
#     # Referrer-Policy
#     response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
#     
#     # Permissions-Policy
#     response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
#     
#     return response

# Standard CORS Middleware (Handles Preflight & Error Responses correctly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
