from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid


class WithdrawalStrategy(BaseModel):
    type: str = "percentage"  # percentage, fixed, variable
    rate: float = 4.0  # withdrawal rate (e.g., 4% rule)
    adjust_for_inflation: bool = True


class SocialSecurityAssumptions(BaseModel):
    include_age_pension: bool = True
    start_age: int = 67
    estimated_amount: float = 28000  # annual
    partner_amount: float = 0


class ScenarioModification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target_type: str  # property, income, expense, asset, liability, global
    target_id: Optional[str] = None  # null for global changes
    field: str  # field to modify
    modification_type: str  # set, increase, decrease, multiply
    value: Any
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    description: str = ""


class Plan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # REQUIRED for future auth
    portfolio_id: str
    
    name: str
    description: str = ""
    type: str = "fire"  # fire, lean_fire, fat_fire, coast_fire, barista_fire, custom
    
    # Retirement settings
    retirement_age: int = 60
    life_expectancy: int = 95
    
    # Targets
    target_equity: float = 0  # target net worth at retirement
    target_passive_income: float = 0  # annual passive income target
    target_withdrawal_rate: float = 4.0
    
    # Strategies
    withdrawal_strategy: WithdrawalStrategy = Field(default_factory=WithdrawalStrategy)
    social_security: SocialSecurityAssumptions = Field(default_factory=SocialSecurityAssumptions)
    
    # Scenario modifications
    modifications: List[ScenarioModification] = []
    
    # Simulation settings
    simulation_years: int = 50
    inflation_rate: float = 2.5
    use_monte_carlo: bool = False
    monte_carlo_runs: int = 1000
    success_threshold: float = 95.0  # % of simulations that need to succeed
    
    # Status
    is_active: bool = True
    is_baseline: bool = False  # if true, this is the "actual" baseline plan
    
    # Cached results
    last_calculated: Optional[datetime] = None
    success_probability: Optional[float] = None
    projected_fire_age: Optional[int] = None
    projected_fire_year: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PlanCreate(BaseModel):
    portfolio_id: str
    name: str
    description: str = ""
    type: str = "fire"
    retirement_age: int = 60
    target_equity: float = 0
    target_passive_income: float = 0
    modifications: List[ScenarioModification] = []


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    retirement_age: Optional[int] = None
    life_expectancy: Optional[int] = None
    target_equity: Optional[float] = None
    target_passive_income: Optional[float] = None
    target_withdrawal_rate: Optional[float] = None
    withdrawal_strategy: Optional[WithdrawalStrategy] = None
    social_security: Optional[SocialSecurityAssumptions] = None
    modifications: Optional[List[ScenarioModification]] = None
    simulation_years: Optional[int] = None
    inflation_rate: Optional[float] = None
    use_monte_carlo: Optional[bool] = None
    is_active: Optional[bool] = None


# Plan types for reference
PLAN_TYPES = [
    "fire",           # Financial Independence, Retire Early
    "lean_fire",      # Minimal expenses FIRE
    "fat_fire",       # High expenses FIRE
    "coast_fire",     # Stop saving, let investments grow
    "barista_fire",   # Part-time work in retirement
    "traditional",    # Traditional retirement at 65+
    "custom"          # Custom plan
]
