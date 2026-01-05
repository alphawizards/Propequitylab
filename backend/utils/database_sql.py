"""
SQLModel Database Utility for PostgreSQL (Neon)
Replaces MongoDB connection with PostgreSQL + SQLModel
"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import QueuePool
import os
import logging

logger = logging.getLogger(__name__)

# Database configuration from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
POOL_SIZE = int(os.getenv("DATABASE_POOL_SIZE", "10"))
MAX_OVERFLOW = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))
POOL_TIMEOUT = int(os.getenv("DATABASE_POOL_TIMEOUT", "30"))

# Validate DATABASE_URL
if not DATABASE_URL:
    logger.warning("⚠️  DATABASE_URL not set. Using default PostgreSQL connection.")
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/zapiio"

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_pre_ping=True,  # Verify connections before using
    echo=False,  # Set to True for SQL query logging (debug mode)
    poolclass=QueuePool
)

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
        raise

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
            session.exec("SELECT 1")
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
