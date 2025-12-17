from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class IncomeSource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    name: str
    type: str  # salary, rental, dividend, business, pension, other
    owner: str = "you"  # you, partner, joint
    
    amount: float
    frequency: str = "annual"  # weekly, fortnightly, monthly, annual
    
    # Growth
    growth_rate: float = 3.0  # annual percentage
    
    # Duration
    start_date: Optional[str] = None
    end_date: Optional[str] = None  # null = ongoing
    end_age: Optional[int] = None  # alternative to end_date
    
    # Tax
    is_taxable: bool = True
    tax_deductions: float = 0
    
    # Metadata
    notes: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IncomeSourceCreate(BaseModel):
    portfolio_id: str
    name: str
    type: str
    owner: str = "you"
    amount: float
    frequency: str = "annual"
    growth_rate: float = 3.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    end_age: Optional[int] = None
    is_taxable: bool = True


class IncomeSourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    owner: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None
    growth_rate: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    end_age: Optional[int] = None
    is_taxable: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
