"""
Authentication Routes - SQL-Based (PostgreSQL/Neon)
Handles user registration, login, token refresh, password reset, and email verification
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr

from models.user import User, UserUpdate
from utils.auth import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_verification_token,
    generate_reset_token,
    authenticate_user,
    get_user_by_email,
    get_user_by_id,
    get_current_user,
    create_token_response
)
from utils.database_sql import get_session
from utils.rate_limiter import rate_limit_login, rate_limit_register, rate_limit_password_reset
from utils.email import send_verification_email, send_password_reset_email


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@router.post("/register")
async def register(
    request: Request,
    data: RegisterRequest,
    session: Session = Depends(get_session),
    _rate_limit: None = Depends(rate_limit_register)
):
    """
    Register a new user
    
    Rate limit: 3 requests per hour per IP
    """
    # Validate password strength
    is_valid, error_message = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Check if user already exists
    existing_user = get_user_by_email(session, data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    verification_token = generate_verification_token()
    
    new_user = User(
        id=user_id,
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        is_verified=False,  # Require email verification
        verification_token=verification_token,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # Send verification email
    try:
        await send_verification_email(data.email, data.name, verification_token)
    except Exception as e:
        print(f"⚠️  Failed to send verification email: {e}")
        # Don't fail registration if email fails
    
    return {
        "message": "Registration successful. Please check your email to verify your account.",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "is_verified": new_user.is_verified
        }
    }


@router.post("/login")
async def login(
    request: Request,
    data: LoginRequest,
    session: Session = Depends(get_session),
    _rate_limit: None = Depends(rate_limit_login)
):
    """
    Login with email and password
    
    Rate limit: 5 requests per 15 minutes per IP
    """
    # Authenticate user
    user = authenticate_user(session, data.email, data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your email for the verification link."
        )
    
    # Update last login
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    
    # Create token response
    return create_token_response(user)


@router.post("/refresh")
async def refresh_token(
    data: RefreshTokenRequest,
    session: Session = Depends(get_session)
):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    payload = verify_token(data.refresh_token, token_type="refresh")
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Get user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user from database
    user = get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "is_verified": current_user.is_verified,
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_step": current_user.onboarding_step,
        "subscription_tier": current_user.subscription_tier,
        "created_at": current_user.created_at
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout (client should discard tokens)
    
    Note: With JWT, logout is handled client-side by discarding tokens.
    For additional security, implement token blacklisting with Redis.
    """
    return {"message": "Logged out successfully"}


# ============================================================================
# EMAIL VERIFICATION
# ============================================================================

@router.get("/verify-email")
async def verify_email(
    token: str,
    session: Session = Depends(get_session)
):
    """
    Verify email address with token
    """
    # Find user by verification token
    statement = select(User).where(User.verification_token == token)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    # Mark user as verified
    user.is_verified = True
    user.verification_token = None  # Clear token after use
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    return {
        "message": "Email verified successfully. You can now log in."
    }


@router.post("/resend-verification")
async def resend_verification(
    data: ResendVerificationRequest,
    session: Session = Depends(get_session)
):
    """
    Resend verification email
    """
    # Get user by email
    user = get_user_by_email(session, data.email)
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a verification link has been sent."}
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new verification token
    verification_token = generate_verification_token()
    user.verification_token = verification_token
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    # Send verification email
    try:
        await send_verification_email(user.email, user.name, verification_token)
    except Exception as e:
        print(f"⚠️  Failed to send verification email: {e}")
    
    return {"message": "If the email exists, a verification link has been sent."}


# ============================================================================
# PASSWORD RESET
# ============================================================================

@router.post("/request-password-reset")
async def request_password_reset(
    request: Request,
    data: PasswordResetRequest,
    session: Session = Depends(get_session),
    _rate_limit: None = Depends(rate_limit_password_reset)
):
    """
    Request password reset email
    
    Rate limit: 3 requests per hour per IP
    """
    # Get user by email
    user = get_user_by_email(session, data.email)
    
    if not user:
        # Don't reveal if email exists (security best practice)
        return {"message": "If the email exists, a password reset link has been sent."}
    
    # Generate reset token
    reset_token = generate_reset_token()
    reset_token_expires = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    
    user.reset_token = reset_token
    user.reset_token_expires = reset_token_expires
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    # Send password reset email
    try:
        await send_password_reset_email(user.email, user.name, reset_token)
    except Exception as e:
        print(f"⚠️  Failed to send password reset email: {e}")
    
    return {"message": "If the email exists, a password reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    data: PasswordResetConfirm,
    session: Session = Depends(get_session)
):
    """
    Reset password with token
    """
    # Validate new password strength
    is_valid, error_message = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Find user by reset token
    statement = select(User).where(User.reset_token == data.token)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is expired
    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )
    
    # Update password
    user.password_hash = hash_password(data.new_password)
    user.reset_token = None  # Clear token after use
    user.reset_token_expires = None
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    return {
        "message": "Password reset successfully. You can now log in with your new password."
    }


# ============================================================================
# PROFILE MANAGEMENT
# ============================================================================

class ChangePasswordRequest(BaseModel):
    """Change password request model"""
    current_password: str
    new_password: str


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Change user password (requires current password verification)
    Used in Settings page for password updates
    """
    # Verify current password
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    # Validate new password strength
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )

    # Update password
    current_user.password_hash = hash_password(data.new_password)
    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    session.commit()

    return {
        "message": "Password changed successfully"
    }


@router.put("/profile")
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update user profile information
    Used in Settings page for profile updates
    """
    # Update only provided fields
    update_fields = profile_data.model_dump(exclude_unset=True)

    for field, value in update_fields.items():
        setattr(current_user, field, value)

    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    # Return updated user data (excluding sensitive fields)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "date_of_birth": current_user.date_of_birth,
        "planning_type": current_user.planning_type,
        "country": current_user.country,
        "state": current_user.state,
        "currency": current_user.currency,
        "partner_details": current_user.partner_details,
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_step": current_user.onboarding_step,
        "subscription_tier": current_user.subscription_tier,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }
