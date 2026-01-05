"""
Plan Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Plan.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
import logging
import uuid

from models.plan import Plan, PlanCreate, PlanUpdate, PLAN_TYPES
from models.portfolio import Portfolio
from models.property import Property
from models.asset import Asset
from models.liability import Liability
from models.income import IncomeSource
from models.expense import Expense
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/plans", tags=["plans"])


class ProjectionInput(BaseModel):
    current_net_worth: float = 0
    annual_savings: float = 0
    expected_return: float = 7.0  # percent
    inflation_rate: float = 2.5  # percent
    withdrawal_rate: float = 4.0  # percent
    current_age: int = 35
    retirement_age: int = 55
    life_expectancy: int = 95
    target_net_worth: Optional[float] = None


class ProjectionYear(BaseModel):
    year: int
    age: int
    net_worth: float
    annual_savings: float
    investment_returns: float
    withdrawals: float
    phase: str  # accumulation, retirement


class ProjectionResult(BaseModel):
    years_to_fire: Optional[int]
    fire_age: Optional[int]
    fire_year: Optional[int]
    fire_number: float
    success_probability: float
    projections: List[ProjectionYear]
    final_net_worth: float
    total_withdrawals: float


@router.get("/types")
async def get_plan_types():
    """Get list of plan types (static data, no auth required)"""
    return {"types": PLAN_TYPES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Plan])
async def get_portfolio_plans(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all plans for a portfolio
    
    ⚠️ Data Isolation: Only returns plans owned by current_user
    """
    # Verify portfolio exists and user has access
    portfolio_stmt = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    )
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Get plans with data isolation
    statement = select(Plan).where(
        Plan.portfolio_id == portfolio_id,
        Plan.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    plans = session.exec(statement).all()
    
    return plans


@router.post("", response_model=Plan, status_code=status.HTTP_201_CREATED)
async def create_plan(
    data: PlanCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new plan
    
    ⚠️ Data Isolation: Plan automatically assigned to current_user
    """
    # Verify portfolio exists and user has access
    portfolio_stmt = select(Portfolio).where(
        Portfolio.id == data.portfolio_id,
        Portfolio.user_id == current_user.id
    )
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Handle modifications JSON field
    modifications_data = None
    if data.modifications:
        modifications_data = [m.model_dump() if hasattr(m, 'model_dump') else m for m in data.modifications]
    
    # Create plan with user_id from authenticated user
    plan = Plan(
        id=str(uuid.uuid4()),
        user_id=current_user.id,  # CRITICAL: Set from authenticated user
        portfolio_id=data.portfolio_id,
        name=data.name,
        description=data.description,
        type=data.type,
        retirement_age=data.retirement_age,
        target_equity=data.target_equity,
        target_passive_income=data.target_passive_income,
        modifications=modifications_data,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(plan)
    session.commit()
    session.refresh(plan)
    
    logger.info(f"Plan created: {plan.id} for user: {current_user.id}")
    return plan


@router.get("/{plan_id}", response_model=Plan)
async def get_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific plan
    
    ⚠️ Data Isolation: Only returns plan if owned by current_user
    """
    statement = select(Plan).where(
        Plan.id == plan_id,
        Plan.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    plan = session.exec(statement).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found or you don't have access"
        )
    
    return plan


@router.put("/{plan_id}", response_model=Plan)
async def update_plan(
    plan_id: str,
    data: PlanUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a plan
    
    ⚠️ Data Isolation: Only updates plan if owned by current_user
    """
    # Get plan with data isolation check
    statement = select(Plan).where(
        Plan.id == plan_id,
        Plan.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    plan = session.exec(statement).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found or you don't have access"
        )
    
    # Update fields (only those provided)
    update_data = data.model_dump(exclude_unset=True)
    
    # Handle nested JSON objects
    if 'withdrawal_strategy' in update_data and update_data['withdrawal_strategy']:
        update_data['withdrawal_strategy'] = update_data['withdrawal_strategy'].model_dump() if hasattr(update_data['withdrawal_strategy'], 'model_dump') else update_data['withdrawal_strategy']
    if 'social_security' in update_data and update_data['social_security']:
        update_data['social_security'] = update_data['social_security'].model_dump() if hasattr(update_data['social_security'], 'model_dump') else update_data['social_security']
    if 'modifications' in update_data and update_data['modifications']:
        update_data['modifications'] = [m.model_dump() if hasattr(m, 'model_dump') else m for m in update_data['modifications']]
    
    for key, value in update_data.items():
        setattr(plan, key, value)
    
    plan.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(plan)
    session.commit()
    session.refresh(plan)
    
    logger.info(f"Plan updated: {plan_id} by user: {current_user.id}")
    return plan


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a plan
    
    ⚠️ Data Isolation: Only deletes plan if owned by current_user
    """
    # Get plan with data isolation check
    statement = select(Plan).where(
        Plan.id == plan_id,
        Plan.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    plan = session.exec(statement).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found or you don't have access"
        )
    
    # Delete plan
    session.delete(plan)
    session.commit()
    
    logger.info(f"Plan deleted: {plan_id} by user: {current_user.id}")
    return {"message": "Plan deleted successfully"}


@router.post("/project", response_model=ProjectionResult)
async def calculate_projection(data: ProjectionInput):
    """Calculate financial projections based on input parameters (pure calculation, no DB)"""
    current_year = datetime.now().year
    nominal_return = data.expected_return / 100
    inflation = data.inflation_rate / 100
    withdrawal_rate = data.withdrawal_rate / 100
    
    # Calculate FIRE number
    if data.target_net_worth:
        fire_number = data.target_net_worth
    else:
        # Default: 25x annual expenses (4% rule equivalent)
        annual_expenses = data.annual_savings * 0.5 if data.annual_savings > 0 else 50000
        fire_number = annual_expenses * (1 / withdrawal_rate) if withdrawal_rate > 0 else annual_expenses * 25
    
    projections = []
    net_worth = data.current_net_worth
    years_to_fire = None
    fire_age = None
    fire_year = None
    total_withdrawals = 0
    
    # Calculate until life expectancy
    years_to_calculate = data.life_expectancy - data.current_age
    
    for year in range(years_to_calculate + 1):
        age = data.current_age + year
        calc_year = current_year + year
        is_retired = age >= data.retirement_age
        
        # Calculate returns and savings/withdrawals
        investment_returns = net_worth * nominal_return
        
        if is_retired:
            # Withdrawal phase - use withdrawal rate
            withdrawals = net_worth * withdrawal_rate
            annual_savings = 0
            total_withdrawals += withdrawals
            phase = "retirement"
        else:
            # Accumulation phase
            withdrawals = 0
            annual_savings = data.annual_savings
            phase = "accumulation"
        
        # Record projection point
        projections.append(ProjectionYear(
            year=calc_year,
            age=age,
            net_worth=round(net_worth, 2),
            annual_savings=round(annual_savings, 2),
            investment_returns=round(investment_returns, 2),
            withdrawals=round(withdrawals, 2),
            phase=phase
        ))
        
        # Check if FIRE achieved
        if net_worth >= fire_number and years_to_fire is None:
            years_to_fire = year
            fire_age = age
            fire_year = calc_year
        
        # Update net worth for next year
        net_worth = net_worth + investment_returns + annual_savings - withdrawals
        
        # Apply inflation adjustment to withdrawals
        if is_retired:
            net_worth = net_worth * (1 - inflation * 0.5)  # Partial inflation impact
    
    # Calculate success probability (simplified - portfolio survives)
    final_net_worth = net_worth
    success_probability = 100.0 if final_net_worth > 0 else 0.0
    
    # Adjust based on how much is left relative to fire number
    if fire_number > 0:
        success_probability = min(100.0, (final_net_worth / fire_number) * 100 * 0.5 + 50)
    
    return ProjectionResult(
        years_to_fire=years_to_fire,
        fire_age=fire_age,
        fire_year=fire_year,
        fire_number=round(fire_number, 2),
        success_probability=round(success_probability, 1),
        projections=projections,
        final_net_worth=round(final_net_worth, 2),
        total_withdrawals=round(total_withdrawals, 2)
    )


@router.get("/{plan_id}/projections")
async def get_plan_projections(
    plan_id: str,
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get projections for a specific plan using portfolio data
    
    ⚠️ Data Isolation: Only calculates projections if plan/portfolio owned by current_user
    """
    # Get plan with data isolation
    plan_stmt = select(Plan).where(
        Plan.id == plan_id,
        Plan.user_id == current_user.id
    )
    plan = session.exec(plan_stmt).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found or you don't have access"
        )
    
    # Verify portfolio access
    portfolio_stmt = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    )
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Get portfolio data with data isolation
    properties = session.exec(
        select(Property).where(Property.portfolio_id == portfolio_id, Property.user_id == current_user.id)
    ).all()
    assets = session.exec(
        select(Asset).where(Asset.portfolio_id == portfolio_id, Asset.user_id == current_user.id, Asset.is_active == True)
    ).all()
    liabilities = session.exec(
        select(Liability).where(Liability.portfolio_id == portfolio_id, Liability.user_id == current_user.id, Liability.is_active == True)
    ).all()
    income_sources = session.exec(
        select(IncomeSource).where(IncomeSource.portfolio_id == portfolio_id, IncomeSource.user_id == current_user.id, IncomeSource.is_active == True)
    ).all()
    expenses = session.exec(
        select(Expense).where(Expense.portfolio_id == portfolio_id, Expense.user_id == current_user.id, Expense.is_active == True)
    ).all()
    
    # Calculate totals using Python sum with Decimal
    property_value = sum((p.current_value or Decimal(0)) for p in properties)
    property_loans = sum((p.loan_amount or Decimal(0)) for p in properties if hasattr(p, 'loan_amount'))
    total_assets = property_value + sum((a.current_value or Decimal(0)) for a in assets)
    total_liabilities = property_loans + sum((l.current_balance or Decimal(0)) for l in liabilities)
    
    net_worth = float(total_assets - total_liabilities)
    
    # Calculate monthly/annual figures
    def to_monthly(amount, frequency):
        if amount is None:
            return 0
        multipliers = {'weekly': 4.33, 'fortnightly': 2.17, 'monthly': 1, 'annual': 1/12}
        return float(amount) * multipliers.get(frequency, 1)
    
    monthly_income = sum(to_monthly(i.amount, i.frequency) for i in income_sources)
    monthly_expenses = sum(to_monthly(e.amount, e.frequency) for e in expenses)
    annual_savings = (monthly_income - monthly_expenses) * 12
    
    # Create projection input from plan settings
    projection_input = ProjectionInput(
        current_net_worth=net_worth,
        annual_savings=annual_savings,
        expected_return=7.0,  # Default
        inflation_rate=float(plan.inflation_rate) if plan.inflation_rate else 2.5,
        withdrawal_rate=float(plan.target_withdrawal_rate) if plan.target_withdrawal_rate else 4.0,
        current_age=35,  # Default - should come from user profile
        retirement_age=plan.retirement_age or 55,
        life_expectancy=plan.life_expectancy or 95,
        target_net_worth=float(plan.target_equity) if plan.target_equity and plan.target_equity > 0 else None
    )
    
    return await calculate_projection(projection_input)
