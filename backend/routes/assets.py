"""
Asset Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Asset.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from decimal import Decimal
import logging
import uuid

from models.asset import Asset, AssetCreate, AssetUpdate, ASSET_TYPES
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("/types")
async def get_asset_types():
    """Get list of asset types (static data, no auth required)"""
    return {"types": ASSET_TYPES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Asset])
async def get_portfolio_assets(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all non-property assets for a portfolio
    
    ⚠️ Data Isolation: Only returns assets owned by current_user
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
    
    # Get assets with data isolation
    statement = select(Asset).where(
        Asset.portfolio_id == portfolio_id,
        Asset.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    assets = session.exec(statement).all()
    
    return assets


@router.post("", response_model=Asset, status_code=status.HTTP_201_CREATED)
async def create_asset(
    data: AssetCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new asset
    
    ⚠️ Data Isolation: Asset automatically assigned to current_user
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
    
    # Handle contributions JSON field
    contributions_data = None
    if data.contributions:
        contributions_data = data.contributions.model_dump() if hasattr(data.contributions, 'model_dump') else data.contributions
    
    # Create asset with user_id from authenticated user
    asset = Asset(
        id=str(uuid.uuid4()),
        user_id=current_user.id,  # CRITICAL: Set from authenticated user
        portfolio_id=data.portfolio_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
        institution=data.institution,
        current_value=data.current_value,
        purchase_value=data.purchase_value or data.current_value,
        purchase_date=data.purchase_date,
        contributions=contributions_data,
        expected_return=data.expected_return,
        ticker=data.ticker,
        units=data.units,
        tax_environment=data.tax_environment,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(asset)
    session.commit()
    session.refresh(asset)
    
    logger.info(f"Asset created: {asset.id} for user: {current_user.id}")
    return asset


@router.get("/{asset_id}", response_model=Asset)
async def get_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific asset
    
    ⚠️ Data Isolation: Only returns asset if owned by current_user
    """
    statement = select(Asset).where(
        Asset.id == asset_id,
        Asset.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    asset = session.exec(statement).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found or you don't have access"
        )
    
    return asset


@router.put("/{asset_id}", response_model=Asset)
async def update_asset(
    asset_id: str,
    data: AssetUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update an asset
    
    ⚠️ Data Isolation: Only updates asset if owned by current_user
    """
    # Get asset with data isolation check
    statement = select(Asset).where(
        Asset.id == asset_id,
        Asset.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    asset = session.exec(statement).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found or you don't have access"
        )
    
    # Update fields (only those provided)
    update_data = data.model_dump(exclude_unset=True)
    
    # Handle contributions JSON field
    if 'contributions' in update_data and update_data['contributions']:
        update_data['contributions'] = update_data['contributions'].model_dump() if hasattr(update_data['contributions'], 'model_dump') else update_data['contributions']
    
    for key, value in update_data.items():
        setattr(asset, key, value)
    
    asset.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(asset)
    session.commit()
    session.refresh(asset)
    
    logger.info(f"Asset updated: {asset_id} by user: {current_user.id}")
    return asset


@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete an asset
    
    ⚠️ Data Isolation: Only deletes asset if owned by current_user
    """
    # Get asset with data isolation check
    statement = select(Asset).where(
        Asset.id == asset_id,
        Asset.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    asset = session.exec(statement).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found or you don't have access"
        )
    
    # Delete asset
    session.delete(asset)
    session.commit()
    
    logger.info(f"Asset deleted: {asset_id} by user: {current_user.id}")
    return {"message": "Asset deleted successfully"}
