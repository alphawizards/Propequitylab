"""
Property Routes - SQL-Based with Authentication & Data Isolation (GOLDEN MASTER)
⚠️ CRITICAL: All queries include .where(Property.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import logging

from models.property import Property, PropertyCreate, PropertyUpdate
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("/portfolio/{portfolio_id}", response_model=List[Property])
async def get_portfolio_properties(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all properties in a portfolio
    
    ⚠️ Data Isolation: Only returns properties owned by current_user
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
    
    # Get properties with data isolation
    statement = select(Property).where(
        Property.portfolio_id == portfolio_id,
        Property.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    properties = session.exec(statement).all()
    
    return properties


@router.post("", response_model=Property, status_code=status.HTTP_201_CREATED)
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new property
    
    ⚠️ Data Isolation: Property automatically assigned to current_user
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
    
    # Create property with user_id from authenticated user
    property_obj = Property(
        user_id=current_user.id,  # CRITICAL: Set from authenticated user
        portfolio_id=data.portfolio_id,
        address=data.address,
        suburb=data.suburb,
        state=data.state,
        postcode=data.postcode,
        property_type=data.property_type,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
        car_spaces=data.car_spaces,
        land_size=data.land_size,
        building_size=data.building_size,
        year_built=data.year_built,
        purchase_price=data.purchase_price,
        purchase_date=data.purchase_date,
        stamp_duty=data.stamp_duty,
        purchase_costs=data.purchase_costs,
        current_value=data.current_value or data.purchase_price,
        loan_details=data.loan_details if data.loan_details else {},
        rental_details=data.rental_details if data.rental_details else {},
        expenses=data.expenses if data.expenses else {},
        growth_assumptions=data.growth_assumptions if data.growth_assumptions else {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(property_obj)
    session.commit()
    session.refresh(property_obj)
    
    logger.info(f"Property created: {property_obj.id} for user: {current_user.id}")
    return property_obj


@router.get("/{property_id}", response_model=Property)
async def get_property(
    property_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific property
    
    ⚠️ Data Isolation: Only returns property if owned by current_user
    """
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    return property_obj


@router.put("/{property_id}", response_model=Property)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a property
    
    ⚠️ Data Isolation: Only updates property if owned by current_user
    """
    # Get property with data isolation check
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    # Update fields (only those provided)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(property_obj, key, value)
    
    property_obj.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(property_obj)
    session.commit()
    session.refresh(property_obj)
    
    logger.info(f"Property updated: {property_id} by user: {current_user.id}")
    return property_obj


@router.delete("/{property_id}")
async def delete_property(
    property_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a property
    
    ⚠️ Data Isolation: Only deletes property if owned by current_user
    """
    # Get property with data isolation check
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    # Delete property
    session.delete(property_obj)
    session.commit()
    
    logger.info(f"Property deleted: {property_id} by user: {current_user.id}")
    return {"message": "Property deleted successfully"}
