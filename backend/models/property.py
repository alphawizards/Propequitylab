from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid


class LoanDetails(BaseModel):
    amount: float = 0
    interest_rate: float = 6.25
    loan_type: str = "interest_only"  # interest_only, principal_interest
    loan_term: int = 30  # years
    lender: str = ""
    offset_balance: float = 0


class RentalDetails(BaseModel):
    income: float = 0
    frequency: str = "weekly"  # weekly, fortnightly, monthly
    vacancy_rate: float = 2.0  # percentage
    is_rented: bool = True


class PropertyExpenses(BaseModel):
    strata: float = 0
    council_rates: float = 0
    water_rates: float = 0
    insurance: float = 0
    maintenance: float = 0
    property_management: float = 0
    land_tax: float = 0
    other: float = 0


class GrowthAssumptions(BaseModel):
    capital_growth_rate: float = 5.0
    rental_growth_rate: float = 3.0


class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    # Address
    address: str
    suburb: str
    state: str
    postcode: str
    
    # Property details
    property_type: str = "house"  # house, apartment, townhouse, unit, villa, land
    bedrooms: int = 3
    bathrooms: int = 2
    car_spaces: int = 1
    land_size: float = 0  # sqm
    building_size: float = 0  # sqm
    year_built: Optional[int] = None
    
    # Purchase details
    purchase_price: float
    purchase_date: str  # ISO date string
    stamp_duty: float = 0
    purchase_costs: float = 0  # legal, inspection, etc.
    
    # Current valuation
    current_value: float
    last_valuation_date: Optional[str] = None
    
    # Loan
    loan_details: LoanDetails = Field(default_factory=LoanDetails)
    
    # Rental
    rental_details: RentalDetails = Field(default_factory=RentalDetails)
    
    # Expenses (annual)
    expenses: PropertyExpenses = Field(default_factory=PropertyExpenses)
    
    # Growth assumptions
    growth_assumptions: GrowthAssumptions = Field(default_factory=GrowthAssumptions)
    
    # Metadata
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PropertyCreate(BaseModel):
    portfolio_id: str
    address: str
    suburb: str
    state: str
    postcode: str
    property_type: str = "house"
    bedrooms: int = 3
    bathrooms: int = 2
    car_spaces: int = 1
    purchase_price: float
    purchase_date: str
    current_value: Optional[float] = None
    loan_details: Optional[LoanDetails] = None
    rental_details: Optional[RentalDetails] = None
    expenses: Optional[PropertyExpenses] = None
    growth_assumptions: Optional[GrowthAssumptions] = None


class PropertyUpdate(BaseModel):
    address: Optional[str] = None
    suburb: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    car_spaces: Optional[int] = None
    current_value: Optional[float] = None
    loan_details: Optional[LoanDetails] = None
    rental_details: Optional[RentalDetails] = None
    expenses: Optional[PropertyExpenses] = None
    growth_assumptions: Optional[GrowthAssumptions] = None
    notes: Optional[str] = None
