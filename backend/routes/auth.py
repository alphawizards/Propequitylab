"""
Authentication routes for Zapiio
Handles user registration, login, token refresh, password reset, and email verification
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
import secrets
from utils.database import db
from utils.auth import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user
)
from utils.rate_limiter import rate_limit_login, rate_limit_register, rate_limit_password_reset
from utils.email import send_verification_email, send_password_reset_email, send_welcome_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Request/Response Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    planning_type: str = "individual"
    country: str = "Australia"
    state: str = "NSW"
    currency: str = "AUD"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_verified: bool
    planning_type: str
    country: str
    state: str
    currency: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    reset_token: str
    new_password: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, request: Request):
    """Register a new user"""
    # Rate limiting
    await rate_limit_register(request)
    
    # Validate password strength
    is_valid, error_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate unique user ID
    user_id = f"user-{secrets.token_urlsafe(16)}"
    
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    
    # Create user document
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "planning_type": user_data.planning_type,
        "country": user_data.country,
        "state": user_data.state,
        "currency": user_data.currency,
        "is_verified": False,
        "verification_token": verification_token,
        "reset_token": None,
        "reset_token_expires": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    # Insert user into database
    await db.users.insert_one(user_doc)
    
    # Send verification email
    send_verification_email(user_data.email, user_data.name, verification_token)
    
    # Create tokens
    access_token = create_access_token({"sub": user_id, "email": user_data.email})
    refresh_token = create_refresh_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, request: Request):
    """Login with email and password"""
    # Rate limiting
    await rate_limit_login(request)
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create tokens
    access_token = create_access_token({"sub": user["id"], "email": user["email"]})
    refresh_token = create_refresh_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(token_request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        payload = verify_token(token_request.refresh_token, token_type="refresh")
        user_id = payload.get("sub")
        
        # Get user from database
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new access token
        access_token = create_access_token({"sub": user["id"], "email": user["email"]})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=token_request.refresh_token
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        is_verified=current_user.get("is_verified", False),
        planning_type=current_user.get("planning_type", "individual"),
        country=current_user.get("country", "Australia"),
        state=current_user.get("state", "NSW"),
        currency=current_user.get("currency", "AUD")
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout (client should delete tokens)"""
    # In a production system, you might want to blacklist the token here
    return {"message": "Logged out successfully"}


@router.post("/request-password-reset")
async def request_password_reset(reset_request: PasswordResetRequest, request: Request):
    """Request a password reset email"""
    # Rate limiting
    await rate_limit_password_reset(request)
    
    # Find user
    user = await db.users.find_one({"email": reset_request.email})
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Update user with reset token
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "reset_token": reset_token,
                "reset_token_expires": reset_expires,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Send password reset email
    send_password_reset_email(user["email"], user["name"], reset_token)
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    """Reset password using reset token"""
    # Validate new password strength
    is_valid, error_msg = validate_password_strength(reset_data.new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    # Find user with valid reset token
    user = await db.users.find_one({
        "reset_token": reset_data.reset_token,
        "reset_token_expires": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password and clear reset token
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "password_hash": hash_password(reset_data.new_password),
                "reset_token": None,
                "reset_token_expires": None,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Password reset successfully"}


@router.get("/verify-email")
async def verify_email(token: str):
    """Verify email address using verification token"""
    # Find user with verification token
    user = await db.users.find_one({"verification_token": token})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    if user.get("is_verified"):
        return {"message": "Email already verified"}
    
    # Mark email as verified
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "is_verified": True,
                "verification_token": None,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Send welcome email
    send_welcome_email(user["email"], user["name"])
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(resend_request: ResendVerificationRequest):
    """Resend verification email"""
    # Find user
    user = await db.users.find_one({"email": resend_request.email})
    
    if not user:
        # Return success to prevent email enumeration
        return {"message": "If the email exists and is unverified, a verification email has been sent"}
    
    if user.get("is_verified"):
        return {"message": "Email already verified"}
    
    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)
    
    # Update user
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "verification_token": verification_token,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Send verification email
    send_verification_email(user["email"], user["name"], verification_token)
    
    return {"message": "If the email exists and is unverified, a verification email has been sent"}
