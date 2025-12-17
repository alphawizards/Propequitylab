from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class PortfolioMember(BaseModel):
    user_id: str
    role: str = "member"  # owner, admin, member
    invited_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PortfolioSettings(BaseModel):
    default_capital_growth_rate: float = 5.0
    default_rental_growth_rate: float = 3.0
    default_interest_rate: float = 6.25
    default_inflation_rate: float = 2.5


class GoalSettings(BaseModel):
    retirement_age: int = 65
    equity_target: float = 10000000  # $10m default
    passive_income_target: float = 150000  # $150k/year
    property_count_target: int = 10


class Portfolio(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Owner's user ID - REQUIRED for future auth
    name: str
    type: str = "actual"  # actual or scenario
    members: List[PortfolioMember] = []
    settings: PortfolioSettings = Field(default_factory=PortfolioSettings)
    goal_settings: GoalSettings = Field(default_factory=GoalSettings)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PortfolioCreate(BaseModel):
    name: str
    type: str = "actual"
    settings: Optional[PortfolioSettings] = None
    goal_settings: Optional[GoalSettings] = None


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    settings: Optional[PortfolioSettings] = None
    goal_settings: Optional[GoalSettings] = None


class PortfolioSummary(BaseModel):
    portfolio_id: str
    properties_count: int = 0
    total_value: float = 0.0
    total_debt: float = 0.0
    total_equity: float = 0.0
    total_assets: float = 0.0
    total_liabilities: float = 0.0
    net_worth: float = 0.0
    annual_income: float = 0.0
    annual_expenses: float = 0.0
    annual_cashflow: float = 0.0
    goal_year: Optional[str] = None
