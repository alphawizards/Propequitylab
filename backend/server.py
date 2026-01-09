from fastapi import FastAPI, APIRouter, Request
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
    
    # Initialize PostgreSQL Tables
    create_db_and_tables()
    logger.info("✅ Database tables verified/created")
    
    yield
    
    logger.info("Shutting down...")

app = FastAPI(
    title="Zapiio API",
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

app.include_router(api_router)

# CORS Middleware - Locked down to production domains
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    allow_headers=["Content-Type", "Authorization"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Strict-Transport-Security (HSTS)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Content-Security-Policy (CSP)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://propequitylab.pages.dev; "
        "frame-ancestors 'none';"
    )
    
    # X-Frame-Options
    response.headers["X-Frame-Options"] = "DENY"
    
    # X-Content-Type-Options
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # X-XSS-Protection
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Referrer-Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Permissions-Policy
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response
