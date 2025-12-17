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
