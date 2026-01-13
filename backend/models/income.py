"""
Income Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class IncomeType(str, Enum):
    """Income type enumeration"""
    SALARY = "salary"
    RENTAL = "rental"
    DIVIDEND = "dividend"
    BUSINESS = "business"
    PENSION = "pension"
    OTHER = "other"


class Owner(str, Enum):
    """Owner enumeration"""
    YOU = "you"
    PARTNER = "partner"
    JOINT = "joint"


class Frequency(str, Enum):
    """Frequency enumeration"""
    WEEKLY = "weekly"
    FORTNIGHTLY = "fortnightly"
    MONTHLY = "monthly"
    ANNUAL = "annual"


class IncomeSource(SQLModel, table=True):
    """
    Income source table
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "income_sources"

    # Primary Key
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    type: str = Field(max_length=50)  # salary, rental, dividend, business, pension, other
    owner: str = Field(default="you", max_length=50)  # you, partner, joint
    
    # Amount (DECIMAL for precision)
    amount: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    frequency: str = Field(default="annual", max_length=50)  # weekly, fortnightly, monthly, annual
    
    # Growth
    growth_rate: Decimal = Field(default=Decimal("3.0"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Duration
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)  # null = ongoing
    end_age: Optional[int] = Field(default=None)  # alternative to end_date
    
    # Tax
    is_taxable: bool = Field(default=True)
    tax_deductions: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    
    # Metadata
    notes: str = Field(default="", max_length=2000)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class IncomeSourceCreate(SQLModel):
    """Income source creation request"""
    portfolio_id: str
    name: str
    type: str
    owner: str = "you"
    amount: Decimal
    frequency: str = "annual"
    growth_rate: Decimal = Decimal("3.0")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    end_age: Optional[int] = None
    is_taxable: bool = True


class IncomeSourceUpdate(SQLModel):
    """Income source update request"""
    name: Optional[str] = None
    type: Optional[str] = None
    owner: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[str] = None
    growth_rate: Optional[Decimal] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    end_age: Optional[int] = None
    is_taxable: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class IncomeSourceResponse(SQLModel):
    """Income source response"""
    id: str
    user_id: str
    portfolio_id: str
    name: str
    type: str
    owner: str
    amount: Decimal
    frequency: str
    growth_rate: Decimal
    start_date: Optional[date]
    end_date: Optional[date]
    end_age: Optional[int]
    is_taxable: bool
    tax_deductions: Decimal
    notes: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
