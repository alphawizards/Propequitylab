from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from models.property import Property, PropertyCreate, PropertyUpdate
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/portfolio/{portfolio_id}", response_model=List[Property])
async def get_portfolio_properties(portfolio_id: str):
    """Get all properties in a portfolio"""
    properties = await db.properties.find(
        {"portfolio_id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return properties


@router.post("", response_model=Property)
async def create_property(data: PropertyCreate):
    """Create a new property"""
    property_obj = Property(
        user_id=DEV_USER_ID,
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
        loan_details=data.loan_details if data.loan_details else Property.model_fields['loan_details'].default_factory(),
        rental_details=data.rental_details if data.rental_details else Property.model_fields['rental_details'].default_factory(),
        expenses=data.expenses if data.expenses else Property.model_fields['expenses'].default_factory(),
        growth_assumptions=data.growth_assumptions if data.growth_assumptions else Property.model_fields['growth_assumptions'].default_factory()
    )
    
    doc = property_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.properties.insert_one(doc)
    return property_obj


@router.get("/{property_id}", response_model=Property)
async def get_property(property_id: str):
    """Get a specific property"""
    prop = await db.properties.find_one(
        {"id": property_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    )
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.put("/{property_id}", response_model=Property)
async def update_property(property_id: str, data: PropertyUpdate):
    """Update a property"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # Handle nested objects
    if 'loan_details' in update_data:
        update_data['loan_details'] = update_data['loan_details'].model_dump() if hasattr(update_data['loan_details'], 'model_dump') else update_data['loan_details']
    if 'rental_details' in update_data:
        update_data['rental_details'] = update_data['rental_details'].model_dump() if hasattr(update_data['rental_details'], 'model_dump') else update_data['rental_details']
    if 'expenses' in update_data:
        update_data['expenses'] = update_data['expenses'].model_dump() if hasattr(update_data['expenses'], 'model_dump') else update_data['expenses']
    if 'growth_assumptions' in update_data:
        update_data['growth_assumptions'] = update_data['growth_assumptions'].model_dump() if hasattr(update_data['growth_assumptions'], 'model_dump') else update_data['growth_assumptions']
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.properties.update_one(
        {"id": property_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    prop = await db.properties.find_one(
        {"id": property_id},
        {"_id": 0}
    )
    return prop


@router.delete("/{property_id}")
async def delete_property(property_id: str):
    """Delete a property"""
    result = await db.properties.delete_one(
        {"id": property_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return {"message": "Property deleted successfully"}
