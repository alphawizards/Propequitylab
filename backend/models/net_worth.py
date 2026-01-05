"""
Net Worth Snapshot Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL, JSON
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class NetWorthSnapshot(SQLModel, table=True):
    """
    Net worth snapshot table - historical net worth tracking
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "net_worth_snapshots"
    
    # Primary Key
    id: str = Field(primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Snapshot Date
    date: date = Field(index=True)
    
    # Totals (DECIMAL for precision)
    total_assets: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    total_liabilities: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    net_worth: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    
    # Breakdowns (stored as JSON with DECIMAL values)
    asset_breakdown: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    liability_breakdown: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Income/Expense snapshot (DECIMAL for precision)
    monthly_income: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    monthly_expenses: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    monthly_cashflow: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    savings_rate: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Property specific (DECIMAL for precision)
    property_equity: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    property_ltv: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(5, 2)))  # Loan to Value ratio
    
    # Change from previous (DECIMAL for precision)
    change_from_previous: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    change_percentage: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Metadata
    is_manual: bool = Field(default=False)  # true if manually entered vs calculated
    notes: str = Field(default="", max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class AssetBreakdown(SQLModel):
    """Asset breakdown schema"""
    properties: Decimal = Decimal("0.0000")
    super: Decimal = Decimal("0.0000")
    shares: Decimal = Decimal("0.0000")
    etf: Decimal = Decimal("0.0000")
    crypto: Decimal = Decimal("0.0000")
    cash: Decimal = Decimal("0.0000")
    bonds: Decimal = Decimal("0.0000")
    other: Decimal = Decimal("0.0000")


class LiabilityBreakdown(SQLModel):
    """Liability breakdown schema"""
    property_loans: Decimal = Decimal("0.0000")
    car_loans: Decimal = Decimal("0.0000")
    credit_cards: Decimal = Decimal("0.0000")
    hecs: Decimal = Decimal("0.0000")
    personal_loans: Decimal = Decimal("0.0000")
    other: Decimal = Decimal("0.0000")


class NetWorthSnapshotCreate(SQLModel):
    """Net worth snapshot creation request"""
    portfolio_id: str
    date: str  # Will be converted to date
    total_assets: Optional[Decimal] = None
    total_liabilities: Optional[Decimal] = None
    notes: str = ""


class NetWorthSnapshotResponse(SQLModel):
    """Net worth snapshot response"""
    id: str
    user_id: str
    portfolio_id: str
    date: date
    total_assets: Decimal
    total_liabilities: Decimal
    net_worth: Decimal
    asset_breakdown: Optional[dict]
    liability_breakdown: Optional[dict]
    monthly_income: Decimal
    monthly_expenses: Decimal
    monthly_cashflow: Decimal
    savings_rate: Decimal
    property_equity: Decimal
    property_ltv: Decimal
    change_from_previous: Decimal
    change_percentage: Decimal
    is_manual: bool
    notes: str
    created_at: datetime
