"""
Property Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL, JSON
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class PropertyType(str, Enum):
    """Property type enumeration"""
    HOUSE = "house"
    APARTMENT = "apartment"
    TOWNHOUSE = "townhouse"
    UNIT = "unit"
    VILLA = "villa"
    LAND = "land"


class LoanType(str, Enum):
    """Loan type enumeration"""
    INTEREST_ONLY = "interest_only"
    PRINCIPAL_INTEREST = "principal_interest"


class Property(SQLModel, table=True):
    """
    Property table - real estate property entity
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "properties"

    # Primary Key
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Address
    address: str = Field(max_length=500)
    suburb: str = Field(max_length=255)
    state: str = Field(max_length=50)
    postcode: str = Field(max_length=20)
    
    # Property Details
    property_type: str = Field(default="house", max_length=50)
    bedrooms: int = Field(default=3)
    bathrooms: int = Field(default=2)
    car_spaces: int = Field(default=1)
    land_size: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(10, 2)))  # sqm
    building_size: Decimal = Field(default=Decimal("0.00"), sa_column=Column(DECIMAL(10, 2)))  # sqm
    year_built: Optional[int] = Field(default=None)
    
    # Purchase Details (DECIMAL for precision)
    purchase_price: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    purchase_date: date
    stamp_duty: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    purchase_costs: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    
    # Current Valuation (DECIMAL for precision)
    current_value: Decimal = Field(sa_column=Column(DECIMAL(19, 4)))
    last_valuation_date: Optional[date] = Field(default=None)
    
    # Loan Details (stored as JSON with DECIMAL values)
    loan_details: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Rental Details (stored as JSON with DECIMAL values)
    rental_details: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Expenses (stored as JSON with DECIMAL values)
    expenses: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Growth Assumptions (stored as JSON)
    growth_assumptions: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Metadata
    notes: str = Field(default="", max_length=2000)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class LoanDetails(SQLModel):
    """Loan details schema"""
    amount: Decimal = Decimal("0.0000")
    interest_rate: Decimal = Decimal("6.25")  # percentage
    loan_type: str = "interest_only"  # interest_only, principal_interest
    loan_term: int = 30  # years
    lender: str = ""
    offset_balance: Decimal = Decimal("0.0000")


class RentalDetails(SQLModel):
    """Rental details schema"""
    income: Decimal = Decimal("0.0000")
    frequency: str = "weekly"  # weekly, fortnightly, monthly
    vacancy_rate: Decimal = Decimal("2.0")  # percentage
    is_rented: bool = True


class PropertyExpenses(SQLModel):
    """Property expenses schema (annual)"""
    strata: Decimal = Decimal("0.0000")
    council_rates: Decimal = Decimal("0.0000")
    water_rates: Decimal = Decimal("0.0000")
    insurance: Decimal = Decimal("0.0000")
    maintenance: Decimal = Decimal("0.0000")
    property_management: Decimal = Decimal("0.0000")
    land_tax: Decimal = Decimal("0.0000")
    other: Decimal = Decimal("0.0000")


class GrowthAssumptions(SQLModel):
    """Growth assumptions schema"""
    capital_growth_rate: Decimal = Decimal("5.0")  # percentage
    rental_growth_rate: Decimal = Decimal("3.0")  # percentage


class PropertyCreate(SQLModel):
    """Property creation request"""
    portfolio_id: str
    address: str
    suburb: str
    state: str
    postcode: str
    property_type: str = "house"
    bedrooms: int = 3
    bathrooms: int = 2
    car_spaces: int = 1
    land_size: Decimal = Decimal("0.00")
    building_size: Decimal = Decimal("0.00")
    year_built: Optional[int] = None
    purchase_price: Decimal
    purchase_date: str  # Will be converted to date
    stamp_duty: Decimal = Decimal("0.0000")
    purchase_costs: Decimal = Decimal("0.0000")
    current_value: Optional[Decimal] = None
    loan_details: Optional[LoanDetails] = None
    rental_details: Optional[RentalDetails] = None
    expenses: Optional[PropertyExpenses] = None
    growth_assumptions: Optional[GrowthAssumptions] = None


class PropertyUpdate(SQLModel):
    """Property update request"""
    address: Optional[str] = None
    suburb: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    car_spaces: Optional[int] = None
    land_size: Optional[Decimal] = None
    building_size: Optional[Decimal] = None
    year_built: Optional[int] = None
    current_value: Optional[Decimal] = None
    stamp_duty: Optional[Decimal] = None
    purchase_costs: Optional[Decimal] = None
    loan_details: Optional[LoanDetails] = None
    rental_details: Optional[RentalDetails] = None
    expenses: Optional[PropertyExpenses] = None
    growth_assumptions: Optional[GrowthAssumptions] = None
    notes: Optional[str] = None


class PropertyResponse(SQLModel):
    """Property response"""
    id: str
    user_id: str
    portfolio_id: str
    address: str
    suburb: str
    state: str
    postcode: str
    property_type: str
    bedrooms: int
    bathrooms: int
    car_spaces: int
    land_size: Decimal
    building_size: Decimal
    year_built: Optional[int]
    purchase_price: Decimal
    purchase_date: date
    stamp_duty: Decimal
    purchase_costs: Decimal
    current_value: Decimal
    last_valuation_date: Optional[date]
    loan_details: Optional[dict]
    rental_details: Optional[dict]
    expenses: Optional[dict]
    growth_assumptions: Optional[dict]
    notes: str
    created_at: datetime
    updated_at: datetime
