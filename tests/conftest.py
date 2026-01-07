"""
Test Configuration - SQLModel (PostgreSQL/SQLite)
Provides fixtures for testing with in-memory SQLite database
"""

import pytest
import sys
import os
from typing import Generator

# Add project paths
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

# Import all models to ensure they're registered with SQLModel
from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from models.plan import Plan

# Import the app and dependency
from backend.server import app
from utils.database_sql import get_session
from utils.auth import get_current_user, create_access_token


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest.fixture(name="engine")
def engine_fixture():
    """Create a test database engine using SQLite in-memory"""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    # Cleanup
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session, None, None]:
    """Create a test database session"""
    with Session(engine) as session:
        yield session


# ============================================================================
# Test User & Auth Fixtures
# ============================================================================

@pytest.fixture(name="test_user")
def test_user_fixture(session: Session) -> User:
    """Create a test user in the database"""
    import uuid
    from datetime import datetime
    
    user = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        name="Test User",
        password_hash="$2b$12$test_hashed_password",  # Not a real hash, just for testing
        is_active=True,
        is_verified=True,
        onboarding_completed=True,
        onboarding_step=8,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_portfolio")
def test_portfolio_fixture(session: Session, test_user: User) -> Portfolio:
    """Create a test portfolio for the test user"""
    import uuid
    from datetime import datetime
    
    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Test Portfolio",
        type="personal",
        settings={},
        goal_settings={},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    return portfolio


@pytest.fixture(name="auth_token")
def auth_token_fixture(test_user: User) -> str:
    """Generate a valid JWT token for the test user"""
    token = create_access_token(data={"sub": test_user.id, "email": test_user.email})
    return token


# ============================================================================
# FastAPI TestClient Fixtures
# ============================================================================

@pytest.fixture(name="client")
def client_fixture(
    session: Session,
    test_user: User,
    auth_token: str
) -> Generator[TestClient, None, None]:
    """
    Create a TestClient with:
    - Overridden database session (uses test SQLite)
    - Overridden auth (uses test user)
    - Pre-filled Authorization header
    """
    
    def get_session_override():
        yield session
    
    def get_current_user_override():
        return test_user
    
    # Override dependencies
    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override
    
    # Create client with auth header
    client = TestClient(app)
    client.headers["Authorization"] = f"Bearer {auth_token}"
    
    yield client
    
    # Cleanup
    app.dependency_overrides.clear()


@pytest.fixture(name="unauthenticated_client")
def unauthenticated_client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """
    Create a TestClient without authentication
    Useful for testing auth endpoints and 401 responses
    """
    
    def get_session_override():
        yield session
    
    app.dependency_overrides[get_session] = get_session_override
    
    client = TestClient(app)
    
    yield client
    
    app.dependency_overrides.clear()


# ============================================================================
# Database Access Fixture (for direct DB assertions in tests)
# ============================================================================

@pytest.fixture(name="db")
def db_fixture(session: Session) -> Session:
    """
    Alias for session fixture - provides backwards compatibility
    and cleaner test code when doing direct DB queries
    """
    return session


# ============================================================================
# Cleanup Fixtures
# ============================================================================

@pytest.fixture(autouse=True)
def cleanup_after_test(session: Session):
    """
    Automatically clean up database after each test
    This runs after each test function
    """
    yield
    # Rollback any uncommitted changes
    session.rollback()
