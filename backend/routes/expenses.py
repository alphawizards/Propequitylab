"""
Expense Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(Expense.user_id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from decimal import Decimal
import logging
import uuid

from models.expense import Expense, ExpenseCreate, ExpenseUpdate, EXPENSE_CATEGORIES
from models.portfolio import Portfolio
from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("/categories")
async def get_expense_categories():
    """Get list of expense categories (static data, no auth required)"""
    return {"categories": EXPENSE_CATEGORIES}


@router.get("/portfolio/{portfolio_id}", response_model=List[Expense])
async def get_portfolio_expenses(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all expenses for a portfolio
    
    ⚠️ Data Isolation: Only returns expenses owned by current_user
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
    
    # Get expenses with data isolation
    statement = select(Expense).where(
        Expense.portfolio_id == portfolio_id,
        Expense.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    expenses = session.exec(statement).all()
    
    return expenses


@router.post("", response_model=Expense, status_code=status.HTTP_201_CREATED)
async def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new expense
    
    ⚠️ Data Isolation: Expense automatically assigned to current_user
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
    
    # Create expense with user_id from authenticated user
    expense = Expense(
        id=str(uuid.uuid4()),
        user_id=current_user.id,  # CRITICAL: Set from authenticated user
        portfolio_id=data.portfolio_id,
        name=data.name,
        category=data.category,
        amount=data.amount,
        frequency=data.frequency,
        inflation_rate=data.inflation_rate,
        start_date=data.start_date,
        end_date=data.end_date,
        retirement_percentage=data.retirement_percentage,
        is_tax_deductible=data.is_tax_deductible,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(expense)
    session.commit()
    session.refresh(expense)
    
    logger.info(f"Expense created: {expense.id} for user: {current_user.id}")
    return expense


@router.get("/{expense_id}", response_model=Expense)
async def get_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific expense
    
    ⚠️ Data Isolation: Only returns expense if owned by current_user
    """
    statement = select(Expense).where(
        Expense.id == expense_id,
        Expense.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    expense = session.exec(statement).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or you don't have access"
        )
    
    return expense


@router.put("/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: str,
    data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update an expense
    
    ⚠️ Data Isolation: Only updates expense if owned by current_user
    """
    # Get expense with data isolation check
    statement = select(Expense).where(
        Expense.id == expense_id,
        Expense.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    expense = session.exec(statement).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or you don't have access"
        )
    
    # Update fields (only those provided)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    
    expense.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(expense)
    session.commit()
    session.refresh(expense)
    
    logger.info(f"Expense updated: {expense_id} by user: {current_user.id}")
    return expense


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete an expense
    
    ⚠️ Data Isolation: Only deletes expense if owned by current_user
    """
    # Get expense with data isolation check
    statement = select(Expense).where(
        Expense.id == expense_id,
        Expense.user_id == current_user.id  # CRITICAL: Data isolation filter
    )
    expense = session.exec(statement).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or you don't have access"
        )
    
    # Delete expense
    session.delete(expense)
    session.commit()
    
    logger.info(f"Expense deleted: {expense_id} by user: {current_user.id}")
    return {"message": "Expense deleted successfully"}
