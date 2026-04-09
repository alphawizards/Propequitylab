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
import time
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import jwt
import requests as http_requests
from jwt.algorithms import RSAAlgorithm
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from models.user import User
from utils.database_sql import get_session

logger = logging.getLogger(__name__)

CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

security = HTTPBearer()

# In-memory JWKS key cache: {kid: public_key}, expires after 1 hour
_key_cache: dict[str, Any] = {}
_key_cache_expiry: float = 0


def _get_signing_key(kid: str) -> Any:
    """Fetch the RSA public key for the given kid from Clerk's backend API.

    Uses a 1-hour in-memory cache to avoid repeated JWKS fetches.
    Always uses requests (not urllib) so the Authorization header is sent correctly.
    """
    global _key_cache, _key_cache_expiry

    if time.time() < _key_cache_expiry and kid in _key_cache:
        return _key_cache[kid]

    if not CLERK_SECRET_KEY:
        raise RuntimeError("CLERK_SECRET_KEY environment variable is not set")

    response = http_requests.get(
        "https://api.clerk.com/v1/jwks",
        headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
        timeout=10,
    )
    response.raise_for_status()

    jwks = response.json()
    _key_cache = {
        k["kid"]: RSAAlgorithm.from_jwk(k)
        for k in jwks.get("keys", [])
    }
    _key_cache_expiry = time.time() + 3600

    if kid not in _key_cache:
        logger.error("kid %s not found in Clerk JWKS (available: %s)", kid, list(_key_cache))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    return _key_cache[kid]


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
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        public_key = _get_signing_key(kid)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            # audience is not set by default in Clerk JWTs; skip aud verification
            options={"verify_aud": False},
        )
        return payload
    except HTTPException:
        raise
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
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
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
            user.updated_at = datetime.now(timezone.utc)
            session.add(user)
            session.commit()
            session.refresh(user)
            logger.info("Soft-migrated user %s to Clerk ID %s", user.id, clerk_user_id)
            return user

    # Case 3: New user — auto-provision
    name: str = payload.get("name", "") or payload.get("full_name", "")
    return _provision_user(session, clerk_user_id, email, name)
