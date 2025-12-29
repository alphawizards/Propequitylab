from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone

from pydantic import BaseModel
from models.property import Property, PropertyCreate, PropertyUpdate
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/properties", tags=["properties"])


class PropertyProjectionRequest(BaseModel):
    current_value: float
    loan_balance: float
    interest_rate: float
    loan_term_years: int
    capital_growth_rate: float
    repayment_type: str = "principal_interest" # or interest_only
    years: int = 30


class YearlyPropertyProjection(BaseModel):
    year: int
    property_value: float
    loan_balance: float
    equity: float


class PropertyProjectionResponse(BaseModel):
    projections: List[YearlyPropertyProjection]
    final_value: float
    final_equity: float


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


@router.post("/project-equity", response_model=PropertyProjectionResponse)
async def project_property_equity(data: PropertyProjectionRequest):
    """Calculate property equity projection"""

    projections = []

    current_value = data.current_value
    loan_balance = data.loan_balance

    # Simple loan amortization
    # This is a simplification. Real loans are complex.
    # Monthly rate
    r = data.interest_rate / 100 / 12
    n = data.loan_term_years * 12

    # Calculate monthly payment
    if data.repayment_type == "interest_only":
        monthly_payment = loan_balance * r
    else:
        # P&I formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
        if r > 0:
            monthly_payment = loan_balance * (r * (1 + r)**n) / ((1 + r)**n - 1)
        else:
            monthly_payment = loan_balance / n

    for year in range(1, data.years + 1):
        # Apply capital growth
        current_value *= (1 + data.capital_growth_rate / 100)

        # Apply loan repayments (12 months)
        for _ in range(12):
            if loan_balance > 0:
                interest = loan_balance * r
                principal = monthly_payment - interest
                if data.repayment_type == "interest_only":
                    principal = 0 # Interest only means principal doesn't reduce (unless offset, ignoring for now)

                loan_balance -= principal
                if loan_balance < 0:
                    loan_balance = 0

        projections.append(YearlyPropertyProjection(
            year=datetime.now().year + year,
            property_value=round(current_value, 2),
            loan_balance=round(loan_balance, 2),
            equity=round(current_value - loan_balance, 2)
        ))

    return PropertyProjectionResponse(
        projections=projections,
        final_value=round(current_value, 2),
        final_equity=round(current_value - loan_balance, 2)
    )
