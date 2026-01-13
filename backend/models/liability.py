"""
Liability Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class Liability(SQLModel, table=True):
    """
    Liability table - debts and loans
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "liabilities"

    # Primary Key
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    type: str = Field(max_length=50)  # car_loan, credit_card, hecs, personal_loan, margin_loan, other
    owner: str = Field(default="you", max_length=50)  # you, partner, joint
    lender: str = Field(default="", max_length=255)
    
    # Amounts (DECIMAL for precision)
    original_amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    current_balance: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    
    # Interest
    interest_rate: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    is_tax_deductible: bool = Field(default=False)  # for investment loans
    
    # Repayments (DECIMAL for precision)
    minimum_payment: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    payment_frequency: str = Field(default="monthly", max_length=50)  # weekly, fortnightly, monthly
    extra_payment: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    
    # Payoff strategy
    payoff_strategy: str = Field(default="minimum", max_length=50)  # minimum, aggressive, custom
    target_payoff_date: Optional[date] = Field(default=None)
    
    # For HECS/HELP
    is_indexed: bool = Field(default=False)  # indexed to inflation (HECS)
    repayment_threshold: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    
    # Metadata
    notes: str = Field(default="", max_length=2000)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class LiabilityCreate(SQLModel):
    """Liability creation request"""
    portfolio_id: str
    name: str
    type: str
    owner: str = "you"
    lender: str = ""
    original_amount: Decimal
    current_balance: Decimal
    interest_rate: Decimal = Decimal("0.00")
    is_tax_deductible: bool = False
    minimum_payment: Decimal = Decimal("0.0000")
    payment_frequency: str = "monthly"
    payoff_strategy: str = "minimum"


class LiabilityUpdate(SQLModel):
    """Liability update request"""
    name: Optional[str] = None
    type: Optional[str] = None
    owner: Optional[str] = None
    lender: Optional[str] = None
    current_balance: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None
    is_tax_deductible: Optional[bool] = None
    minimum_payment: Optional[Decimal] = None
    payment_frequency: Optional[str] = None
    extra_payment: Optional[Decimal] = None
    payoff_strategy: Optional[str] = None
    target_payoff_date: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class LiabilityResponse(SQLModel):
    """Liability response"""
    id: str
    user_id: str
    portfolio_id: str
    name: str
    type: str
    owner: str
    lender: str
    original_amount: Decimal
    current_balance: Decimal
    interest_rate: Decimal
    is_tax_deductible: bool
    minimum_payment: Decimal
    payment_frequency: str
    extra_payment: Decimal
    payoff_strategy: str
    target_payoff_date: Optional[date]
    is_indexed: bool
    repayment_threshold: Decimal
    notes: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


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
