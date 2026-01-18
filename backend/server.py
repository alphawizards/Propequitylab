from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting up Zapiio API (Serverless Fintech Stack)...")

    # Initialize Sentry error monitoring (must be first)
    init_sentry()

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

api_router = APIRouter(prefix="/api")

@api_router.get("/health")
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

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
