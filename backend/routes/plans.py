from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import math

from models.plan import Plan, PlanCreate, PlanUpdate, PLAN_TYPES
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/plans", tags=["plans"])


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
    """Get list of plan types"""
    return {"types": PLAN_TYPES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Plan])
async def get_portfolio_plans(portfolio_id: str):
    """Get all plans for a portfolio"""
    plans = await db.plans.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return plans


@router.post("", response_model=Plan)
async def create_plan(data: PlanCreate):
    """Create a new plan"""
    plan = Plan(
        user_id=DEV_USER_ID,
        portfolio_id=data.portfolio_id,
        name=data.name,
        description=data.description,
        type=data.type,
        retirement_age=data.retirement_age,
        target_equity=data.target_equity,
        target_passive_income=data.target_passive_income,
        modifications=data.modifications
    )
    
    doc = plan.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['last_calculated']:
        doc['last_calculated'] = doc['last_calculated'].isoformat()
    
    await db.plans.insert_one(doc)
    return plan


@router.get("/{plan_id}", response_model=Plan)
async def get_plan(plan_id: str):
    """Get a specific plan"""
    plan = await db.plans.find_one(
        {"id": plan_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.put("/{plan_id}", response_model=Plan)
async def update_plan(plan_id: str, data: PlanUpdate):
    """Update a plan"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # Handle nested objects
    if 'withdrawal_strategy' in update_data:
        update_data['withdrawal_strategy'] = update_data['withdrawal_strategy'].model_dump() if hasattr(update_data['withdrawal_strategy'], 'model_dump') else update_data['withdrawal_strategy']
    if 'social_security' in update_data:
        update_data['social_security'] = update_data['social_security'].model_dump() if hasattr(update_data['social_security'], 'model_dump') else update_data['social_security']
    if 'modifications' in update_data:
        update_data['modifications'] = [m.model_dump() if hasattr(m, 'model_dump') else m for m in update_data['modifications']]
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.plans.update_one(
        {"id": plan_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    return plan


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str):
    """Delete a plan"""
    result = await db.plans.delete_one(
        {"id": plan_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {"message": "Plan deleted successfully"}


@router.post("/project", response_model=ProjectionResult)
async def calculate_projection(data: ProjectionInput):
    """Calculate financial projections based on input parameters"""
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
async def get_plan_projections(plan_id: str, portfolio_id: str):
    """Get projections for a specific plan using portfolio data"""
    # Get plan
    plan = await db.plans.find_one(
        {"id": plan_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Get portfolio summary data
    properties = await db.properties.find({"portfolio_id": portfolio_id}).to_list(1000)
    assets = await db.assets.find({"portfolio_id": portfolio_id, "is_active": True}).to_list(1000)
    liabilities = await db.liabilities.find({"portfolio_id": portfolio_id, "is_active": True}).to_list(1000)
    income_sources = await db.income_sources.find({"portfolio_id": portfolio_id, "is_active": True}).to_list(1000)
    expenses = await db.expenses.find({"portfolio_id": portfolio_id, "is_active": True}).to_list(1000)
    
    # Calculate totals
    property_value = sum(p.get('current_value', 0) for p in properties)
    property_loans = sum(p.get('loan_details', {}).get('amount', 0) for p in properties)
    total_assets = property_value + sum(a.get('current_value', 0) for a in assets)
    total_liabilities = property_loans + sum(l.get('current_balance', 0) for l in liabilities)
    
    net_worth = total_assets - total_liabilities
    
    # Calculate monthly/annual figures
    def to_monthly(amount, frequency):
        multipliers = {'weekly': 4.33, 'fortnightly': 2.17, 'monthly': 1, 'annual': 1/12}
        return amount * multipliers.get(frequency, 1)
    
    monthly_income = sum(to_monthly(i.get('amount', 0), i.get('frequency', 'monthly')) for i in income_sources)
    monthly_expenses = sum(to_monthly(e.get('amount', 0), e.get('frequency', 'monthly')) for e in expenses)
    annual_savings = (monthly_income - monthly_expenses) * 12
    
    # Create projection input from plan settings
    projection_input = ProjectionInput(
        current_net_worth=net_worth,
        annual_savings=annual_savings,
        expected_return=7.0,  # Default
        inflation_rate=plan.get('inflation_rate', 2.5),
        withdrawal_rate=plan.get('target_withdrawal_rate', 4.0),
        current_age=35,  # Default - should come from user profile
        retirement_age=plan.get('retirement_age', 55),
        life_expectancy=plan.get('life_expectancy', 95),
        target_net_worth=plan.get('target_equity', 0) if plan.get('target_equity', 0) > 0 else None
    )
    
    return await calculate_projection(projection_input)
