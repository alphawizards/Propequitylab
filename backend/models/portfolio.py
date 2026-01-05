"""
Portfolio Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL, JSON
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class Portfolio(SQLModel, table=True):
    """
    Portfolio table - main portfolio entity
    ⚠️ CRITICAL: Uses DECIMAL(19, 4) for all currency fields
    """
    __tablename__ = "portfolios"
    
    # Primary Key
    id: str = Field(primary_key=True, max_length=50)
    
    # Foreign Key
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    type: str = Field(default="actual", max_length=50)  # actual or scenario
    
    # Members (stored as JSON array)
    members: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    
    # Settings (stored as JSON)
    settings: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    goal_settings: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Financial Summary (DECIMAL for precision)
    total_property_value: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    total_loan_amount: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    total_equity: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    total_assets: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    total_liabilities: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    net_worth: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    annual_income: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    annual_expenses: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    annual_cashflow: Decimal = Field(
        default=Decimal("0.0000"),
        sa_column=Column(DECIMAL(19, 4))
    )
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class PortfolioMember(SQLModel):
    """Portfolio member schema"""
    user_id: str
    role: str = "member"  # owner, admin, member
    invited_at: datetime = Field(default_factory=datetime.utcnow)


class PortfolioSettings(SQLModel):
    """Portfolio settings schema"""
    default_capital_growth_rate: Decimal = Decimal("5.0")
    default_rental_growth_rate: Decimal = Decimal("3.0")
    default_interest_rate: Decimal = Decimal("6.25")
    default_inflation_rate: Decimal = Decimal("2.5")


class GoalSettings(SQLModel):
    """Goal settings schema"""
    retirement_age: int = 65
    equity_target: Decimal = Decimal("10000000.0000")  # $10m default
    passive_income_target: Decimal = Decimal("150000.0000")  # $150k/year
    property_count_target: int = 10


class PortfolioCreate(SQLModel):
    """Portfolio creation request"""
    name: str
    type: str = "actual"
    settings: Optional[PortfolioSettings] = None
    goal_settings: Optional[GoalSettings] = None


class PortfolioUpdate(SQLModel):
    """Portfolio update request"""
    name: Optional[str] = None
    type: Optional[str] = None
    settings: Optional[PortfolioSettings] = None
    goal_settings: Optional[GoalSettings] = None


class PortfolioResponse(SQLModel):
    """Portfolio response"""
    id: str
    user_id: str
    name: str
    type: str
    members: Optional[List[dict]] = None
    settings: Optional[dict] = None
    goal_settings: Optional[dict] = None
    total_property_value: Decimal
    total_loan_amount: Decimal
    total_equity: Decimal
    total_assets: Decimal
    total_liabilities: Decimal
    net_worth: Decimal
    annual_income: Decimal
    annual_expenses: Decimal
    annual_cashflow: Decimal
    created_at: datetime
    updated_at: datetime


class PortfolioSummary(SQLModel):
    """Portfolio summary (for dashboard)"""
    portfolio_id: str
    properties_count: int = 0
    total_value: Decimal = Decimal("0.0000")
    total_debt: Decimal = Decimal("0.0000")
    total_equity: Decimal = Decimal("0.0000")
    total_assets: Decimal = Decimal("0.0000")
    total_liabilities: Decimal = Decimal("0.0000")
    net_worth: Decimal = Decimal("0.0000")
    annual_income: Decimal = Decimal("0.0000")
    annual_expenses: Decimal = Decimal("0.0000")
    annual_cashflow: Decimal = Decimal("0.0000")
    goal_year: Optional[str] = None
