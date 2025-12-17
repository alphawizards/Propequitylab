from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone
import logging

from models.portfolio import Portfolio, PortfolioCreate, PortfolioUpdate, PortfolioSummary
from utils.database import db
from utils.dev_user import DEV_USER_ID

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("", response_model=List[Portfolio])
async def get_portfolios():
    """Get all portfolios for the current user (dev mode: dev-user-01)"""
    portfolios = await db.portfolios.find(
        {"user_id": DEV_USER_ID},
        {"_id": 0}
    ).to_list(100)
    return portfolios


@router.post("", response_model=Portfolio)
async def create_portfolio(data: PortfolioCreate):
    """Create a new portfolio"""
    portfolio = Portfolio(
        user_id=DEV_USER_ID,
        name=data.name,
        type=data.type,
        settings=data.settings if data.settings else Portfolio.model_fields['settings'].default_factory(),
        goal_settings=data.goal_settings if data.goal_settings else Portfolio.model_fields['goal_settings'].default_factory()
    )
    
    doc = portfolio.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.portfolios.insert_one(doc)
    return portfolio


@router.get("/{portfolio_id}", response_model=Portfolio)
async def get_portfolio(portfolio_id: str):
    """Get a specific portfolio"""
    portfolio = await db.portfolios.find_one(
        {"id": portfolio_id, "user_id": DEV_USER_ID},
        {"_id": 0}
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.put("/{portfolio_id}", response_model=Portfolio)
async def update_portfolio(portfolio_id: str, data: PortfolioUpdate):
    """Update a portfolio"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.portfolios.update_one(
        {"id": portfolio_id, "user_id": DEV_USER_ID},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    portfolio = await db.portfolios.find_one(
        {"id": portfolio_id},
        {"_id": 0}
    )
    return portfolio


@router.delete("/{portfolio_id}")
async def delete_portfolio(portfolio_id: str):
    """Delete a portfolio and all related data"""
    result = await db.portfolios.delete_one(
        {"id": portfolio_id, "user_id": DEV_USER_ID}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Also delete related data
    await db.properties.delete_many({"portfolio_id": portfolio_id})
    await db.income_sources.delete_many({"portfolio_id": portfolio_id})
    await db.expenses.delete_many({"portfolio_id": portfolio_id})
    await db.assets.delete_many({"portfolio_id": portfolio_id})
    await db.liabilities.delete_many({"portfolio_id": portfolio_id})
    await db.plans.delete_many({"portfolio_id": portfolio_id})
    
    return {"message": "Portfolio deleted successfully"}


@router.get("/{portfolio_id}/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(portfolio_id: str):
    """Get portfolio summary with calculated totals"""
    # Verify portfolio exists
    portfolio = await db.portfolios.find_one(
        {"id": portfolio_id, "user_id": DEV_USER_ID}
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get properties
    properties = await db.properties.find(
        {"portfolio_id": portfolio_id}
    ).to_list(1000)
    
    # Get other assets
    assets = await db.assets.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Get liabilities (non-property)
    liabilities = await db.liabilities.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Get income sources
    income_sources = await db.income_sources.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Get expenses
    expenses = await db.expenses.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Calculate totals
    property_value = sum(p.get('current_value', 0) for p in properties)
    property_debt = sum(p.get('loan_details', {}).get('amount', 0) for p in properties)
    property_equity = property_value - property_debt
    
    other_assets = sum(a.get('current_value', 0) for a in assets)
    other_liabilities = sum(item.get('current_balance', 0) for item in liabilities)
    
    total_assets = property_value + other_assets
    total_liabilities = property_debt + other_liabilities
    net_worth = total_assets - total_liabilities
    
    # Calculate annual income (normalize to annual)
    def to_annual(amount, frequency):
        multipliers = {'weekly': 52, 'fortnightly': 26, 'monthly': 12, 'annual': 1}
        return amount * multipliers.get(frequency, 1)
    
    annual_income = sum(
        to_annual(i.get('amount', 0), i.get('frequency', 'annual'))
        for i in income_sources
    )
    
    annual_expenses = sum(
        to_annual(e.get('amount', 0), e.get('frequency', 'monthly'))
        for e in expenses
    )
    
    return PortfolioSummary(
        portfolio_id=portfolio_id,
        properties_count=len(properties),
        total_value=property_value,
        total_debt=property_debt,
        total_equity=property_equity,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
        annual_income=annual_income,
        annual_expenses=annual_expenses,
        annual_cashflow=annual_income - annual_expenses
    )
