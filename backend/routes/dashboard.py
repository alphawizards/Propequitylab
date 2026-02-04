"""
Dashboard Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Model.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from decimal import Decimal
import logging
import uuid

from models.net_worth import NetWorthSnapshot, AssetBreakdown, LiabilityBreakdown
from models.portfolio import Portfolio
from models.property import Property
from models.asset import Asset
from models.liability import Liability
from models.income import IncomeSource
from models.expense import Expense
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
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
async def get_dashboard_summary(
    portfolio_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get dashboard summary for the user's primary portfolio
    
    ⚠️ Data Isolation: Only returns data owned by current_user
    """
    # Get portfolio (use first one if not specified)
    if portfolio_id:
        portfolio_stmt = select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.id
        )
    else:
        portfolio_stmt = select(Portfolio).where(
            Portfolio.user_id == current_user.id
        )
    
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        # Return empty summary if no portfolio
        return DashboardSummary(
            asset_breakdown=AssetBreakdown(),
            liability_breakdown=LiabilityBreakdown()
        )
    
    portfolio_id = portfolio.id
    
    # Get all data with data isolation filters
    properties = session.exec(
        select(Property).where(
            Property.portfolio_id == portfolio_id,
            Property.user_id == current_user.id
        )
    ).all()
    
    assets = session.exec(
        select(Asset).where(
            Asset.portfolio_id == portfolio_id,
            Asset.user_id == current_user.id,
            Asset.is_active == True
        )
    ).all()
    
    liabilities = session.exec(
        select(Liability).where(
            Liability.portfolio_id == portfolio_id,
            Liability.user_id == current_user.id,
            Liability.is_active == True
        )
    ).all()
    
    income_sources = session.exec(
        select(IncomeSource).where(
            IncomeSource.portfolio_id == portfolio_id,
            IncomeSource.user_id == current_user.id,
            IncomeSource.is_active == True
        )
    ).all()
    
    expenses = session.exec(
        select(Expense).where(
            Expense.portfolio_id == portfolio_id,
            Expense.user_id == current_user.id,
            Expense.is_active == True
        )
    ).all()
    
    # Calculate asset breakdown using Python sum
    property_value = float(sum((p.current_value or Decimal(0)) for p in properties))
    
    asset_breakdown = AssetBreakdown(
        properties=property_value,
        super=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'super')),
        shares=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'shares')),
        etf=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'etf')),
        crypto=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'crypto')),
        cash=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'cash')),
        bonds=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'bonds')),
        other=float(sum((a.current_value or Decimal(0)) for a in assets if a.type == 'other'))
    )
    
    # Calculate liability breakdown
    # Get loan amount from property loan_details JSON or loan_amount field
    def get_property_loan(p):
        if hasattr(p, 'loan_amount') and p.loan_amount:
            return p.loan_amount
        if hasattr(p, 'loan_details') and p.loan_details:
            return Decimal(str(p.loan_details.get('amount', 0)))
        return Decimal(0)
    
    property_loans = float(sum(get_property_loan(p) for p in properties))
    
    liability_breakdown = LiabilityBreakdown(
        property_loans=property_loans,
        car_loans=float(sum((l.current_balance or Decimal(0)) for l in liabilities if l.type == 'car_loan')),
        credit_cards=float(sum((l.current_balance or Decimal(0)) for l in liabilities if l.type == 'credit_card')),
        hecs=float(sum((l.current_balance or Decimal(0)) for l in liabilities if l.type == 'hecs')),
        personal_loans=float(sum((l.current_balance or Decimal(0)) for l in liabilities if l.type == 'personal_loan')),
        other=float(sum((l.current_balance or Decimal(0)) for l in liabilities if l.type == 'other'))
    )
    
    # Calculate totals
    total_assets = property_value + float(sum((a.current_value or Decimal(0)) for a in assets))
    total_liabilities = property_loans + float(sum((l.current_balance or Decimal(0)) for l in liabilities))
    net_worth = total_assets - total_liabilities
    
    # Calculate monthly income/expenses
    def to_monthly(amount, frequency):
        if amount is None:
            return 0
        multipliers = {'weekly': 4.33, 'fortnightly': 2.17, 'monthly': 1, 'annual': 1/12}
        return float(amount) * multipliers.get(frequency, 1)
    
    monthly_income = sum(to_monthly(i.amount, i.frequency) for i in income_sources)
    monthly_expenses = sum(to_monthly(e.amount, e.frequency) for e in expenses)
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
async def get_net_worth_history(
    portfolio_id: Optional[str] = None,
    limit: int = 12,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get historical net worth snapshots
    
    ⚠️ Data Isolation: Only returns snapshots owned by current_user
    """
    # Build query with data isolation
    if portfolio_id:
        stmt = select(NetWorthSnapshot).where(
            NetWorthSnapshot.portfolio_id == portfolio_id,
            NetWorthSnapshot.user_id == current_user.id
        ).order_by(NetWorthSnapshot.date.desc()).limit(limit)
    else:
        stmt = select(NetWorthSnapshot).where(
            NetWorthSnapshot.user_id == current_user.id
        ).order_by(NetWorthSnapshot.date.desc()).limit(limit)
    
    snapshots = session.exec(stmt).all()
    return list(snapshots)


class SnapshotRequest(BaseModel):
    portfolio_id: str


@router.post("/snapshot")
async def create_net_worth_snapshot(
    request: SnapshotRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new net worth snapshot (calculated from current data)
    
    ⚠️ Data Isolation: Only creates snapshot for portfolio owned by current_user
    """
    portfolio_id = request.portfolio_id
    
    # Verify portfolio access
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
    
    # Get dashboard summary to use for snapshot
    summary = await get_dashboard_summary(portfolio_id, current_user, session)
    
    # Convert breakdowns to dict for JSON storage
    asset_breakdown_dict = summary.asset_breakdown.model_dump() if hasattr(summary.asset_breakdown, 'model_dump') else dict(summary.asset_breakdown)
    liability_breakdown_dict = summary.liability_breakdown.model_dump() if hasattr(summary.liability_breakdown, 'model_dump') else dict(summary.liability_breakdown)
    
    # Create and persist the snapshot
    snapshot = NetWorthSnapshot(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        portfolio_id=portfolio_id,
        date=datetime.utcnow().date(),
        total_assets=Decimal(str(summary.total_assets)),
        total_liabilities=Decimal(str(summary.total_liabilities)),
        net_worth=Decimal(str(summary.net_worth)),
        asset_breakdown=asset_breakdown_dict,
        liability_breakdown=liability_breakdown_dict,
        monthly_income=Decimal(str(summary.monthly_income)),
        monthly_expenses=Decimal(str(summary.monthly_expenses)),
        monthly_cashflow=Decimal(str(summary.monthly_cashflow)),
        savings_rate=Decimal(str(summary.savings_rate))
    )
    
    # Persist to database
    session.add(snapshot)
    session.commit()
    session.refresh(snapshot)
    
    logger.info(f"Net worth snapshot persisted for portfolio: {portfolio_id} by user: {current_user.id}")
    
    return {"message": "Snapshot created", "snapshot": snapshot}

