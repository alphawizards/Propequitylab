"""
Valuations Routes - CRUD API for Property Valuation History
Track historical property valuations for accurate projections.

⚠️ CRITICAL: All queries include user access verification for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from decimal import Decimal
import logging

from models.property import Property
from models.user import User
from models.financials import (
    PropertyValuation,
    ValuationCreate,
    ValuationResponse,
)
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/valuations", tags=["valuations"])


def _verify_property_access(property_id: str, user_id: str, session: Session) -> Property:
    """Verify user has access to the property."""
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == user_id
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    return property_obj


@router.post("", response_model=ValuationResponse, status_code=status.HTTP_201_CREATED)
async def create_valuation(
    data: ValuationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add a new property valuation record.
    
    This also updates the property's current_value if this is the newest valuation.
    """
    # Verify property access
    property_obj = _verify_property_access(data.property_id, current_user.id, session)
    
    # Create valuation
    valuation = PropertyValuation(
        property_id=data.property_id,
        valuation_date=data.valuation_date,
        value=data.value,
        valuation_source=data.valuation_source,
        created_at=datetime.utcnow(),
    )
    
    session.add(valuation)
    
    # Update property's current_value if this is the newest valuation
    latest_stmt = select(PropertyValuation).where(
        PropertyValuation.property_id == data.property_id
    ).order_by(PropertyValuation.valuation_date.desc())
    latest = session.exec(latest_stmt).first()
    
    if not latest or data.valuation_date >= latest.valuation_date:
        property_obj.current_value = data.value
        property_obj.last_valuation_date = data.valuation_date
        property_obj.updated_at = datetime.utcnow()
        session.add(property_obj)
    
    session.commit()
    session.refresh(valuation)
    
    logger.info(f"Valuation created: {valuation.id} for property: {data.property_id}")
    return valuation


@router.get("/property/{property_id}", response_model=List[ValuationResponse])
async def get_property_valuations(
    property_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all valuations for a property, ordered by date descending.
    """
    # Verify property access
    _verify_property_access(property_id, current_user.id, session)
    
    # Get valuations
    statement = select(PropertyValuation).where(
        PropertyValuation.property_id == property_id
    ).order_by(PropertyValuation.valuation_date.desc())
    valuations = session.exec(statement).all()
    
    return valuations


@router.get("/{valuation_id}", response_model=ValuationResponse)
async def get_valuation(
    valuation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific valuation by ID.
    """
    valuation = session.exec(
        select(PropertyValuation).where(PropertyValuation.id == valuation_id)
    ).first()
    
    if not valuation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valuation not found"
        )
    
    # Verify property access
    _verify_property_access(valuation.property_id, current_user.id, session)
    
    return valuation


@router.delete("/{valuation_id}")
async def delete_valuation(
    valuation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a valuation record.
    """
    valuation = session.exec(
        select(PropertyValuation).where(PropertyValuation.id == valuation_id)
    ).first()
    
    if not valuation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Valuation not found"
        )
    
    # Verify property access
    _verify_property_access(valuation.property_id, current_user.id, session)
    
    # Delete valuation
    session.delete(valuation)
    session.commit()
    
    logger.info(f"Valuation deleted: {valuation_id}")
    return {"message": "Valuation deleted successfully"}


@router.get("/property/{property_id}/latest")
async def get_latest_valuation(
    property_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the most recent valuation for a property.
    """
    # Verify property access
    property_obj = _verify_property_access(property_id, current_user.id, session)
    
    # Get latest valuation
    statement = select(PropertyValuation).where(
        PropertyValuation.property_id == property_id
    ).order_by(PropertyValuation.valuation_date.desc())
    valuation = session.exec(statement).first()
    
    if valuation:
        return {
            "id": valuation.id,
            "valuation_date": valuation.valuation_date,
            "value": valuation.value,
            "valuation_source": valuation.valuation_source,
        }
    else:
        # Fall back to property's current value
        return {
            "id": None,
            "valuation_date": property_obj.last_valuation_date or property_obj.purchase_date,
            "value": property_obj.current_value,
            "valuation_source": "property_record",
        }
