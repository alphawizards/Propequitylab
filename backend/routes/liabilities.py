from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from models.liability import Liability, LiabilityCreate, LiabilityUpdate, LIABILITY_TYPES
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/liabilities", tags=["liabilities"])


@router.get("/types")
async def get_liability_types():
    """Get list of liability types"""
    return {"types": LIABILITY_TYPES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Liability])
async def get_portfolio_liabilities(portfolio_id: str):
    """Get all non-property liabilities for a portfolio"""
    liabilities = await db.liabilities.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return liabilities


@router.post("", response_model=Liability)
async def create_liability(data: LiabilityCreate):
    """Create a new liability"""
    liability = Liability(
        user_id=DEV_USER_ID,
        portfolio_id=data.portfolio_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
        lender=data.lender,
        original_amount=data.original_amount,
        current_balance=data.current_balance,
        interest_rate=data.interest_rate,
        is_tax_deductible=data.is_tax_deductible,
        minimum_payment=data.minimum_payment,
        payment_frequency=data.payment_frequency,
        payoff_strategy=data.payoff_strategy
    )
    
    doc = liability.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.liabilities.insert_one(doc)
    return liability


@router.get("/{liability_id}", response_model=Liability)
async def get_liability(liability_id: str):
    """Get a specific liability"""
    liability = await db.liabilities.find_one(
        {"id": liability_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    )
    if not liability:
        raise HTTPException(status_code=404, detail="Liability not found")
    return liability


@router.put("/{liability_id}", response_model=Liability)
async def update_liability(liability_id: str, data: LiabilityUpdate):
    """Update a liability"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.liabilities.update_one(
        {"id": liability_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    liability = await db.liabilities.find_one({"id": liability_id}, {"_id": 0})
    return liability


@router.delete("/{liability_id}")
async def delete_liability(liability_id: str):
    """Delete a liability"""
    result = await db.liabilities.delete_one(
        {"id": liability_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Liability not found")
    
    return {"message": "Liability deleted successfully"}
