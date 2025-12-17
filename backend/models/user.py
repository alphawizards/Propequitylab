from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class PartnerDetails(BaseModel):
    name: str = ""
    date_of_birth: Optional[str] = None
    retirement_age: int = 65


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    date_of_birth: Optional[str] = None
    planning_type: str = "individual"  # individual or couple
    country: str = "Australia"
    state: str = "NSW"
    currency: str = "AUD"
    partner_details: Optional[PartnerDetails] = None
    onboarding_completed: bool = False
    onboarding_step: int = 0
    subscription_tier: str = "free"  # free, pro, enterprise
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(BaseModel):
    email: str
    name: str
    date_of_birth: Optional[str] = None
    planning_type: str = "individual"
    country: str = "Australia"
    state: str = "NSW"
    currency: str = "AUD"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    planning_type: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    currency: Optional[str] = None
    partner_details: Optional[PartnerDetails] = None
    onboarding_completed: Optional[bool] = None
    onboarding_step: Optional[int] = None
