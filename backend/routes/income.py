"""
Income Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(IncomeSource.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from decimal import Decimal
import logging
import uuid

from models.income import IncomeSource, IncomeSourceCreate, IncomeSourceUpdate
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/income", tags=["income"])


@router.get("/portfolio/{portfolio_id}", response_model=List[IncomeSource])
async def get_portfolio_income(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all income sources for a portfolio
    
    ⚠️ Data Isolation: Only returns income sources owned by current_user
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
    
    # Get income sources with data isolation
    statement = select(IncomeSource).where(
        IncomeSource.portfolio_id == portfolio_id,
        IncomeSource.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    sources = session.exec(statement).all()
    
    return sources


@router.post("", response_model=IncomeSource, status_code=status.HTTP_201_CREATED)
async def create_income_source(
    data: IncomeSourceCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new income source
    
    ⚠️ Data Isolation: Income source automatically assigned to current_user
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
    
    # Create income source with user_id from authenticated user
    source = IncomeSource(
        id=str(uuid.uuid4()),
        user_id=current_user.id,  # CRITICAL: Set from authenticated user
        portfolio_id=data.portfolio_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
        amount=data.amount,
        frequency=data.frequency,
        growth_rate=data.growth_rate,
        start_date=data.start_date,
        end_date=data.end_date,
        end_age=data.end_age,
        is_taxable=data.is_taxable,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(source)
    session.commit()
    session.refresh(source)
    
    logger.info(f"Income source created: {source.id} for user: {current_user.id}")
    return source


@router.get("/{income_id}", response_model=IncomeSource)
async def get_income_source(
    income_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific income source
    
    ⚠️ Data Isolation: Only returns income source if owned by current_user
    """
    statement = select(IncomeSource).where(
        IncomeSource.id == income_id,
        IncomeSource.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    source = session.exec(statement).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income source not found or you don't have access"
        )
    
    return source


@router.put("/{income_id}", response_model=IncomeSource)
async def update_income_source(
    income_id: str,
    data: IncomeSourceUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update an income source
    
    ⚠️ Data Isolation: Only updates income source if owned by current_user
    """
    # Get income source with data isolation check
    statement = select(IncomeSource).where(
        IncomeSource.id == income_id,
        IncomeSource.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    source = session.exec(statement).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income source not found or you don't have access"
        )
    
    # Update fields (only those provided)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)
    
    source.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(source)
    session.commit()
    session.refresh(source)
    
    logger.info(f"Income source updated: {income_id} by user: {current_user.id}")
    return source


@router.delete("/{income_id}")
async def delete_income_source(
    income_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete an income source
    
    ⚠️ Data Isolation: Only deletes income source if owned by current_user
    """
    # Get income source with data isolation check
    statement = select(IncomeSource).where(
        IncomeSource.id == income_id,
        IncomeSource.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    source = session.exec(statement).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income source not found or you don't have access"
        )
    
    # Delete income source
    session.delete(source)
    session.commit()
    
    logger.info(f"Income source deleted: {income_id} by user: {current_user.id}")
    return {"message": "Income source deleted successfully"}
