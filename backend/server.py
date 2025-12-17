from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routes
from routes.portfolios import router as portfolios_router
from routes.properties import router as properties_router
from routes.income import router as income_router
from routes.expenses import router as expenses_router
from routes.assets import router as assets_router
from routes.liabilities import router as liabilities_router
from routes.plans import router as plans_router
from routes.onboarding import router as onboarding_router
from routes.dashboard import router as dashboard_router

# Import utilities
from utils.database import db, client
from utils.dev_user import get_or_create_dev_user, DEV_USER_ID

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting up Zapiio API...")
    
    # Ensure dev user exists
    user = await get_or_create_dev_user()
    logger.info(f"Dev user ready: {user['id']}")
    
    # Create indexes for better performance
    await db.portfolios.create_index("user_id")
    await db.portfolios.create_index("id", unique=True)
    await db.properties.create_index("portfolio_id")
    await db.properties.create_index("user_id")
    await db.income_sources.create_index("portfolio_id")
    await db.expenses.create_index("portfolio_id")
    await db.assets.create_index("portfolio_id")
    await db.liabilities.create_index("portfolio_id")
    await db.plans.create_index("portfolio_id")
    await db.net_worth_history.create_index([("user_id", 1), ("date", -1)])
    
    logger.info("Database indexes created")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    client.close()


# Create the main app
app = FastAPI(
    title="Zapiio API",
    description="Property Investment Portfolio Management Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Zapiio API is running", "version": "1.0.0"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "dev_user_id": DEV_USER_ID}


# Include all route modules
api_router.include_router(onboarding_router)
api_router.include_router(dashboard_router)
api_router.include_router(portfolios_router)
api_router.include_router(properties_router)
api_router.include_router(income_router)
api_router.include_router(expenses_router)
api_router.include_router(assets_router)
api_router.include_router(liabilities_router)
api_router.include_router(plans_router)

# Include the main router in the app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
