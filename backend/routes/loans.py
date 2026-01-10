"""
Loans Routes - CRUD API for Loan Management
Supports multiple loans per property with detailed tracking.

⚠️ CRITICAL: All queries include user access verification for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import logging

from models.property import Property
from models.user import User
from models.financials import (
    Loan,
    LoanCreate,
    LoanUpdate,
    LoanResponse,
    ExtraRepayment,
    LumpSumPayment,
    InterestRateForecast,
)
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/loans", tags=["loans"])


def _verify_property_access(property_id: str, user_id: str, session: Session) -> Property:
    """Verify user has access to the property."""
    statement = select(Property).where(
        Property.id == property_id,
        Property.user_id == user_id
    )
    property_obj = session.exec(statement).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access"
        )
    
    return property_obj


def _verify_loan_access(loan_id: int, user_id: str, session: Session) -> Loan:
    """Verify user has access to the loan via property ownership."""
    loan = session.exec(select(Loan).where(Loan.id == loan_id)).first()
    
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Verify property ownership
    _verify_property_access(loan.property_id, user_id, session)
    
    return loan


@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    data: LoanCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new loan for a property.
    
    Supports multiple loans per property with different structures.
    """
    # Verify property access
    _verify_property_access(data.property_id, current_user.id, session)
    
    # Verify security property access if specified
    if data.security_property_id:
        _verify_property_access(data.security_property_id, current_user.id, session)
    
    # Create loan
    loan = Loan(
        property_id=data.property_id,
        lender_name=data.lender_name,
        loan_type=data.loan_type,
        loan_structure=data.loan_structure,
        original_amount=data.original_amount,
        current_amount=data.current_amount or data.original_amount,
        interest_rate=data.interest_rate,
        loan_term_years=data.loan_term_years,
        remaining_term_years=data.remaining_term_years or data.loan_term_years,
        interest_only_period_years=data.interest_only_period_years,
        repayment_frequency=data.repayment_frequency,
        offset_balance=data.offset_balance,
        security_property_id=data.security_property_id,
        start_date=data.start_date or datetime.now().date(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    session.add(loan)
    session.commit()
    session.refresh(loan)
    
    logger.info(f"Loan created: {loan.id} for property: {data.property_id}")
    return loan


@router.get("/property/{property_id}", response_model=List[LoanResponse])
async def get_property_loans(
    property_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all loans for a property.
    """
    # Verify property access
    _verify_property_access(property_id, current_user.id, session)
    
    # Get loans
    statement = select(Loan).where(Loan.property_id == property_id)
    loans = session.exec(statement).all()
    
    return loans


@router.get("/{loan_id}", response_model=LoanResponse)
async def get_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific loan by ID.
    """
    loan = _verify_loan_access(loan_id, current_user.id, session)
    return loan


@router.put("/{loan_id}", response_model=LoanResponse)
async def update_loan(
    loan_id: int,
    data: LoanUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a loan.
    """
    loan = _verify_loan_access(loan_id, current_user.id, session)
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(loan, key, value)
    
    loan.updated_at = datetime.utcnow()
    
    session.add(loan)
    session.commit()
    session.refresh(loan)
    
    logger.info(f"Loan updated: {loan_id}")
    return loan


@router.delete("/{loan_id}")
async def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a loan and all related records.
    """
    loan = _verify_loan_access(loan_id, current_user.id, session)
    
    # Delete related records
    session.exec(select(ExtraRepayment).where(ExtraRepayment.loan_id == loan_id)).all()
    for item in session.exec(select(ExtraRepayment).where(ExtraRepayment.loan_id == loan_id)).all():
        session.delete(item)
    
    for item in session.exec(select(LumpSumPayment).where(LumpSumPayment.loan_id == loan_id)).all():
        session.delete(item)
    
    for item in session.exec(select(InterestRateForecast).where(InterestRateForecast.loan_id == loan_id)).all():
        session.delete(item)
    
    # Delete loan
    session.delete(loan)
    session.commit()
    
    logger.info(f"Loan deleted: {loan_id}")
    return {"message": "Loan deleted successfully"}


# ============================================================================
# EXTRA REPAYMENTS ENDPOINTS
# ============================================================================

@router.post("/{loan_id}/extra-repayments")
async def add_extra_repayment(
    loan_id: int,
    amount: float,
    frequency: str,
    start_date: str,
    end_date: str = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add a recurring extra repayment schedule to a loan.
    """
    from decimal import Decimal
    from datetime import datetime as dt
    from models.financials import Frequency
    
    loan = _verify_loan_access(loan_id, current_user.id, session)
    
    repayment = ExtraRepayment(
        loan_id=loan_id,
        amount=Decimal(str(amount)),
        frequency=Frequency(frequency),
        start_date=dt.strptime(start_date, "%Y-%m-%d").date(),
        end_date=dt.strptime(end_date, "%Y-%m-%d").date() if end_date else None,
        created_at=datetime.utcnow(),
    )
    
    session.add(repayment)
    session.commit()
    session.refresh(repayment)
    
    return {"id": repayment.id, "message": "Extra repayment added"}


@router.post("/{loan_id}/lump-sum")
async def add_lump_sum_payment(
    loan_id: int,
    amount: float,
    payment_date: str,
    description: str = "",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add a one-time lump sum payment to a loan.
    """
    from decimal import Decimal
    from datetime import datetime as dt
    
    loan = _verify_loan_access(loan_id, current_user.id, session)
    
    payment = LumpSumPayment(
        loan_id=loan_id,
        amount=Decimal(str(amount)),
        payment_date=dt.strptime(payment_date, "%Y-%m-%d").date(),
        description=description,
        created_at=datetime.utcnow(),
    )
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    
    return {"id": payment.id, "message": "Lump sum payment added"}
