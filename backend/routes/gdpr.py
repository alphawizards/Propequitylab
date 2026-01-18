"""
GDPR Compliance Routes
Handles data export, account deletion, and data access requests
"""

from datetime import datetime, timedelta
from typing import Dict, Any
import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from pydantic import BaseModel

from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.asset import Asset
from models.liability import Liability
from models.income import IncomeSource
from models.expense import Expense
from utils.auth import get_current_user, verify_password
from utils.database_sql import get_session


router = APIRouter(prefix="/gdpr", tags=["GDPR"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class DeleteAccountRequest(BaseModel):
    password: str


# ============================================================================
# GDPR ENDPOINTS
# ============================================================================

@router.get("/export-data")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Export all user data in JSON format (GDPR Article 20 - Right to Data Portability)
    Returns complete user data including:
    - User profile
    - Portfolios
    - Properties
    - Assets
    - Liabilities
    - Income sources
    - Expenses
    """
    try:
        # Fetch all user data
        portfolios = session.exec(
            select(Portfolio).where(Portfolio.user_id == current_user.id)
        ).all()

        properties = session.exec(
            select(Property).where(Property.user_id == current_user.id)
        ).all()

        assets = session.exec(
            select(Asset).where(Asset.user_id == current_user.id)
        ).all()

        liabilities = session.exec(
            select(Liability).where(Liability.user_id == current_user.id)
        ).all()

        income_sources = session.exec(
            select(IncomeSource).where(IncomeSource.user_id == current_user.id)
        ).all()

        expenses = session.exec(
            select(Expense).where(Expense.user_id == current_user.id)
        ).all()

        # Build complete data export
        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "user_profile": {
                "id": str(current_user.id),
                "email": current_user.email,
                "name": current_user.name,
                "country": current_user.country,
                "state": current_user.state,
                "currency": current_user.currency,
                "planning_type": current_user.planning_type,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
                "is_verified": current_user.is_verified,
                "onboarding_completed": current_user.onboarding_completed,
            },
            "portfolios": [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "description": p.description,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
                for p in portfolios
            ],
            "properties": [
                {
                    "id": str(prop.id),
                    "portfolio_id": str(prop.portfolio_id),
                    "address": prop.address,
                    "property_type": prop.property_type,
                    "purchase_price": float(prop.purchase_price) if prop.purchase_price else None,
                    "purchase_date": prop.purchase_date.isoformat() if prop.purchase_date else None,
                    "current_value": float(prop.current_value) if prop.current_value else None,
                    "land_value": float(prop.land_value) if prop.land_value else None,
                    "notes": prop.notes,
                    "created_at": prop.created_at.isoformat() if prop.created_at else None,
                }
                for prop in properties
            ],
            "assets": [
                {
                    "id": str(a.id),
                    "portfolio_id": str(a.portfolio_id) if a.portfolio_id else None,
                    "name": a.name,
                    "asset_type": a.asset_type,
                    "value": float(a.value) if a.value else None,
                    "notes": a.notes,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                }
                for a in assets
            ],
            "liabilities": [
                {
                    "id": str(l.id),
                    "portfolio_id": str(l.portfolio_id) if l.portfolio_id else None,
                    "name": l.name,
                    "liability_type": l.liability_type,
                    "amount": float(l.amount) if l.amount else None,
                    "interest_rate": float(l.interest_rate) if l.interest_rate else None,
                    "notes": l.notes,
                    "created_at": l.created_at.isoformat() if l.created_at else None,
                }
                for l in liabilities
            ],
            "income_sources": [
                {
                    "id": str(i.id),
                    "portfolio_id": str(i.portfolio_id) if i.portfolio_id else None,
                    "source_name": i.source_name,
                    "income_type": i.income_type,
                    "amount": float(i.amount) if i.amount else None,
                    "frequency": i.frequency,
                    "notes": i.notes,
                    "created_at": i.created_at.isoformat() if i.created_at else None,
                }
                for i in income_sources
            ],
            "expenses": [
                {
                    "id": str(e.id),
                    "portfolio_id": str(e.portfolio_id) if e.portfolio_id else None,
                    "category": e.category,
                    "amount": float(e.amount) if e.amount else None,
                    "frequency": e.frequency,
                    "description": e.description,
                    "created_at": e.created_at.isoformat() if e.created_at else None,
                }
                for e in expenses
            ],
            "data_summary": {
                "total_portfolios": len(portfolios),
                "total_properties": len(properties),
                "total_assets": len(assets),
                "total_liabilities": len(liabilities),
                "total_income_sources": len(income_sources),
                "total_expenses": len(expenses),
            }
        }

        return JSONResponse(
            content=export_data,
            headers={
                "Content-Disposition": f'attachment; filename="zapiio-data-export-{datetime.utcnow().strftime("%Y%m%d")}.json"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}"
        )


@router.get("/data-summary")
async def get_data_summary(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get summary of data stored (GDPR Article 15 - Right of Access)
    Provides overview of data categories and counts
    """
    try:
        # Count records for each data category
        portfolios_count = len(session.exec(
            select(Portfolio).where(Portfolio.user_id == current_user.id)
        ).all())

        properties_count = len(session.exec(
            select(Property).where(Property.user_id == current_user.id)
        ).all())

        assets_count = len(session.exec(
            select(Asset).where(Asset.user_id == current_user.id)
        ).all())

        liabilities_count = len(session.exec(
            select(Liability).where(Liability.user_id == current_user.id)
        ).all())

        income_count = len(session.exec(
            select(IncomeSource).where(IncomeSource.user_id == current_user.id)
        ).all())

        expenses_count = len(session.exec(
            select(Expense).where(Expense.user_id == current_user.id)
        ).all())

        return {
            "user_id": str(current_user.id),
            "email": current_user.email,
            "data_categories": {
                "personal_information": {
                    "description": "Name, email, location, preferences",
                    "records": 1
                },
                "portfolios": {
                    "description": "Portfolio tracking data",
                    "records": portfolios_count
                },
                "properties": {
                    "description": "Property information and valuations",
                    "records": properties_count
                },
                "assets": {
                    "description": "Asset holdings and values",
                    "records": assets_count
                },
                "liabilities": {
                    "description": "Debts and loan information",
                    "records": liabilities_count
                },
                "income_sources": {
                    "description": "Income tracking data",
                    "records": income_count
                },
                "expenses": {
                    "description": "Expense tracking data",
                    "records": expenses_count
                }
            },
            "total_records": 1 + portfolios_count + properties_count + assets_count + liabilities_count + income_count + expenses_count,
            "data_retention": "Data is retained while your account is active. Deleted accounts have a 30-day retention period before permanent deletion."
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve data summary: {str(e)}"
        )


@router.delete("/delete-account")
async def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete user account (GDPR Article 17 - Right to Erasure)

    Process:
    1. Verify password
    2. Soft delete: Mark account as deleted (30-day retention)
    3. Anonymize personal data immediately
    4. Hard delete after 30 days (handled by scheduled job)
    """
    try:
        # Verify password for security
        if not verify_password(request.password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )

        # Soft delete: Mark account for deletion
        current_user.deleted_at = datetime.utcnow()
        current_user.is_active = False

        # Anonymize personal data immediately
        current_user.email = f"deleted-{current_user.id}@zapiio.deleted"
        current_user.name = "Deleted User"
        current_user.country = None
        current_user.state = None

        session.add(current_user)
        session.commit()

        return {
            "message": "Account scheduled for deletion",
            "deletion_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "details": "Your account has been deactivated and personal data anonymized. All data will be permanently deleted in 30 days. To recover your account within this period, contact support@zapiio.com"
        }

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )
