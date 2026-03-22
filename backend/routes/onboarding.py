"""
Onboarding Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(User.id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal
import uuid
import logging

from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class OnboardingStatus(BaseModel):
    completed: bool
    current_step: int
    total_steps: int = 8
    user: Optional[Dict[str, Any]] = None


class OnboardingStepData(BaseModel):
    step: int
    data: Dict[str, Any]


@router.get("/status", response_model=OnboardingStatus)
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the current onboarding status
    
    ⚠️ Data Isolation: Returns status for the authenticated user only
    """
    # User is already authenticated via get_current_user
    # Convert user to dict for response
    user_dict = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "onboarding_completed": current_user.onboarding_completed if hasattr(current_user, 'onboarding_completed') else False,
        "onboarding_step": current_user.onboarding_step if hasattr(current_user, 'onboarding_step') else 0
    }
    
    return OnboardingStatus(
        completed=user_dict.get('onboarding_completed', False),
        current_step=user_dict.get('onboarding_step', 0),
        user=user_dict
    )


@router.put("/step/{step}")
async def save_onboarding_step(
    step: int,
    data: OnboardingStepData,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Save data for a specific onboarding step
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Map step to user fields
    update_fields = {}
    
    if step == 1:  # About You
        if 'name' in data.data:
            user.name = data.data['name']
            update_fields['name'] = data.data['name']
        if 'date_of_birth' in data.data and hasattr(user, 'date_of_birth'):
            user.date_of_birth = data.data['date_of_birth']
            update_fields['date_of_birth'] = data.data['date_of_birth']
        if 'planning_type' in data.data and hasattr(user, 'planning_type'):
            user.planning_type = data.data['planning_type']
            update_fields['planning_type'] = data.data['planning_type']
        if 'country' in data.data and hasattr(user, 'country'):
            user.country = data.data['country']
            update_fields['country'] = data.data['country']
        if 'state' in data.data and hasattr(user, 'state'):
            user.state = data.data['state']
            update_fields['state'] = data.data['state']
        if 'partner_details' in data.data and hasattr(user, 'partner_details'):
            user.partner_details = data.data['partner_details']
            update_fields['partner_details'] = data.data['partner_details']
    
    # Update step progress
    current_step = getattr(user, 'onboarding_step', 0) or 0
    new_step = max(step, current_step)
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = new_step
    update_fields['onboarding_step'] = new_step
    
    user.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(user)
    session.commit()
    session.refresh(user)
    
    logger.info(f"Onboarding step {step} saved for user: {current_user.id}")
    return {"message": f"Step {step} saved successfully", "data": update_fields}


@router.post("/complete")
async def complete_onboarding(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark onboarding as completed
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = True
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = 8
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    logger.info(f"Onboarding completed for user: {current_user.id}")
    return {"message": "Onboarding completed successfully"}


@router.post("/skip")
async def skip_onboarding(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Skip onboarding and go directly to dashboard
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = True
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = -1  # -1 indicates skipped
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info(f"Onboarding skipped for user: {current_user.id}")
    return {"message": "Onboarding skipped"}


@router.post("/reset")
async def reset_onboarding(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Reset onboarding to start fresh
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = False
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = 0
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info(f"Onboarding reset for user: {current_user.id}")
    return {"message": "Onboarding reset successfully"}


@router.post("/load-demo-data")
async def load_demo_data(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Load a comprehensive demo dataset for the current user.

    Wipes any existing portfolio data and replaces with:
    - 1 Investment Property (Sydney house with loan + rental)
    - 3 Assets (Super, Car, ETF)
    - 2 Liabilities (Car Loan, Credit Card)
    - 1 Income (Salary)
    - 6 Expenses (Mortgage, Groceries, Car, Utilities, Insurance, Entertainment)
    - 1 FIRE Plan

    Safe to call even if portfolio already exists — existing data is cleared first.
    ⚠️ Data Isolation: Only affects the authenticated user's data
    """
    try:
        # Get existing portfolio or create one
        portfolio = session.exec(
            select(Portfolio).where(Portfolio.user_id == current_user.id)
        ).first()

        if portfolio:
            # Wipe existing data so demo is clean
            for model in [Property, IncomeSource, Expense, Asset, Liability]:
                existing = session.exec(
                    select(model).where(model.portfolio_id == portfolio.id)
                ).all()
                for row in existing:
                    session.delete(row)
            session.commit()
        else:
            portfolio = Portfolio(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                name="My Portfolio",
                type="actual",
                settings={},
                goal_settings={
                    "fire_target": 2000000,
                    "target_retirement_age": 55,
                    "withdrawal_rate": 4.0,
                },
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(portfolio)
            session.commit()
            session.refresh(portfolio)

        # Also import Plan model for demo plan
        from models.plan import Plan

        # Wipe existing plans
        existing_plans = session.exec(
            select(Plan).where(Plan.portfolio_id == portfolio.id)
        ).all()
        for p in existing_plans:
            session.delete(p)
        session.commit()

        # ── Property ──────────────────────────────────────────────
        prop = Property(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            address="14 Wentworth Avenue",
            suburb="Surry Hills",
            state="NSW",
            postcode="2010",
            country="Australia",
            property_type="House",
            bedrooms=3,
            bathrooms=2,
            car_spaces=1,
            land_size=Decimal("310"),
            building_size=Decimal("180"),
            purchase_price=Decimal("880000"),
            purchase_date=date(2020, 8, 12),
            current_value=Decimal("950000"),
            status="Owned",
            loan_details={
                "amount": 760000,
                "interest_rate": 6.25,
                "loan_type": "interest_only",
                "loan_term": 30,
                "lender": "Commonwealth Bank",
                "offset_balance": 32000,
            },
            rental_details={
                "is_rented": True,
                "income": 750,
                "frequency": "weekly",
                "vacancy_rate": 2.0,
            },
            expenses={
                "strata": 0,
                "council_rates": 1900,
                "water_rates": 800,
                "insurance": 1400,
                "maintenance": 2500,
                "property_management": 3600,
                "land_tax": 1200,
            },
            growth_assumptions={
                "capital_growth_rate": 5.5,
                "rental_growth_rate": 3.0,
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(prop)

        # ── Assets ────────────────────────────────────────────────
        assets_data = [
            dict(
                name="AustralianSuper",
                type="super",
                owner="you",
                institution="AustralianSuper",
                current_value=Decimal("185000"),
                purchase_value=Decimal("95000"),
                purchase_date=date(2015, 1, 1),
                growth_rate=Decimal("8.0"),
            ),
            dict(
                name="Toyota RAV4 2022",
                type="other",
                owner="you",
                institution=None,
                current_value=Decimal("45000"),
                purchase_value=Decimal("58000"),
                purchase_date=date(2022, 3, 15),
                growth_rate=Decimal("-15.0"),
            ),
            dict(
                name="Vanguard VAS ETF",
                type="etf",
                owner="you",
                institution="Vanguard",
                current_value=Decimal("28000"),
                purchase_value=Decimal("20000"),
                purchase_date=date(2021, 6, 1),
                growth_rate=Decimal("7.5"),
            ),
        ]
        for a in assets_data:
            asset = Asset(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                portfolio_id=portfolio.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                **a,
            )
            session.add(asset)

        # ── Liabilities ───────────────────────────────────────────
        liabilities_data = [
            dict(
                name="Car Loan — Toyota RAV4",
                type="car_loan",
                owner="you",
                lender="Westpac",
                original_amount=Decimal("52000"),
                current_balance=Decimal("38000"),
                interest_rate=Decimal("7.49"),
                minimum_payment=Decimal("850"),
                payment_frequency="Monthly",
                start_date=date(2022, 3, 15),
            ),
            dict(
                name="ANZ Visa Credit Card",
                type="credit_card",
                owner="you",
                lender="ANZ",
                original_amount=Decimal("10000"),
                current_balance=Decimal("4200"),
                interest_rate=Decimal("19.99"),
                minimum_payment=Decimal("126"),
                payment_frequency="Monthly",
                start_date=date(2019, 5, 1),
            ),
        ]
        for l in liabilities_data:
            liability = Liability(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                portfolio_id=portfolio.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                **l,
            )
            session.add(liability)

        # ── Income ────────────────────────────────────────────────
        income = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="Primary Salary",
            type="salary",
            owner="you",
            amount=Decimal("120000"),
            frequency="Annual",
            growth_rate=Decimal("3.0"),
            start_date=date(2020, 1, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(income)

        # ── Expenses ──────────────────────────────────────────────
        expenses_data = [
            ("Mortgage (PPOR)", "Housing",      Decimal("2800"), "Monthly"),
            ("Groceries",       "Food",          Decimal("1000"), "Monthly"),
            ("Car Loan",        "Transport",     Decimal("850"),  "Monthly"),
            ("Utilities",       "Utilities",     Decimal("300"),  "Monthly"),
            ("Insurance",       "Insurance",     Decimal("350"),  "Monthly"),
            ("Entertainment",   "Entertainment", Decimal("400"),  "Monthly"),
        ]
        for name, category, amount, frequency in expenses_data:
            expense = Expense(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                portfolio_id=portfolio.id,
                name=name,
                category=category,
                amount=amount,
                frequency=frequency,
                start_date=date(2024, 1, 1),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(expense)

        # ── FIRE Plan ─────────────────────────────────────────────
        plan = Plan(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="FIRE by 55",
            description="Retire at 55 with $80k passive income from property and investments.",
            type="fire",
            retirement_age=55,
            life_expectancy=90,
            target_passive_income=Decimal("80000"),
            target_withdrawal_rate=Decimal("4.0"),
            inflation_rate=Decimal("2.5"),
            is_baseline=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(plan)

        # Mark onboarding complete
        user = session.exec(select(User).where(User.id == current_user.id)).first()
        if user:
            if hasattr(user, "onboarding_completed"):
                user.onboarding_completed = True
            if hasattr(user, "onboarding_step"):
                user.onboarding_step = 8
            user.updated_at = datetime.utcnow()
            session.add(user)

        session.commit()
        logger.info("Demo data loaded for user: %s", current_user.id)

        return {
            "message": "Demo data loaded successfully!",
            "summary": {
                "portfolio": portfolio.name,
                "properties": 1,
                "assets": 3,
                "liabilities": 2,
                "income_sources": 1,
                "expenses": len(expenses_data),
                "plans": 1,
            },
        }

    except Exception as e:
        session.rollback()
        logger.error("Failed to load demo data for user %s: %s", current_user.id, str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load demo data: {str(e)}",
        )


@router.post("/seed-sample-data")
async def seed_sample_data(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Seed sample data for the current user (Quick Start feature)

    Creates a demo portfolio with:
    - 2 Investment Properties
    - Salary income
    - Common expenses
    - ETF investment asset
    - Car loan liability

    ⚠️ Data Isolation: Only creates data for the authenticated user
    """
    # Check if user already has data
    existing_portfolio = session.exec(
        select(Portfolio).where(Portfolio.user_id == current_user.id)
    ).first()

    if existing_portfolio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have portfolio data. Please delete existing data before loading demo data."
        )

    try:
        # 1. Create Demo Portfolio
        portfolio = Portfolio(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            name="My Investment Portfolio",
            type="actual",
            settings={},
            goal_settings={
                "fire_target": 2000000,
                "target_retirement_age": 55,
                "withdrawal_rate": 4.0
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(portfolio)
        session.commit()
        session.refresh(portfolio)

        # 2. Create Property 1: Sydney Investment Property
        property1 = Property(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            address="42 Harbour Street",
            suburb="Sydney",
            state="NSW",
            postcode="2000",
            country="Australia",
            property_type="Apartment",
            bedrooms=2,
            bathrooms=2,
            car_spaces=1,
            land_size=Decimal("0"),
            building_size=Decimal("85"),
            purchase_price=Decimal("950000"),
            purchase_date=date(2021, 6, 15),
            current_value=Decimal("1050000"),
            status="Owned",
            loan_details={
                "amount": 760000,
                "interest_rate": 6.25,
                "loan_type": "interest_only",
                "loan_term": 30,
                "lender": "Commonwealth Bank",
                "offset_balance": 45000
            },
            rental_details={
                "is_rented": True,
                "income": 750,
                "frequency": "weekly",
                "vacancy_rate": 2.0
            },
            expenses={
                "strata": 4500,
                "council_rates": 1800,
                "water_rates": 700,
                "insurance": 1200,
                "maintenance": 2000,
                "property_management": 3500,
                "land_tax": 0
            },
            growth_assumptions={
                "capital_growth_rate": 5.0,
                "rental_growth_rate": 3.0
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(property1)

        # 3. Create Property 2: Melbourne Investment Property
        property2 = Property(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            address="15 Collins Street",
            suburb="Melbourne",
            state="VIC",
            postcode="3000",
            country="Australia",
            property_type="House",
            bedrooms=3,
            bathrooms=2,
            car_spaces=2,
            land_size=Decimal("450"),
            building_size=Decimal("180"),
            purchase_price=Decimal("850000"),
            purchase_date=date(2022, 3, 20),
            current_value=Decimal("920000"),
            status="Owned",
            loan_details={
                "amount": 680000,
                "interest_rate": 6.49,
                "loan_type": "principal_interest",
                "loan_term": 25,
                "lender": "ANZ Bank",
                "offset_balance": 25000
            },
            rental_details={
                "is_rented": True,
                "income": 620,
                "frequency": "weekly",
                "vacancy_rate": 3.0
            },
            expenses={
                "strata": 0,
                "council_rates": 2200,
                "water_rates": 900,
                "insurance": 1800,
                "maintenance": 3000,
                "property_management": 3200,
                "land_tax": 1500
            },
            growth_assumptions={
                "capital_growth_rate": 6.0,
                "rental_growth_rate": 3.5
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(property2)

        # 4. Create Income: Salary
        income1 = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="Primary Salary",
            type="salary",
            owner="you",
            amount=Decimal("145000"),
            frequency="Annual",
            start_date=date(2020, 1, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income1)

        # 5. Create Income: Partner Salary
        income2 = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="Partner Salary",
            type="salary",
            owner="partner",
            amount=Decimal("95000"),
            frequency="Annual",
            start_date=date(2020, 1, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income2)

        # 6. Create Expenses
        expenses_data = [
            {"name": "Mortgage (PPOR)", "amount": 3200, "frequency": "Monthly", "category": "Housing"},
            {"name": "Groceries", "amount": 1200, "frequency": "Monthly", "category": "Food"},
            {"name": "Utilities", "amount": 350, "frequency": "Monthly", "category": "Housing"},
            {"name": "Insurance (Health/Life)", "amount": 450, "frequency": "Monthly", "category": "Insurance"},
            {"name": "Transport", "amount": 600, "frequency": "Monthly", "category": "Transport"},
            {"name": "Entertainment", "amount": 400, "frequency": "Monthly", "category": "Lifestyle"},
        ]

        for exp_data in expenses_data:
            expense = Expense(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                portfolio_id=portfolio.id,
                name=exp_data["name"],
                amount=Decimal(str(exp_data["amount"])),
                frequency=exp_data["frequency"],
                category=exp_data["category"],
                start_date=date(2024, 1, 1),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(expense)

        # 7. Create Asset: ETF Portfolio
        asset1 = Asset(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="Vanguard ETF Portfolio",
            type="etf",
            owner="joint",
            current_value=Decimal("125000"),
            purchase_value=Decimal("95000"),
            purchase_date=date(2019, 5, 10),
            growth_rate=Decimal("7.5"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(asset1)

        # 8. Create Asset: Superannuation
        asset2 = Asset(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="Superannuation",
            type="super",
            owner="you",
            current_value=Decimal("285000"),
            purchase_value=Decimal("200000"),
            purchase_date=date(2015, 1, 1),
            growth_rate=Decimal("8.0"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(asset2)

        # 9. Create Liability: Car Loan
        liability1 = Liability(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            portfolio_id=portfolio.id,
            name="Car Loan - Tesla Model 3",
            type="car_loan",
            owner="you",
            original_amount=Decimal("65000"),
            current_balance=Decimal("42000"),
            interest_rate=Decimal("7.99"),
            minimum_payment=Decimal("1100"),
            payment_frequency="Monthly",
            start_date=date(2023, 2, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(liability1)

        # Mark onboarding as complete
        user = session.exec(select(User).where(User.id == current_user.id)).first()
        if user:
            if hasattr(user, 'onboarding_completed'):
                user.onboarding_completed = True
            if hasattr(user, 'onboarding_step'):
                user.onboarding_step = 8
            user.updated_at = datetime.utcnow()
            session.add(user)

        session.commit()

        logger.info(f"Sample data seeded successfully for user: {current_user.id}")

        return {
            "message": "Demo data loaded successfully!",
            "summary": {
                "portfolio": portfolio.name,
                "properties": 2,
                "income_sources": 2,
                "expenses": len(expenses_data),
                "assets": 2,
                "liabilities": 1
            }
        }

    except Exception as e:
        session.rollback()
        logger.error(f"Failed to seed sample data for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load demo data: {str(e)}"
        )
