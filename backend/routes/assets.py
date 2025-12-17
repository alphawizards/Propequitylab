from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from models.asset import Asset, AssetCreate, AssetUpdate, ASSET_TYPES
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/types")
async def get_asset_types():
    """Get list of asset types"""
    return {"types": ASSET_TYPES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Asset])
async def get_portfolio_assets(portfolio_id: str):
    """Get all non-property assets for a portfolio"""
    assets = await db.assets.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return assets


@router.post("", response_model=Asset)
async def create_asset(data: AssetCreate):
    """Create a new asset"""
    asset = Asset(
        user_id=DEV_USER_ID,
        portfolio_id=data.portfolio_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
        institution=data.institution,
        current_value=data.current_value,
        purchase_value=data.purchase_value or data.current_value,
        purchase_date=data.purchase_date,
        contributions=data.contributions if data.contributions else Asset.model_fields['contributions'].default_factory(),
        expected_return=data.expected_return,
        ticker=data.ticker,
        units=data.units,
        tax_environment=data.tax_environment
    )
    
    doc = asset.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.assets.insert_one(doc)
    return asset


@router.get("/{asset_id}", response_model=Asset)
async def get_asset(asset_id: str):
    """Get a specific asset"""
    asset = await db.assets.find_one(
        {"id": asset_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, data: AssetUpdate):
    """Update an asset"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if 'contributions' in update_data:
        update_data['contributions'] = update_data['contributions'].model_dump() if hasattr(update_data['contributions'], 'model_dump') else update_data['contributions']
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.assets.update_one(
        {"id": asset_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    return asset


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    """Delete an asset"""
    result = await db.assets.delete_one(
        {"id": asset_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted successfully"}
