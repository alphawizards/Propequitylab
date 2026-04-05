"""
Portfolio Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Portfolio.user_id == current_user.id) for data isolation
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List
from datetime import datetime, timezone
from decimal import Decimal
import logging

from models.portfolio import Portfolio, PortfolioCreate, PortfolioUpdate, PortfolioSummary
from models.user import User
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from models.plan import Plan
from utils.database_sql import get_session
from utils.clerk_auth import get_current_user
from utils.calculations import annualize_amount

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/portfolios", tags=["portfolios"])


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
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        type=data.type,
        settings=data.settings.model_dump(mode='json') if data.settings else {},
        goal_settings=data.goal_settings.model_dump(mode='json') if data.goal_settings else {},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
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
    
    # Update fields — use mode='json' to serialize Decimal values in JSON columns
    update_data = data.model_dump(exclude_unset=True, mode='json')
    for key, value in update_data.items():
        setattr(portfolio, key, value)
    
    portfolio.updated_at = datetime.now(timezone.utc)
    
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
    income_stmt = select(IncomeSource).where(IncomeSource.portfolio_id == portfolio_id)
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
    properties_stmt = select(Property).where(
        Property.portfolio_id == portfolio_id,
        Property.user_id == current_user.id
    )
    properties = session.exec(properties_stmt).all()

    total_property_value = sum(prop.current_value or Decimal(0) for prop in properties)
    total_property_equity = sum(
        (prop.current_value or Decimal(0)) - (Decimal(str(prop.loan_details.get("amount", 0))) if prop.loan_details else Decimal(0))
        for prop in properties
    )
    total_rental_income = sum(Decimal(str(prop.rental_details.get("income", 0))) if prop.rental_details else Decimal(0) for prop in properties)

    # Calculate totals for assets
    assets_stmt = select(Asset).where(
        Asset.portfolio_id == portfolio_id,
        Asset.user_id == current_user.id
    )
    assets = session.exec(assets_stmt).all()
    total_assets = sum(asset.current_value or Decimal(0) for asset in assets)

    # Calculate totals for liabilities
    liabilities_stmt = select(Liability).where(
        Liability.portfolio_id == portfolio_id,
        Liability.user_id == current_user.id
    )
    liabilities = session.exec(liabilities_stmt).all()
    total_liabilities = sum(liability.current_balance or Decimal(0) for liability in liabilities)

    # Annualise income sources
    income_stmt = select(IncomeSource).where(
        IncomeSource.portfolio_id == portfolio_id,
        IncomeSource.user_id == current_user.id
    )
    incomes = session.exec(income_stmt).all()
    total_income = sum(
        annualize_amount(income.amount or Decimal(0), income.frequency or "monthly")
        for income in incomes
    )

    # Annualise expenses
    expense_stmt = select(Expense).where(
        Expense.portfolio_id == portfolio_id,
        Expense.user_id == current_user.id
    )
    expenses = session.exec(expense_stmt).all()
    total_expenses = sum(
        annualize_amount(expense.amount or Decimal(0), expense.frequency or "monthly")
        for expense in expenses
    )

    # Annualise rental income (treat rental_details["income"] as monthly by default)
    total_rental_income = sum(
        annualize_amount(
            Decimal(str(prop.rental_details.get("income", 0))) if prop.rental_details else Decimal(0),
            prop.rental_details.get("frequency", "monthly") if prop.rental_details else "monthly"
        )
        for prop in properties
    )

    # Calculate property debt (total loan amounts)
    total_property_debt = sum(
        Decimal(str(prop.loan_details.get("amount", 0))) if prop.loan_details else Decimal(0)
        for prop in properties
    )

    # Calculate net worth
    net_worth = total_property_value + total_assets - total_liabilities - total_property_debt

    # Calculate annual cashflow (rental income + other income - expenses)
    annual_cashflow = total_rental_income + total_income - total_expenses

    summary = PortfolioSummary(
        portfolio_id=portfolio_id,
        properties_count=len(properties),
        total_value=total_property_value,
        total_debt=total_property_debt,
        total_equity=total_property_equity,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
        annual_income=total_rental_income + total_income,
        annual_expenses=total_expenses,
        annual_cashflow=annual_cashflow,
        goal_year=portfolio.goal_settings.get("target_year") if portfolio.goal_settings else None,
    )
    
    return summary
