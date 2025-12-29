from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class ContributionSchedule(BaseModel):
    amount: float = 0
    frequency: str = "monthly"  # weekly, fortnightly, monthly, annual

    # Super specific
    contribution_type: str = "fixed"  # fixed, percentage
    income_gross: float = 0  # if percentage, base this on
    employer_contribution: float = 0  # fixed amount
    employer_contribution_rate: float = 0  # percentage (e.g., 11.5)
    personal_contribution_rate: float = 0  # percentage salary sacrifice

    growth_rate: float = 3.0  # annual increase in contributions


class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    name: str
    type: str  # super, shares, etf, crypto, cash, bonds, managed_fund, other
    owner: str = "you"  # you, partner, joint
    institution: str = ""  # bank/broker name
    
    # Values
    current_value: float
    purchase_value: float = 0
    purchase_date: Optional[str] = None
    
    # Contributions
    contributions: ContributionSchedule = Field(default_factory=ContributionSchedule)
    
    # Growth
    expected_return: float = 7.0  # annual percentage
    volatility: float = 15.0  # standard deviation for Monte Carlo
    
    # For shares/ETFs
    ticker: Optional[str] = None
    units: float = 0
    
    # Tax treatment
    tax_environment: str = "taxable"  # taxable, tax_deferred (super), tax_free
    cost_base: float = 0  # for CGT calculations
    
    # Metadata
    notes: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AssetCreate(BaseModel):
    portfolio_id: str
    name: str
    type: str
    owner: str = "you"
    institution: str = ""
    current_value: float
    purchase_value: Optional[float] = None
    purchase_date: Optional[str] = None
    contributions: Optional[ContributionSchedule] = None
    expected_return: float = 7.0
    ticker: Optional[str] = None
    units: float = 0
    tax_environment: str = "taxable"


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    owner: Optional[str] = None
    institution: Optional[str] = None
    current_value: Optional[float] = None
    contributions: Optional[ContributionSchedule] = None
    expected_return: Optional[float] = None
    ticker: Optional[str] = None
    units: Optional[float] = None
    tax_environment: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


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
