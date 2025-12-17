from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from models.income import IncomeSource, IncomeSourceCreate, IncomeSourceUpdate
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/income", tags=["income"])


@router.get("/portfolio/{portfolio_id}", response_model=List[IncomeSource])
async def get_portfolio_income(portfolio_id: str):
    """Get all income sources for a portfolio"""
    sources = await db.income_sources.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return sources


@router.post("", response_model=IncomeSource)
async def create_income_source(data: IncomeSourceCreate):
    """Create a new income source"""
    source = IncomeSource(
        user_id=DEV_USER_ID,
        portfolio_id=data.portfolio_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
        amount=data.amount,
        frequency=data.frequency,
        growth_rate=data.growth_rate,
        start_date=data.start_date,
        end_date=data.end_date,
        end_age=data.end_age,
        is_taxable=data.is_taxable
    )
    
    doc = source.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.income_sources.insert_one(doc)
    return source


@router.put("/{income_id}", response_model=IncomeSource)
async def update_income_source(income_id: str, data: IncomeSourceUpdate):
    """Update an income source"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.income_sources.update_one(
        {"id": income_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Income source not found")
    
    source = await db.income_sources.find_one({"id": income_id}, {"_id": 0})
    return source


@router.delete("/{income_id}")
async def delete_income_source(income_id: str):
    """Delete an income source"""
    result = await db.income_sources.delete_one(
        {"id": income_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income source not found")
    
    return {"message": "Income source deleted successfully"}
