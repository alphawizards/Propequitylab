from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    name: str
    category: str  # housing, food, transport, utilities, insurance, entertainment, health, education, personal, other
    
    amount: float
    frequency: str = "monthly"  # weekly, fortnightly, monthly, annual
    
    # Inflation adjustment
    inflation_rate: float = 2.5  # annual percentage
    
    # Duration
    start_date: Optional[str] = None
    end_date: Optional[str] = None  # null = ongoing
    
    # Retirement adjustment
    retirement_percentage: float = 100  # % of current expense in retirement
    
    # Tax
    is_tax_deductible: bool = False
    
    # Metadata
    notes: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ExpenseCreate(BaseModel):
    portfolio_id: str
    name: str
    category: str
    amount: float
    frequency: str = "monthly"
    inflation_rate: float = 2.5
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    retirement_percentage: float = 100
    is_tax_deductible: bool = False


class ExpenseUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None
    inflation_rate: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    retirement_percentage: Optional[float] = None
    is_tax_deductible: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


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
