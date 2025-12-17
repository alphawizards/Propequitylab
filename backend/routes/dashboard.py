from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timezone

from models.net_worth import NetWorthSnapshot, AssetBreakdown, LiabilityBreakdown
from utils.database import db
from utils.dev_user import DEV_USER_ID

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardSummary(BaseModel):
    net_worth: float = 0
    total_assets: float = 0
    total_liabilities: float = 0
    asset_breakdown: AssetBreakdown
    liability_breakdown: LiabilityBreakdown
    monthly_income: float = 0
    monthly_expenses: float = 0
    monthly_cashflow: float = 0
    savings_rate: float = 0
    properties_count: int = 0
    

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(portfolio_id: Optional[str] = None):
    """Get dashboard summary for the user's primary portfolio"""
    
    # Get portfolio (use first one if not specified)
    query = {"user_id": DEV_USER_ID}
    if portfolio_id:
        query["id"] = portfolio_id
    
    portfolio = await db.portfolios.find_one(query)
    if not portfolio:
        # Return empty summary if no portfolio
        return DashboardSummary(
            asset_breakdown=AssetBreakdown(),
            liability_breakdown=LiabilityBreakdown()
        )
    
    portfolio_id = portfolio['id']
    
    # Get properties
    properties = await db.properties.find(
        {"portfolio_id": portfolio_id}
    ).to_list(1000)
    
    # Get other assets
    assets = await db.assets.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Get liabilities
    liabilities = await db.liabilities.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Get income
    income_sources = await db.income_sources.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Get expenses
    expenses = await db.expenses.find(
        {"portfolio_id": portfolio_id, "is_active": True}
    ).to_list(1000)
    
    # Calculate asset breakdown
    property_value = sum(p.get('current_value', 0) for p in properties)
    
    asset_breakdown = AssetBreakdown(
        properties=property_value,
        super=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'super'),
        shares=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'shares'),
        etf=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'etf'),
        crypto=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'crypto'),
        cash=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'cash'),
        bonds=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'bonds'),
        other=sum(a.get('current_value', 0) for a in assets if a.get('type') == 'other')
    )
    
    # Calculate liability breakdown
    property_loans = sum(p.get('loan_details', {}).get('amount', 0) for p in properties)
    
    liability_breakdown = LiabilityBreakdown(
        property_loans=property_loans,
        car_loans=sum(l.get('current_balance', 0) for l in liabilities if l.get('type') == 'car_loan'),
        credit_cards=sum(l.get('current_balance', 0) for l in liabilities if l.get('type') == 'credit_card'),
        hecs=sum(l.get('current_balance', 0) for l in liabilities if l.get('type') == 'hecs'),
        personal_loans=sum(l.get('current_balance', 0) for l in liabilities if l.get('type') == 'personal_loan'),
        other=sum(l.get('current_balance', 0) for l in liabilities if l.get('type') == 'other')
    )
    
    # Calculate totals
    total_assets = property_value + sum(a.get('current_value', 0) for a in assets)
    total_liabilities = property_loans + sum(l.get('current_balance', 0) for l in liabilities)
    net_worth = total_assets - total_liabilities
    
    # Calculate monthly income/expenses
    def to_monthly(amount, frequency):
        multipliers = {'weekly': 4.33, 'fortnightly': 2.17, 'monthly': 1, 'annual': 1/12}
        return amount * multipliers.get(frequency, 1)
    
    monthly_income = sum(
        to_monthly(i.get('amount', 0), i.get('frequency', 'monthly'))
        for i in income_sources
    )
    
    monthly_expenses = sum(
        to_monthly(e.get('amount', 0), e.get('frequency', 'monthly'))
        for e in expenses
    )
    
    monthly_cashflow = monthly_income - monthly_expenses
    savings_rate = (monthly_cashflow / monthly_income * 100) if monthly_income > 0 else 0
    
    return DashboardSummary(
        net_worth=net_worth,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        asset_breakdown=asset_breakdown,
        liability_breakdown=liability_breakdown,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        monthly_cashflow=monthly_cashflow,
        savings_rate=savings_rate,
        properties_count=len(properties)
    )


@router.get("/net-worth-history", response_model=List[NetWorthSnapshot])
async def get_net_worth_history(portfolio_id: Optional[str] = None, limit: int = 12):
    """Get historical net worth snapshots"""
    query = {"user_id": DEV_USER_ID}
    if portfolio_id:
        query["portfolio_id"] = portfolio_id
    
    snapshots = await db.net_worth_history.find(
        query,
        {"_id": 0}
    ).sort("date", -1).to_list(limit)
    
    return snapshots


@router.post("/snapshot")
async def create_net_worth_snapshot(portfolio_id: str):
    """Create a new net worth snapshot (calculated from current data)"""
    summary = await get_dashboard_summary(portfolio_id)
    
    snapshot = NetWorthSnapshot(
        user_id=DEV_USER_ID,
        portfolio_id=portfolio_id,
        date=datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        total_assets=summary.total_assets,
        total_liabilities=summary.total_liabilities,
        net_worth=summary.net_worth,
        asset_breakdown=summary.asset_breakdown,
        liability_breakdown=summary.liability_breakdown,
        monthly_income=summary.monthly_income,
        monthly_expenses=summary.monthly_expenses,
        monthly_cashflow=summary.monthly_cashflow,
        savings_rate=summary.savings_rate
    )
    
    doc = snapshot.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.net_worth_history.insert_one(doc)
    
    return {"message": "Snapshot created", "snapshot": snapshot}
