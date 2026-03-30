"""
Clerk JWT verification and user resolution.

This module provides a Clerk-aware get_current_user dependency that:
1. Verifies the incoming Clerk JWT against Clerk's JWKS endpoint
2. Resolves the Clerk user ID to a local User record
3. Handles soft migration (existing users linked by email on first Clerk sign-in)
4. Auto-provisions new users with Account + Membership + Subscription records

Usage: activated when CLERK_JWKS_URL env var is set (see utils/auth.py conditional import).
"""

import os
import logging
import uuid
from datetime import datetime
from typing import Optional

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from models.user import User
from utils.database_sql import get_session

logger = logging.getLogger(__name__)

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")

security = HTTPBearer()

# Module-level singleton — caches JWKS public keys to avoid rate limiting
_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> PyJWKClient:
    """Return cached PyJWKClient, creating it on first call."""
    global _jwks_client
    if _jwks_client is None:
        if not CLERK_JWKS_URL:
            raise RuntimeError("CLERK_JWKS_URL environment variable is not set")
        # Cache keys for 1 hour to avoid JWKS endpoint rate limits
        _jwks_client = PyJWKClient(CLERK_JWKS_URL, cache_keys=True, lifespan=3600)
    return _jwks_client


def _verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk-issued JWT and return the decoded payload.

    Args:
        token: Raw JWT string from Authorization header.

    Returns:
        Decoded JWT payload dict.

    Raises:
        HTTPException 401 on any verification failure.
    """
    try:
        jwks_client = _get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            # audience is not set by default in Clerk JWTs; skip aud verification
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except Exception:
        logger.exception("Clerk token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def _provision_user(session: Session, clerk_user_id: str, email: str, name: str) -> User:
    """
    Create a new local User with default Account, Membership, and Subscription.

    Args:
        session: Active DB session.
        clerk_user_id: Clerk user ID from JWT sub claim.
        email: User's primary email address.
        name: User's display name.

    Returns:
        Newly created and refreshed User object.
    """
    # Import here to avoid circular imports at module level
    from models.account import Account
    from models.account_membership import AccountMembership
    from models.subscription import Subscription

    user = User(
        id=str(uuid.uuid4()),
        email=email,
        password_hash="clerk_managed",
        name=name or email.split("@")[0],
        clerk_user_id=clerk_user_id,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    account = Account(
        name=f"{user.name}'s Account",
        owner_user_id=user.id,
    )
    session.add(account)
    session.commit()
    session.refresh(account)

    membership = AccountMembership(
        account_id=account.id,
        user_id=user.id,
        role="owner",
    )
    session.add(membership)

    subscription = Subscription(
        account_id=account.id,
        plan_key="free",
    )
    session.add(subscription)
    session.commit()

    logger.info("Provisioned new user %s with account %s", user.id, account.id)
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    FastAPI dependency: verify Clerk JWT and return the local User record.

    Handles three cases:
    1. Known user (clerk_user_id matches) — direct lookup.
    2. Soft migration (email matches, no clerk_user_id yet) — link and save.
    3. New user — auto-provision User + Account + Membership + Subscription.

    The returned User.id (internal UUID) is used for all data isolation queries.
    Never use clerk_user_id directly in data queries.

    Args:
        credentials: Bearer token from Authorization header.
        session: DB session from get_session dependency.

    Returns:
        Authenticated local User object.
    """
    payload = _verify_clerk_token(credentials.credentials)

    clerk_user_id: Optional[str] = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing sub claim",
        )

    # Case 1: Known user with clerk_user_id already linked
    user = session.exec(
        select(User).where(User.clerk_user_id == clerk_user_id)
    ).first()
    if user:
        return user

    # Extract email from token (Clerk puts it at root level for session tokens)
    email: str = payload.get("email", "")

    # Case 2: Soft migration — existing user matching by email
    if email:
        user = session.exec(
            select(User).where(User.email == email)
        ).first()
        if user:
            user.clerk_user_id = clerk_user_id
            user.updated_at = datetime.utcnow()
            session.add(user)
            session.commit()
            session.refresh(user)
            logger.info("Soft-migrated user %s to Clerk ID %s", user.id, clerk_user_id)
            return user

    # Case 3: New user — auto-provision
    name: str = payload.get("name", "") or payload.get("full_name", "")
    return _provision_user(session, clerk_user_id, email, name)
