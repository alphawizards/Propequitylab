"""
SQLModel Database Utility for PostgreSQL (Neon)
Replaces MongoDB connection with PostgreSQL + SQLModel
"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy import text
import os
import logging

logger = logging.getLogger(__name__)

# Database configuration from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
POOL_SIZE = int(os.getenv("DATABASE_POOL_SIZE", "10"))
MAX_OVERFLOW = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))
POOL_TIMEOUT = int(os.getenv("DATABASE_POOL_TIMEOUT", "30"))

# Validate DATABASE_URL — guard against unresolved Railway reference variables
# e.g. ${Postgres.DATABASE_URL} when the service link is broken.
if not DATABASE_URL or DATABASE_URL.startswith("${"):
    if DATABASE_URL and DATABASE_URL.startswith("${"):
        logger.error(
            "DATABASE_URL contains an unresolved Railway reference: %s. "
            "Check that the Postgres service is linked in Railway.",
            DATABASE_URL,
        )
    else:
        logger.warning("⚠️  DATABASE_URL not set.")
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/propequitylab"

# Railway uses postgres:// but SQLAlchemy requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine - use different settings for SQLite vs PostgreSQL
try:
    if DATABASE_URL.startswith("sqlite"):
        from sqlalchemy.pool import StaticPool
        import json
        from decimal import Decimal

        class DecimalEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, Decimal):
                    return float(obj)
                return super().default(obj)

        def _decimal_json_serializer(obj):
            return json.dumps(obj, cls=DecimalEncoder)

        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
            json_serializer=_decimal_json_serializer,
        )
        logger.info("Using SQLite database for local development")
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_timeout=POOL_TIMEOUT,
            pool_recycle=300,
            pool_pre_ping=True,
            echo=False,
            poolclass=QueuePool,
        )
except Exception as e:
    logger.error("Failed to create database engine: %s — server will start but DB calls will fail", e)
    # Fallback to a minimal engine so imports succeed; actual DB calls will raise.
    engine = create_engine("postgresql://postgres:postgres@localhost:5432/propequitylab")

def create_db_and_tables():
    """
    Create all database tables from SQLModel models
    Should be called on application startup
    """
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"✗ Failed to create database tables: {e}")
        # Don't raise — let the server start even if DB is cold at deploy time.
        # The health endpoint will reflect DB status; individual requests will
        # fail gracefully until the DB warms up.

def get_session():
    """
    Dependency for FastAPI routes
    Provides a database session for each request
    
    Usage in routes:
        @router.get("/items")
        def get_items(session: Session = Depends(get_session)):
            statement = select(Item).where(Item.user_id == user_id)
            items = session.exec(statement).all()
            return items
    """
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()

def test_connection():
    """
    Test database connection
    Returns True if connection is successful
    """
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        logger.info("✓ Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"✗ Database connection test failed: {e}")
        return False

# Connection info for debugging
def get_connection_info():
    """
    Get database connection information (for debugging)
    """
    return {
        "database_url": DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else "Not configured",
        "pool_size": POOL_SIZE,
        "max_overflow": MAX_OVERFLOW,
        "pool_timeout": POOL_TIMEOUT,
        "engine": str(engine.url)
    }
