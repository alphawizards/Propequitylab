"""
Portfolio Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Portfolio.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List
from datetime import datetime
from decimal import Decimal
import logging

from models.portfolio import Portfolio, PortfolioCreate, PortfolioUpdate, PortfolioSummary
from models.user import User
from models.property import Property
from models.income import Income
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from models.plan import Plan
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/portfolios", tags=["portfolios"])


@router.get("", response_model=List[Portfolio])
async def get_portfolios(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all portfolios for the current authenticated user
    
    ⚠️ Data Isolation: Only returns portfolios owned by current_user
    """
    statement = select(Portfolio).where(Portfolio.user_id == current_user.id)
    portfolios = session.exec(statement).all()
    return portfolios


@router.post("", response_model=Portfolio, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new portfolio for the current authenticated user
    
    ⚠️ Data Isolation: Portfolio automatically assigned to current_user
    """
    # Create portfolio with user_id from authenticated user
    portfolio = Portfolio(
        user_id=current_user.id,
        name=data.name,
        type=data.type,
        settings=data.settings if data.settings else {},
        goal_settings=data.goal_settings if data.goal_settings else {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    
    logger.info(f"Portfolio created: {portfolio.id} for user: {current_user.id}")
    return portfolio


@router.get("/{portfolio_id}", response_model=Portfolio)
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific portfolio
    
    ⚠️ Data Isolation: Only returns portfolio if owned by current_user
    """
    statement = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    portfolio = session.exec(statement).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    return portfolio


@router.put("/{portfolio_id}", response_model=Portfolio)
async def update_portfolio(
    portfolio_id: str,
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a portfolio
    
    ⚠️ Data Isolation: Only updates portfolio if owned by current_user
    """
    # Get portfolio with data isolation check
    statement = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    portfolio = session.exec(statement).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(portfolio, key, value)
    
    portfolio.updated_at = datetime.utcnow()
    
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    
    logger.info(f"Portfolio updated: {portfolio.id} by user: {current_user.id}")
    return portfolio


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a portfolio and all related data
    
    ⚠️ Data Isolation: Only deletes portfolio if owned by current_user
    """
    # Get portfolio with data isolation check
    statement = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    portfolio = session.exec(statement).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Delete related data (all with data isolation checks via portfolio_id)
    # Properties
    properties_stmt = select(Property).where(Property.portfolio_id == portfolio_id)
    properties = session.exec(properties_stmt).all()
    for prop in properties:
        session.delete(prop)
    
    # Income
    income_stmt = select(Income).where(Income.portfolio_id == portfolio_id)
    incomes = session.exec(income_stmt).all()
    for income in incomes:
        session.delete(income)
    
    # Expenses
    expense_stmt = select(Expense).where(Expense.portfolio_id == portfolio_id)
    expenses = session.exec(expense_stmt).all()
    for expense in expenses:
        session.delete(expense)
    
    # Assets
    asset_stmt = select(Asset).where(Asset.portfolio_id == portfolio_id)
    assets = session.exec(asset_stmt).all()
    for asset in assets:
        session.delete(asset)
    
    # Liabilities
    liability_stmt = select(Liability).where(Liability.portfolio_id == portfolio_id)
    liabilities = session.exec(liability_stmt).all()
    for liability in liabilities:
        session.delete(liability)
    
    # Plans
    plan_stmt = select(Plan).where(Plan.portfolio_id == portfolio_id)
    plans = session.exec(plan_stmt).all()
    for plan in plans:
        session.delete(plan)
    
    # Delete portfolio
    session.delete(portfolio)
    session.commit()
    
    logger.info(f"Portfolio deleted: {portfolio_id} by user: {current_user.id}")
    return {"message": "Portfolio deleted successfully"}


@router.get("/{portfolio_id}/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get portfolio summary with calculated totals
    
    ⚠️ Data Isolation: Only returns summary if portfolio owned by current_user
    """
    # Verify portfolio exists and user has access
    portfolio_stmt = select(Portfolio).where(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    portfolio = session.exec(portfolio_stmt).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or you don't have access"
        )
    
    # Calculate totals for properties
    properties_stmt = select(Property).where(Property.portfolio_id == portfolio_id)
    properties = session.exec(properties_stmt).all()
    
    total_property_value = sum(prop.current_value or Decimal(0) for prop in properties)
    total_property_equity = sum(
        (prop.current_value or Decimal(0)) - (prop.loan_amount or Decimal(0))
        for prop in properties
    )
    total_rental_income = sum(prop.rental_income or Decimal(0) for prop in properties)
    
    # Calculate totals for assets
    assets_stmt = select(Asset).where(Asset.portfolio_id == portfolio_id)
    assets = session.exec(assets_stmt).all()
    total_assets = sum(asset.current_value or Decimal(0) for asset in assets)
    
    # Calculate totals for liabilities
    liabilities_stmt = select(Liability).where(Liability.portfolio_id == portfolio_id)
    liabilities = session.exec(liabilities_stmt).all()
    total_liabilities = sum(liability.current_balance or Decimal(0) for liability in liabilities)
    
    # Calculate totals for income
    income_stmt = select(Income).where(Income.portfolio_id == portfolio_id)
    incomes = session.exec(income_stmt).all()
    total_income = sum(income.amount or Decimal(0) for income in incomes)
    
    # Calculate totals for expenses
    expense_stmt = select(Expense).where(Expense.portfolio_id == portfolio_id)
    expenses = session.exec(expense_stmt).all()
    total_expenses = sum(expense.amount or Decimal(0) for expense in expenses)
    
    # Calculate net worth
    net_worth = total_property_value + total_assets - total_liabilities
    
    # Calculate cashflow
    monthly_cashflow = total_rental_income + total_income - total_expenses
    
    summary = PortfolioSummary(
        portfolio_id=portfolio_id,
        portfolio_name=portfolio.name,
        total_property_value=total_property_value,
        total_property_equity=total_property_equity,
        total_rental_income=total_rental_income,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        total_income=total_income,
        total_expenses=total_expenses,
        net_worth=net_worth,
        monthly_cashflow=monthly_cashflow,
        property_count=len(properties),
        asset_count=len(assets),
        liability_count=len(liabilities)
    )
    
    return summary
