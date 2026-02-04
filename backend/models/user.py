"""
User Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from pydantic import EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class PlanningType(str, Enum):
    """Planning type enumeration"""
    INDIVIDUAL = "individual"
    COUPLE = "couple"
    FAMILY = "family"


class SubscriptionTier(str, Enum):
    """Subscription tier enumeration"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class User(SQLModel, table=True):
    """
    User table - main user entity with authentication and profile fields
    """
    __tablename__ = "users"
    
    # Primary Key
    id: str = Field(primary_key=True, max_length=50)
    
    # Authentication
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    is_verified: bool = Field(default=False)
    verification_token: Optional[str] = Field(default=None, max_length=255)
    reset_token: Optional[str] = Field(default=None, max_length=255)
    reset_token_expires: Optional[datetime] = Field(default=None)
    
    # Profile
    name: str = Field(max_length=255)
    date_of_birth: Optional[str] = Field(default=None, max_length=50)
    planning_type: str = Field(default="individual", max_length=50)
    country: str = Field(default="Australia", max_length=100)
    state: str = Field(default="NSW", max_length=50)
    currency: str = Field(default="AUD", max_length=10)
    
    # Partner details (stored as JSON)
    partner_details: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Onboarding
    onboarding_completed: bool = Field(default=False)
    onboarding_step: int = Field(default=0)
    
    # Subscription
    subscription_tier: str = Field(default="free", max_length=50)

    # GDPR - Account Deletion
    deleted_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class UserCreate(SQLModel):
    """User creation request"""
    email: EmailStr
    password: str
    name: str
    date_of_birth: Optional[str] = None
    planning_type: str = "individual"
    country: str = "Australia"
    state: str = "NSW"
    currency: str = "AUD"


class UserLogin(SQLModel):
    """User login request"""
    email: EmailStr
    password: str


class UserUpdate(SQLModel):
    """User update request"""
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    planning_type: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    currency: Optional[str] = None
    partner_details: Optional[dict] = None
    onboarding_completed: Optional[bool] = None
    onboarding_step: Optional[int] = None


class UserResponse(SQLModel):
    """User response (excludes password_hash)"""
    id: str
    email: str
    name: str
    date_of_birth: Optional[str] = None
    planning_type: str
    country: str
    state: str
    currency: str
    partner_details: Optional[dict] = None
    onboarding_completed: bool
    onboarding_step: int
    subscription_tier: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class PartnerDetails(SQLModel):
    """Partner details schema"""
    name: str = ""
    date_of_birth: Optional[str] = None
    retirement_age: int = 65
