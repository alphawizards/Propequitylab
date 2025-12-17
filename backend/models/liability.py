from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class Liability(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    name: str
    type: str  # car_loan, credit_card, hecs, personal_loan, margin_loan, other
    owner: str = "you"  # you, partner, joint
    lender: str = ""
    
    # Amounts
    original_amount: float
    current_balance: float
    
    # Interest
    interest_rate: float = 0
    is_tax_deductible: bool = False  # for investment loans
    
    # Repayments
    minimum_payment: float = 0
    payment_frequency: str = "monthly"  # weekly, fortnightly, monthly
    extra_payment: float = 0  # additional payments above minimum
    
    # Payoff strategy
    payoff_strategy: str = "minimum"  # minimum, aggressive, custom
    target_payoff_date: Optional[str] = None
    
    # For HECS/HELP
    is_indexed: bool = False  # indexed to inflation (HECS)
    repayment_threshold: float = 0  # income threshold for compulsory repayment
    
    # Metadata
    notes: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LiabilityCreate(BaseModel):
    portfolio_id: str
    name: str
    type: str
    owner: str = "you"
    lender: str = ""
    original_amount: float
    current_balance: float
    interest_rate: float = 0
    is_tax_deductible: bool = False
    minimum_payment: float = 0
    payment_frequency: str = "monthly"
    payoff_strategy: str = "minimum"


class LiabilityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    owner: Optional[str] = None
    lender: Optional[str] = None
    current_balance: Optional[float] = None
    interest_rate: Optional[float] = None
    is_tax_deductible: Optional[bool] = None
    minimum_payment: Optional[float] = None
    payment_frequency: Optional[str] = None
    extra_payment: Optional[float] = None
    payoff_strategy: Optional[str] = None
    target_payoff_date: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


# Liability types for reference
LIABILITY_TYPES = [
    "car_loan",
    "credit_card",
    "hecs",           # HECS-HELP student loan
    "personal_loan",
    "margin_loan",    # Investment margin loan
    "buy_now_pay_later",
    "other"
]
