"""
Authentication Utilities - SQL-Based (PostgreSQL/Neon)
Handles JWT tokens, password hashing, and user authentication
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import secrets
import re

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from models.user import User
from utils.database_sql import get_session
import logging

logger = logging.getLogger(__name__)


# Configuration from environment variables
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
security = HTTPBearer()


# ============================================================================
# PASSWORD UTILITIES
# ============================================================================

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength
    
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    
    return True, ""


# ============================================================================
# JWT TOKEN UTILITIES
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary of data to encode in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create a JWT refresh token
    
    Args:
        data: Dictionary of data to encode in the token
        
    Returns:
        Encoded JWT refresh token string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
        token_type: Type of token to verify ("access" or "refresh")
        
    Returns:
        Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        # Verify token type
        if payload.get("type") != token_type:
            return None
        
        return payload
    except JWTError:
        return None


def generate_verification_token() -> str:
    """
    Generate a secure random token for email verification
    
    Returns:
        Random token string (32 bytes hex)
    """
    return secrets.token_urlsafe(32)


def generate_reset_token() -> str:
    """
    Generate a secure random token for password reset
    
    Returns:
        Random token string (32 bytes hex)
    """
    return secrets.token_urlsafe(32)


# ============================================================================
# USER AUTHENTICATION
# ============================================================================

def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
    
    Args:
        session: SQLModel database session
        email: User email
        password: Plain text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    # Find user by email
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if not user:
        return None
    
    # Verify password
    if not verify_password(password, user.password_hash):
        return None
    
    return user


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get a user by email
    
    Args:
        session: SQLModel database session
        email: User email
        
    Returns:
        User object or None if not found
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: str) -> Optional[User]:
    """
    Get a user by ID
    
    Args:
        session: SQLModel database session
        user_id: User ID (string)
        
    Returns:
        User object or None if not found
    """
    statement = select(User).where(User.id == user_id)
    return session.exec(statement).first()


# ============================================================================
# FASTAPI DEPENDENCIES
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    FastAPI dependency to get the current authenticated user
    
    Args:
        credentials: HTTP Bearer token credentials
        session: SQLModel database session
        
    Returns:
        Current authenticated User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Extract token
    token = credentials.credentials
    
    # Verify token
    payload = verify_token(token, token_type="access")
    if payload is None:
        raise credentials_exception
    
    # Extract user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user = get_user_by_id(session, user_id)
    if user is None:
        logger.warning(f"User not found for ID: {user_id}")
        raise credentials_exception
    
    logger.info(f"Authenticated user: {user.id}, Verified: {user.is_verified}")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    FastAPI dependency to get the current active (verified) user
    """
    # Bypass verification if disabled in env or if it's a dev account
    email_verification_enabled = os.getenv('ENABLE_EMAIL_VERIFICATION', 'true').lower() == 'true'
    is_dev_account = current_user.email.endswith('@propequitylab.com')
    
    if email_verification_enabled and not current_user.is_verified and not is_dev_account:
        logger.warning(f"User {current_user.id} is not verified. Raising 403.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email to continue."
        )
    
    return current_user


# ============================================================================
# TOKEN RESPONSE HELPER
# ============================================================================

def create_token_response(user: User) -> dict:
    """
    Create a token response for a user
    
    Args:
        user: User object
        
    Returns:
        Dictionary with access_token, refresh_token, and user info
    """
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "is_verified": user.is_verified,
            "onboarding_completed": user.onboarding_completed
        }
    }
