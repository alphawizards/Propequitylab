"""
Plan Model - SQLModel (PostgreSQL)
Refactored from Pydantic/MongoDB to SQLModel/PostgreSQL
⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for financial precision
"""

import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DECIMAL, JSON
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class Plan(SQLModel, table=True):
    """
    Plan table - FIRE and retirement planning scenarios
    ⚠️ CRITICAL: All currency fields use DECIMAL(19, 4) for precision
    """
    __tablename__ = "plans"

    # Primary Key
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=50)
    
    # Foreign Keys
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    portfolio_id: str = Field(foreign_key="portfolios.id", index=True, max_length=50)
    
    # Basic Info
    name: str = Field(max_length=255)
    description: str = Field(default="", max_length=2000)
    type: str = Field(default="fire", max_length=50)  # fire, lean_fire, fat_fire, coast_fire, barista_fire, custom
    
    # Retirement Settings
    retirement_age: int = Field(default=60)
    life_expectancy: int = Field(default=95)
    
    # Targets (DECIMAL for precision)
    target_equity: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    target_passive_income: Decimal = Field(default=Decimal("0.0000"), sa_column=Column(DECIMAL(19, 4)))
    target_withdrawal_rate: Decimal = Field(default=Decimal("4.0"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Strategies (stored as JSON)
    withdrawal_strategy: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    social_security: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Scenario modifications (stored as JSON array)
    modifications: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    
    # Simulation Settings
    simulation_years: int = Field(default=50)
    inflation_rate: Decimal = Field(default=Decimal("2.5"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    use_monte_carlo: bool = Field(default=False)
    monte_carlo_runs: int = Field(default=1000)
    success_threshold: Decimal = Field(default=Decimal("95.0"), sa_column=Column(DECIMAL(5, 2)))  # percentage
    
    # Status
    is_active: bool = Field(default=True)
    is_baseline: bool = Field(default=False)  # if true, this is the "actual" baseline plan
    
    # Cached Results
    last_calculated: Optional[datetime] = Field(default=None)
    success_probability: Optional[Decimal] = Field(default=None, sa_column=Column(DECIMAL(5, 2)))
    projected_fire_age: Optional[int] = Field(default=None)
    projected_fire_year: Optional[str] = Field(default=None, max_length=10)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API requests/responses

class WithdrawalStrategy(SQLModel):
    """Withdrawal strategy schema"""
    type: str = "percentage"  # percentage, fixed, variable
    rate: Decimal = Decimal("4.0")  # withdrawal rate (e.g., 4% rule)
    adjust_for_inflation: bool = True


class SocialSecurityAssumptions(SQLModel):
    """Social security assumptions schema"""
    include_age_pension: bool = True
    start_age: int = 67
    estimated_amount: Decimal = Decimal("28000.0000")  # annual
    partner_amount: Decimal = Decimal("0.0000")


class ScenarioModification(SQLModel):
    """Scenario modification schema"""
    id: str
    target_type: str  # property, income, expense, asset, liability, global
    target_id: Optional[str] = None  # null for global changes
    field: str  # field to modify
    modification_type: str  # set, increase, decrease, multiply
    value: str  # stored as string, converted as needed
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    description: str = ""


class PlanCreate(SQLModel):
    """Plan creation request"""
    portfolio_id: str
    name: str
    description: str = ""
    type: str = "fire"
    retirement_age: int = 60
    target_equity: Decimal = Decimal("0.0000")
    target_passive_income: Decimal = Decimal("0.0000")
    modifications: List[ScenarioModification] = []


class PlanUpdate(SQLModel):
    """Plan update request"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    retirement_age: Optional[int] = None
    life_expectancy: Optional[int] = None
    target_equity: Optional[Decimal] = None
    target_passive_income: Optional[Decimal] = None
    target_withdrawal_rate: Optional[Decimal] = None
    withdrawal_strategy: Optional[WithdrawalStrategy] = None
    social_security: Optional[SocialSecurityAssumptions] = None
    modifications: Optional[List[ScenarioModification]] = None
    simulation_years: Optional[int] = None
    inflation_rate: Optional[Decimal] = None
    use_monte_carlo: Optional[bool] = None
    monte_carlo_runs: Optional[int] = None
    success_threshold: Optional[Decimal] = None
    is_active: Optional[bool] = None
    is_baseline: Optional[bool] = None


class PlanResponse(SQLModel):
    """Plan response"""
    id: str
    user_id: str
    portfolio_id: str
    name: str
    description: str
    type: str
    retirement_age: int
    life_expectancy: int
    target_equity: Decimal
    target_passive_income: Decimal
    target_withdrawal_rate: Decimal
    withdrawal_strategy: Optional[dict]
    social_security: Optional[dict]
    modifications: Optional[List[dict]]
    simulation_years: int
    inflation_rate: Decimal
    use_monte_carlo: bool
    monte_carlo_runs: int
    success_threshold: Decimal
    is_active: bool
    is_baseline: bool
    last_calculated: Optional[datetime]
    success_probability: Optional[Decimal]
    projected_fire_age: Optional[int]
    projected_fire_year: Optional[str]
    created_at: datetime
    updated_at: datetime


# Plan types for reference
PLAN_TYPES = [
    "fire",         # Financial Independence Retire Early
    "lean_fire",    # Lean FIRE (minimal expenses)
    "fat_fire",     # Fat FIRE (luxury lifestyle)
    "coast_fire",   # Coast FIRE (stop saving, let it grow)
    "barista_fire", # Barista FIRE (part-time work)
    "custom"        # Custom plan
]
