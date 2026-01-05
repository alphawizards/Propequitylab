"""
Asset Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL, JSON
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class Asset(SQLModel, table=True):
    """
    Asset table - financial assets (super, shares, ETF, crypto, cash, etc.)
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "assets"
    
    # Primary Key
    id: str = Field(primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    type: str = Field(max_length=50)  # super, shares, etf, crypto, cash, bonds, managed_fund, other
    owner: str = Field(default="you", max_length=50)  # you, partner, joint
    institution: str = Field(default="", max_length=255)  # bank/broker name
    
    # Values (DECIMAL for precision)
    current_value: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    purchase_value: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    purchase_date: Optional[date] = Field(default=None)
    
    # Contributions (stored as JSON with DECIMAL values)
    contributions: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Growth
    expected_return: Decimal = Field(default=Decimal("7.0"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    volatility: Decimal = Field(default=Decimal("15.0"), sa_column=Column(DECIMAL(5, 2)))  # standard deviation
    
    # For shares/ETFs
    ticker: Optional[str] = Field(default=None, max_length=20)
    units: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    
    # Tax treatment
    tax_environment: str = Field(default="taxable", max_length=50)  # taxable, tax_deferred, tax_free
    cost_base: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))  # for CGT
    
    # Metadata
    notes: str = Field(default="", max_length=2000)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class ContributionSchedule(SQLModel):
    """Contribution schedule schema"""
    amount: Decimal = Decimal("0.0000")
    frequency: str = "monthly"  # weekly, fortnightly, monthly, annual
    employer_contribution: Decimal = Decimal("0.0000")  # for super
    growth_rate: Decimal = Decimal("3.0")  # annual increase in contributions


class AssetCreate(SQLModel):
    """Asset creation request"""
    portfolio_id: str
    name: str
    type: str
    owner: str = "you"
    institution: str = ""
    current_value: Decimal
    purchase_value: Optional[Decimal] = None
    purchase_date: Optional[str] = None
    contributions: Optional[ContributionSchedule] = None
    expected_return: Decimal = Decimal("7.0")
    ticker: Optional[str] = None
    units: Decimal = Decimal("0.0000")
    tax_environment: str = "taxable"


class AssetUpdate(SQLModel):
    """Asset update request"""
    name: Optional[str] = None
    type: Optional[str] = None
    owner: Optional[str] = None
    institution: Optional[str] = None
    current_value: Optional[Decimal] = None
    contributions: Optional[ContributionSchedule] = None
    expected_return: Optional[Decimal] = None
    ticker: Optional[str] = None
    units: Optional[Decimal] = None
    tax_environment: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class AssetResponse(SQLModel):
    """Asset response"""
    id: str
    user_id: str
    portfolio_id: str
    name: str
    type: str
    owner: str
    institution: str
    current_value: Decimal
    purchase_value: Decimal
    purchase_date: Optional[date]
    contributions: Optional[dict]
    expected_return: Decimal
    volatility: Decimal
    ticker: Optional[str]
    units: Decimal
    tax_environment: str
    cost_base: Decimal
    notes: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Asset types for reference
ASSET_TYPES = [
    "super",           # Superannuation
    "shares",          # Individual stocks
    "etf",             # Exchange Traded Funds
    "managed_fund",    # Managed funds
    "crypto",          # Cryptocurrency
    "cash",            # Cash/Savings accounts
    "bonds",           # Bonds/Fixed income
    "term_deposit",    # Term deposits
    "other"            # Other assets
]
