"""
Expense Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class Expense(SQLModel, table=True):
    """
    Expense table
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "expenses"

    # Primary Key
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    category: str = Field(max_length=50)  # housing, food, transport, etc.
    
    # Amount (DECIMAL for precision)
    amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    frequency: str = Field(default="monthly", max_length=50)  # weekly, fortnightly, monthly, annual
    
    # Inflation adjustment
    inflation_rate: Decimal = Field(default=Decimal("2.5"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Duration
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)  # null = ongoing
    
    # Retirement adjustment
    retirement_percentage: Decimal = Field(default=Decimal("100.00"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Tax
    is_tax_deductible: bool = Field(default=False)
    
    # Metadata
    notes: str = Field(default="", max_length=2000)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class ExpenseCreate(SQLModel):
    """Expense creation request"""
    portfolio_id: str
    name: str
    category: str
    amount: Decimal
    frequency: str = "monthly"
    inflation_rate: Decimal = Decimal("2.5")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    retirement_percentage: Decimal = Decimal("100.00")
    is_tax_deductible: bool = False


class ExpenseUpdate(SQLModel):
    """Expense update request"""
    name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[str] = None
    inflation_rate: Optional[Decimal] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    retirement_percentage: Optional[Decimal] = None
    is_tax_deductible: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class ExpenseResponse(SQLModel):
    """Expense response"""
    id: str
    user_id: str
    portfolio_id: str
    name: str
    category: str
    amount: Decimal
    frequency: str
    inflation_rate: Decimal
    start_date: Optional[date]
    end_date: Optional[date]
    retirement_percentage: Decimal
    is_tax_deductible: bool
    notes: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# Expense categories for reference
EXPENSE_CATEGORIES = [
    "housing",
    "food",
    "transport",
    "utilities",
    "insurance",
    "entertainment",
    "health",
    "education",
    "personal",
    "subscriptions",
    "debt_repayment",
    "other"
]
