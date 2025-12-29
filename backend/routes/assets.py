from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from pydantic import BaseModel
from models.asset import Asset, AssetCreate, AssetUpdate, ASSET_TYPES
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/assets", tags=["assets"])


class SuperProjectionRequest(BaseModel):
    current_balance: float
    income_gross: float
    employer_contribution_rate: float = 11.5  # Current SG rate
    personal_contribution_rate: float = 0
    personal_contribution_amount: float = 0  # annual fixed
    expected_return: float = 7.0
    years: int = 30
    salary_growth_rate: float = 3.0
    inflation_rate: float = 2.5


class YearlyProjection(BaseModel):
    year: int
    age_offset: int
    balance_nominal: float
    balance_real: float  # adjusted for inflation
    total_contributions: float
    total_growth: float


class SuperProjectionResponse(BaseModel):
    projections: List[YearlyProjection]
    final_balance_nominal: float
    final_balance_real: float


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


@router.post("/project-super", response_model=SuperProjectionResponse)
async def project_super(data: SuperProjectionRequest):
    """Calculate superannuation projection"""

    projections = []

    current_balance = data.current_balance
    current_salary = data.income_gross
    total_contributions = 0
    total_growth = 0
    accumulated_inflation = 1.0

    # Constants
    TAX_RATE_CONTRIBUTIONS = 0.15

    for year in range(1, data.years + 1):
        # 1. Calculate contributions for the year
        employer_contrib = current_salary * (data.employer_contribution_rate / 100)
        personal_contrib = (current_salary * (data.personal_contribution_rate / 100)) + data.personal_contribution_amount

        # Apply tax (assuming concessional caps aren't breached for simplicity,
        # though in real app we'd check the $27.5k cap)
        net_contrib = (employer_contrib + personal_contrib) * (1 - TAX_RATE_CONTRIBUTIONS)

        # 2. Add contributions to balance (assume mid-year for averaging, or simplified at end)
        # Simplified: Start Bal + Growth + Contribs

        growth = current_balance * (data.expected_return / 100)

        # Update balance
        current_balance += growth + net_contrib

        total_contributions += net_contrib
        total_growth += growth

        # Update salary for next year
        current_salary *= (1 + data.salary_growth_rate / 100)

        # Inflation adjustment
        accumulated_inflation *= (1 + data.inflation_rate / 100)
        real_balance = current_balance / accumulated_inflation

        projections.append(YearlyProjection(
            year=datetime.now().year + year,
            age_offset=year,
            balance_nominal=round(current_balance, 2),
            balance_real=round(real_balance, 2),
            total_contributions=round(total_contributions, 2),
            total_growth=round(total_growth, 2)
        ))

    return SuperProjectionResponse(
        projections=projections,
        final_balance_nominal=round(current_balance, 2),
        final_balance_real=round(projections[-1].balance_real, 2)
    )
