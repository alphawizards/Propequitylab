"""
Liability Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Liability.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from decimal import Decimal
import logging
import uuid

from models.liability import Liability, LiabilityCreate, LiabilityUpdate, LIABILITY_TYPES
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/liabilities", tags=["liabilities"])


@router.get("/types")
async def get_liability_types():
    """Get list of liability types (static data, no auth required)"""
    return {"types": LIABILITY_TYPES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Liability])
async def get_portfolio_liabilities(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all non-property liabilities for a portfolio
    
    ⚠️ Data Isolation: Only returns liabilities owned by current_user
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
    
    # Get liabilities with data isolation
    statement = select(Liability).where(
        Liability.portfolio_id == portfolio_id,
        Liability.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    liabilities = session.exec(statement).all()
    
    return liabilities


@router.post("", response_model=Liability, status_code=status.HTTP_201_CREATED)
async def create_liability(
    data: LiabilityCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new liability
    
    ⚠️ Data Isolation: Liability automatically assigned to current_user
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
    
    # Create liability with user_id from authenticated user
    liability = Liability(
        id=str(uuid.uuid4()),
        user_id=current_user.id,  # CRITICAL: Set from authenticated user
        portfolio_id=data.portfolio_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
        lender=data.lender,
        original_amount=data.original_amount,
        current_balance=data.current_balance,
        interest_rate=data.interest_rate,
        is_tax_deductible=data.is_tax_deductible,
        minimum_payment=data.minimum_payment,
        payment_frequency=data.payment_frequency,
        payoff_strategy=data.payoff_strategy,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(liability)
    session.commit()
    session.refresh(liability)
    
    logger.info(f"Liability created: {liability.id} for user: {current_user.id}")
    return liability


@router.get("/{liability_id}", response_model=Liability)
async def get_liability(
    liability_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific liability
    
    ⚠️ Data Isolation: Only returns liability if owned by current_user
    """
    statement = select(Liability).where(
        Liability.id == liability_id,
        Liability.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    liability = session.exec(statement).first()
    
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liability not found or you don't have access"
        )
    
    return liability


@router.put("/{liability_id}", response_model=Liability)
async def update_liability(
    liability_id: str,
    data: LiabilityUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a liability
    
    ⚠️ Data Isolation: Only updates liability if owned by current_user
    """
    # Get liability with data isolation check
    statement = select(Liability).where(
        Liability.id == liability_id,
        Liability.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    liability = session.exec(statement).first()
    
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liability not found or you don't have access"
        )
    
    # Update fields (only those provided)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(liability, key, value)
    
    liability.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(liability)
    session.commit()
    session.refresh(liability)
    
    logger.info(f"Liability updated: {liability_id} by user: {current_user.id}")
    return liability


@router.delete("/{liability_id}")
async def delete_liability(
    liability_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a liability
    
    ⚠️ Data Isolation: Only deletes liability if owned by current_user
    """
    # Get liability with data isolation check
    statement = select(Liability).where(
        Liability.id == liability_id,
        Liability.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    liability = session.exec(statement).first()
    
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liability not found or you don't have access"
        )
    
    # Delete liability
    session.delete(liability)
    session.commit()
    
    logger.info(f"Liability deleted: {liability_id} by user: {current_user.id}")
    return {"message": "Liability deleted successfully"}
