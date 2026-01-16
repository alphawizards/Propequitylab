"""
Seed Demo Data Script for PropEquityLab
Creates a realistic demo user with complete property portfolio journey.

Run with: python -m scripts.seed_demo_data
Or: python backend/scripts/seed_demo_data.py
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from datetime import datetime, date, timedelta
from decimal import Decimal
import uuid

from sqlmodel import Session, select
from utils.database_sql import engine
from utils.auth import hash_password

# Import all models
from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.income import IncomeSource
from models.asset import Asset
from models.liability import Liability
from models.expense import Expense  # Portfolio-linked expense table
from models.net_worth import NetWorthSnapshot  # Portfolio-linked net worth
from models.plan import Plan  # Portfolio-linked financial plans
from models.financials import (
    Loan, LoanType, LoanStructure, Frequency,
    PropertyValuation, GrowthRatePeriod, RentalIncome,
    ExpenseLog, DepreciationSchedule
)


# ============================================================================
# DEMO USER CONFIGURATION
# ============================================================================

DEMO_USER = {
    "email": "demo@propequitylab.com",
    "password": "DemoPass123!",
    "name": "Alex Thompson",
    "date_of_birth": "1985-06-15",
    "subscription_tier": "premium",
}

# Additional test users for tier testing
TEST_USERS = [
    {
        "email": "free@test.propequitylab.com",
        "password": "TestPass123!",
        "name": "Free User",
        "subscription_tier": "free",
    },
    {
        "email": "premium@test.propequitylab.com", 
        "password": "TestPass123!",
        "name": "Premium User",
        "subscription_tier": "pro",
    },
    {
        "email": "pro@test.propequitylab.com",
        "password": "TestPass123!",
        "name": "Pro User", 
        "subscription_tier": "enterprise",
    },
]


def generate_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())[:8]


def clear_demo_data(session: Session):
    """Clear existing demo data to allow re-seeding"""
    print("🧹 Clearing existing demo data...")
    
    # Find demo user
    demo_user = session.exec(
        select(User).where(User.email == DEMO_USER["email"])
    ).first()
    
    if demo_user:
        # Delete in order of dependencies (child tables first)
        portfolios = session.exec(
            select(Portfolio).where(Portfolio.user_id == demo_user.id)
        ).all()
        
        for portfolio in portfolios:
            # Delete financial tables linked to portfolio properties
            properties = session.exec(
                select(Property).where(Property.portfolio_id == portfolio.id)
            ).all()
            
            for prop in properties:
                # Delete loans
                session.exec(select(Loan).where(Loan.property_id == prop.id))
                for loan in session.exec(select(Loan).where(Loan.property_id == prop.id)).all():
                    session.delete(loan)
                
                # Delete valuations
                for val in session.exec(select(PropertyValuation).where(PropertyValuation.property_id == prop.id)).all():
                    session.delete(val)
                
                # Delete growth rates
                for gr in session.exec(select(GrowthRatePeriod).where(GrowthRatePeriod.property_id == prop.id)).all():
                    session.delete(gr)
                
                # Delete rental income
                for ri in session.exec(select(RentalIncome).where(RentalIncome.property_id == prop.id)).all():
                    session.delete(ri)
                
                # Delete expenses
                for exp in session.exec(select(ExpenseLog).where(ExpenseLog.property_id == prop.id)).all():
                    session.delete(exp)
                
                session.delete(prop)
            
            # Delete income sources
            for inc in session.exec(select(IncomeSource).where(IncomeSource.portfolio_id == portfolio.id)).all():
                session.delete(inc)
            
            # Delete assets
            for asset in session.exec(select(Asset).where(Asset.portfolio_id == portfolio.id)).all():
                session.delete(asset)
            
            # Delete liabilities
            for liab in session.exec(select(Liability).where(Liability.portfolio_id == portfolio.id)).all():
                session.delete(liab)
            
            # Delete expenses (personal expenses)
            from models.expense import Expense
            for exp in session.exec(select(Expense).where(Expense.portfolio_id == portfolio.id)).all():
                session.delete(exp)
            
            # Delete net worth snapshots (must be before portfolio due to FK)
            from models.net_worth import NetWorthSnapshot
            for snap in session.exec(select(NetWorthSnapshot).where(NetWorthSnapshot.portfolio_id == portfolio.id)).all():
                session.delete(snap)
            
            session.delete(portfolio)
        
        session.delete(demo_user)
        session.commit()
        print("✅ Cleared existing demo user data")
    
    # Clear test users too
    for test_user_data in TEST_USERS:
        test_user = session.exec(
            select(User).where(User.email == test_user_data["email"])
        ).first()
        if test_user:
            # Delete portfolios first (cascades to properties, etc.)
            test_portfolios = session.exec(
                select(Portfolio).where(Portfolio.user_id == test_user.id)
            ).all()
            for portfolio in test_portfolios:
                # Clean up portfolio's properties and related data
                properties = session.exec(
                    select(Property).where(Property.portfolio_id == portfolio.id)
                ).all()
                for prop in properties:
                    for loan in session.exec(select(Loan).where(Loan.property_id == prop.id)).all():
                        session.delete(loan)
                    for val in session.exec(select(PropertyValuation).where(PropertyValuation.property_id == prop.id)).all():
                        session.delete(val)
                    for gr in session.exec(select(GrowthRatePeriod).where(GrowthRatePeriod.property_id == prop.id)).all():
                        session.delete(gr)
                    for ri in session.exec(select(RentalIncome).where(RentalIncome.property_id == prop.id)).all():
                        session.delete(ri)
                    for exp in session.exec(select(ExpenseLog).where(ExpenseLog.property_id == prop.id)).all():
                        session.delete(exp)
                    session.delete(prop)
                # Delete income sources, assets, liabilities
                for inc in session.exec(select(IncomeSource).where(IncomeSource.portfolio_id == portfolio.id)).all():
                    session.delete(inc)
                for asset in session.exec(select(Asset).where(Asset.portfolio_id == portfolio.id)).all():
                    session.delete(asset)
                for liab in session.exec(select(Liability).where(Liability.portfolio_id == portfolio.id)).all():
                    session.delete(liab)
                # Delete additional portfolio-linked tables
                for expense in session.exec(select(Expense).where(Expense.portfolio_id == portfolio.id)).all():
                    session.delete(expense)
                for networth in session.exec(select(NetWorthSnapshot).where(NetWorthSnapshot.portfolio_id == portfolio.id)).all():
                    session.delete(networth)
                for plan in session.exec(select(Plan).where(Plan.portfolio_id == portfolio.id)).all():
                    session.delete(plan)
                session.delete(portfolio)
            session.delete(test_user)
            print(f"  ✅ Cleared: {test_user.email}")
    session.commit()


def create_demo_user(session: Session) -> User:
    """Create the main demo user"""
    print("👤 Creating demo user...")
    
    user = User(
        id=generate_id(),
        email=DEMO_USER["email"],
        password_hash=hash_password(DEMO_USER["password"]),
        name=DEMO_USER["name"],
        date_of_birth=DEMO_USER["date_of_birth"],
        subscription_tier=DEMO_USER["subscription_tier"],
        onboarding_completed=True,
        onboarding_step=5,
        is_verified=True,
        planning_type="individual",
        country="Australia",
        state="NSW",
        currency="AUD",
        created_at=datetime(2024, 1, 15, 10, 30, 0),
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    print(f"✅ Created demo user: {user.email}")
    return user


def create_test_users(session: Session):
    """Create additional test users for tier testing"""
    print("👥 Creating test users...")
    
    for user_data in TEST_USERS:
        user = User(
            id=generate_id(),
            email=user_data["email"],
            password_hash=hash_password(user_data["password"]),
            name=user_data["name"],
            subscription_tier=user_data["subscription_tier"],
            onboarding_completed=False,
            onboarding_step=0,
            is_verified=True,
            planning_type="individual",
            country="Australia",
            state="NSW",
            currency="AUD",
        )
        session.add(user)
        print(f"  ✅ Created: {user.email} ({user.subscription_tier})")
    
    session.commit()


def create_portfolio(session: Session, user: User) -> Portfolio:
    """Create demo portfolio"""
    print("📁 Creating portfolio...")
    
    portfolio = Portfolio(
        id=generate_id(),
        user_id=user.id,
        name="Investment Properties",
        type="actual",
        settings={
            "default_capital_growth_rate": 5.0,
            "default_rental_growth_rate": 3.0,
            "default_interest_rate": 6.25,
            "default_inflation_rate": 2.5,
        },
        goal_settings={
            "retirement_age": 55,
            "equity_target": 2000000,
            "passive_income_target": 80000,
            "property_count_target": 5,
        },
        created_at=datetime(2024, 1, 15, 10, 35, 0),
    )
    
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    print(f"✅ Created portfolio: {portfolio.name}")
    return portfolio


def create_property_1(session: Session, user: User, portfolio: Portfolio) -> Property:
    """Create Property 1: Cronulla Beach House (purchased 2020)"""
    print("🏠 Creating Property 1: Cronulla Beach House...")
    
    prop = Property(
        id=generate_id(),
        user_id=user.id,
        portfolio_id=portfolio.id,
        address="123 Beach Road",
        suburb="Cronulla",
        state="NSW",
        postcode="2230",
        property_type="house",
        bedrooms=3,
        bathrooms=2,
        car_spaces=1,
        land_size=Decimal("450.00"),
        building_size=Decimal("180.00"),
        year_built=1995,
        purchase_price=Decimal("500000.0000"),
        purchase_date=date(2020, 3, 15),
        stamp_duty=Decimal("17990.0000"),
        purchase_costs=Decimal("4000.0000"),
        current_value=Decimal("650000.0000"),
        last_valuation_date=date(2026, 1, 11),
        loan_details={
            "amount": 365000,
            "interest_rate": 5.0,
            "loan_type": "principal_interest",
            "loan_term": 30,
            "lender": "Commonwealth Bank",
            "offset_balance": 15000,
        },
        rental_details={
            "income": 600,
            "frequency": "weekly",
            "vacancy_rate": 2.0,
            "is_rented": True,
        },
        expenses={
            "strata": 0,
            "council_rates": 2400,
            "water_rates": 1100,
            "insurance": 2250,
            "maintenance": 2000,
            "property_management": 2340,  # 7.5% of rent
            "land_tax": 0,
            "other": 500,
        },
        growth_assumptions={
            "capital_growth_rate": 5.0,
            "rental_growth_rate": 3.0,
        },
        notes="Investment property purchased in 2020. Has performed well with consistent rental demand.",
        created_at=datetime(2024, 1, 15, 11, 0, 0),
    )
    
    session.add(prop)
    session.commit()
    session.refresh(prop)
    print(f"✅ Created property: {prop.address}, {prop.suburb}")
    return prop


def create_property_2(session: Session, user: User, portfolio: Portfolio) -> Property:
    """Create Property 2: Parramatta Unit (purchased 2023)"""
    print("🏢 Creating Property 2: Parramatta Unit...")
    
    prop = Property(
        id=generate_id(),
        user_id=user.id,
        portfolio_id=portfolio.id,
        address="45/120 City View Boulevard",
        suburb="Parramatta",
        state="NSW",
        postcode="2150",
        property_type="unit",
        bedrooms=2,
        bathrooms=2,
        car_spaces=1,
        land_size=Decimal("0.00"),  # Unit
        building_size=Decimal("85.00"),
        year_built=2021,
        purchase_price=Decimal("800000.0000"),
        purchase_date=date(2023, 6, 20),
        stamp_duty=Decimal("31490.0000"),
        purchase_costs=Decimal("4800.0000"),
        current_value=Decimal("850000.0000"),
        last_valuation_date=date(2026, 1, 11),
        loan_details={
            "amount": 625000,
            "interest_rate": 6.2,
            "loan_type": "interest_only",
            "loan_term": 30,
            "lender": "Westpac",
            "offset_balance": 8000,
        },
        rental_details={
            "income": 650,
            "frequency": "weekly",
            "vacancy_rate": 3.0,
            "is_rented": True,
        },
        expenses={
            "strata": 4800,
            "council_rates": 1600,
            "water_rates": 800,
            "insurance": 380,
            "maintenance": 500,
            "property_management": 2535,  # 7.5% of rent
            "land_tax": 0,
            "other": 0,
        },
        growth_assumptions={
            "capital_growth_rate": 4.0,
            "rental_growth_rate": 3.0,
        },
        notes="New modern unit near Parramatta CBD. Interest-only for first 5 years.",
        created_at=datetime(2024, 1, 15, 11, 30, 0),
    )
    
    session.add(prop)
    session.commit()
    session.refresh(prop)
    print(f"✅ Created property: {prop.address}, {prop.suburb}")
    return prop


def create_loans(session: Session, property_1: Property, property_2: Property):
    """Create detailed loan records"""
    print("💰 Creating loans...")
    
    # Loan for Property 1
    loan1 = Loan(
        property_id=property_1.id,
        lender_name="Commonwealth Bank",
        loan_type=LoanType.PRINCIPAL_LOAN,
        loan_structure=LoanStructure.PRINCIPAL_AND_INTEREST,
        original_amount=Decimal("400000.0000"),
        current_amount=Decimal("365000.0000"),
        interest_rate=Decimal("5.00"),
        loan_term_years=30,
        remaining_term_years=24,
        interest_only_period_years=0,
        repayment_frequency=Frequency.MONTHLY,
        offset_balance=Decimal("15000.0000"),
        start_date=date(2020, 3, 15),
    )
    session.add(loan1)
    
    # Loan for Property 2
    loan2 = Loan(
        property_id=property_2.id,
        lender_name="Westpac",
        loan_type=LoanType.PRINCIPAL_LOAN,
        loan_structure=LoanStructure.INTEREST_ONLY,
        original_amount=Decimal("640000.0000"),
        current_amount=Decimal("625000.0000"),
        interest_rate=Decimal("6.20"),
        loan_term_years=30,
        remaining_term_years=27,
        interest_only_period_years=5,
        repayment_frequency=Frequency.MONTHLY,
        offset_balance=Decimal("8000.0000"),
        start_date=date(2023, 6, 20),
    )
    session.add(loan2)
    session.commit()
    print("✅ Created 2 loans")


def create_valuations(session: Session, property_1: Property, property_2: Property):
    """Create historical property valuations"""
    print("📈 Creating property valuations...")
    
    # Property 1 valuations (2020-2026)
    p1_valuations = [
        (date(2020, 3, 15), Decimal("500000.0000"), "purchase"),
        (date(2021, 3, 15), Decimal("525000.0000"), "estimate"),
        (date(2022, 3, 15), Decimal("550000.0000"), "appraisal"),
        (date(2023, 3, 15), Decimal("580000.0000"), "estimate"),
        (date(2024, 3, 15), Decimal("600000.0000"), "appraisal"),
        (date(2025, 1, 15), Decimal("620000.0000"), "estimate"),
        (date(2026, 1, 11), Decimal("650000.0000"), "current"),
    ]
    
    for val_date, val_amount, val_source in p1_valuations:
        session.add(PropertyValuation(
            property_id=property_1.id,
            valuation_date=val_date,
            value=val_amount,
            valuation_source=val_source,
        ))
    
    # Property 2 valuations (2023-2026)
    p2_valuations = [
        (date(2023, 6, 20), Decimal("800000.0000"), "purchase"),
        (date(2024, 6, 20), Decimal("820000.0000"), "estimate"),
        (date(2025, 6, 20), Decimal("840000.0000"), "estimate"),
        (date(2026, 1, 11), Decimal("850000.0000"), "current"),
    ]
    
    for val_date, val_amount, val_source in p2_valuations:
        session.add(PropertyValuation(
            property_id=property_2.id,
            valuation_date=val_date,
            value=val_amount,
            valuation_source=val_source,
        ))
    
    session.commit()
    print("✅ Created 11 property valuations")


def create_growth_rates(session: Session, property_1: Property, property_2: Property):
    """Create growth rate periods for projections"""
    print("📊 Creating growth rate periods...")
    
    # Property 1 growth periods
    session.add(GrowthRatePeriod(
        property_id=property_1.id,
        start_year=2020,
        end_year=2025,
        growth_rate=Decimal("5.00"),
    ))
    session.add(GrowthRatePeriod(
        property_id=property_1.id,
        start_year=2026,
        end_year=2030,
        growth_rate=Decimal("3.50"),
    ))
    session.add(GrowthRatePeriod(
        property_id=property_1.id,
        start_year=2031,
        end_year=None,  # Ongoing
        growth_rate=Decimal("3.00"),
    ))
    
    # Property 2 growth periods
    session.add(GrowthRatePeriod(
        property_id=property_2.id,
        start_year=2023,
        end_year=2028,
        growth_rate=Decimal("4.00"),
    ))
    session.add(GrowthRatePeriod(
        property_id=property_2.id,
        start_year=2029,
        end_year=None,
        growth_rate=Decimal("3.00"),
    ))
    
    session.commit()
    print("✅ Created 5 growth rate periods")


def create_rental_income(session: Session, property_1: Property, property_2: Property):
    """Create rental income history"""
    print("🏘️ Creating rental income records...")
    
    # Property 1 rental history
    session.add(RentalIncome(
        property_id=property_1.id,
        amount=Decimal("500.00"),
        frequency=Frequency.WEEKLY,
        growth_rate=Decimal("3.00"),
        vacancy_weeks_per_year=2,
        start_date=date(2020, 4, 1),
        end_date=date(2022, 3, 31),
    ))
    session.add(RentalIncome(
        property_id=property_1.id,
        amount=Decimal("550.00"),
        frequency=Frequency.WEEKLY,
        growth_rate=Decimal("3.00"),
        vacancy_weeks_per_year=2,
        start_date=date(2022, 4, 15),
        end_date=date(2024, 4, 14),
    ))
    session.add(RentalIncome(
        property_id=property_1.id,
        amount=Decimal("600.00"),
        frequency=Frequency.WEEKLY,
        growth_rate=Decimal("3.00"),
        vacancy_weeks_per_year=2,
        start_date=date(2024, 5, 1),
        end_date=None,  # Current
    ))
    
    # Property 2 rental
    session.add(RentalIncome(
        property_id=property_2.id,
        amount=Decimal("650.00"),
        frequency=Frequency.WEEKLY,
        growth_rate=Decimal("3.00"),
        vacancy_weeks_per_year=3,
        start_date=date(2023, 7, 15),
        end_date=None,  # Current
    ))
    
    session.commit()
    print("✅ Created 4 rental income records")


def create_expenses(session: Session, property_1: Property, property_2: Property):
    """Create property expense records"""
    print("💸 Creating expense records...")
    
    # Property 1 annual expenses
    p1_expenses = [
        ("council_rates", "Council Rates", Decimal("2400.00")),
        ("water_rates", "Water Rates", Decimal("1100.00")),
        ("insurance", "Building Insurance", Decimal("1800.00")),
        ("landlord_insurance", "Landlord Insurance", Decimal("450.00")),
        ("maintenance", "General Maintenance", Decimal("2000.00")),
        ("property_management", "Property Management Fees", Decimal("2340.00")),
    ]
    
    for category, description, amount in p1_expenses:
        session.add(ExpenseLog(
            property_id=property_1.id,
            category=category,
            description=description,
            amount=amount,
            frequency=Frequency.ANNUALLY,
            growth_rate=Decimal("2.50"),
            start_date=date(2020, 4, 1),
            end_date=None,
        ))
    
    # Property 2 annual expenses
    p2_expenses = [
        ("strata", "Strata Levies", Decimal("4800.00")),
        ("council_rates", "Council Rates", Decimal("1600.00")),
        ("water_rates", "Water Rates", Decimal("800.00")),
        ("landlord_insurance", "Landlord Insurance", Decimal("380.00")),
        ("property_management", "Property Management Fees", Decimal("2535.00")),
    ]
    
    for category, description, amount in p2_expenses:
        session.add(ExpenseLog(
            property_id=property_2.id,
            category=category,
            description=description,
            amount=amount,
            frequency=Frequency.ANNUALLY,
            growth_rate=Decimal("2.50"),
            start_date=date(2023, 7, 1),
            end_date=None,
        ))
    
    session.commit()
    print("✅ Created 11 expense records")


def create_income_sources(session: Session, user: User, portfolio: Portfolio):
    """Create personal income sources"""
    print("💵 Creating income sources...")
    
    # Salary
    session.add(IncomeSource(
        id=generate_id(),
        user_id=user.id,
        portfolio_id=portfolio.id,
        name="Software Engineering Salary",
        type="salary",
        owner="you",
        amount=Decimal("120000.0000"),
        frequency="annual",
        growth_rate=Decimal("3.0"),
        start_date=date(2022, 3, 1),
        end_date=None,
        is_taxable=True,
        notes="TechCorp Australia - Full-time position",
    ))
    
    # Dividends
    session.add(IncomeSource(
        id=generate_id(),
        user_id=user.id,
        portfolio_id=portfolio.id,
        name="Dividend Income",
        type="dividend",
        owner="you",
        amount=Decimal("2400.0000"),
        frequency="annual",
        growth_rate=Decimal("4.0"),
        start_date=date(2020, 1, 1),
        end_date=None,
        is_taxable=True,
        notes="Share portfolio dividends - mostly franked",
    ))
    
    session.commit()
    print("✅ Created 2 income sources")


def create_personal_expenses(session: Session, user: User, portfolio: Portfolio):
    """Create personal/living expenses for the portfolio"""
    print("💸 Creating personal expenses...")
    
    from models.expense import Expense
    
    expenses_data = [
        {"name": "Groceries & Food", "category": "food", "amount": Decimal("800"), "frequency": "monthly"},
        {"name": "Health Insurance", "category": "insurance", "amount": Decimal("180"), "frequency": "monthly"},
        {"name": "Utilities (Gas/Electric)", "category": "utilities", "amount": Decimal("250"), "frequency": "monthly"},
        {"name": "Internet & Mobile", "category": "utilities", "amount": Decimal("120"), "frequency": "monthly"},
        {"name": "Transport & Fuel", "category": "transport", "amount": Decimal("400"), "frequency": "monthly"},
        {"name": "Entertainment & Dining", "category": "entertainment", "amount": Decimal("300"), "frequency": "monthly"},
        {"name": "Personal & Misc", "category": "personal", "amount": Decimal("200"), "frequency": "monthly"},
        {"name": "Gym Membership", "category": "health", "amount": Decimal("65"), "frequency": "monthly"},
    ]
    
    for exp_data in expenses_data:
        expense = Expense(
            id=generate_id(),
            user_id=user.id,
            portfolio_id=portfolio.id,
            name=exp_data["name"],
            category=exp_data["category"],
            amount=exp_data["amount"],
            frequency=exp_data["frequency"],
            is_active=True,
        )
        session.add(expense)
    
    session.commit()
    print(f"✅ Created {len(expenses_data)} personal expenses")


def create_assets(session: Session, user: User, portfolio: Portfolio):
    """Create non-property assets"""
    print("💎 Creating assets...")
    
    assets_data = [
        {
            "name": "Emergency Savings",
            "type": "cash",
            "institution": "ING",
            "current_value": Decimal("45000.0000"),
            "expected_return": Decimal("5.0"),
        },
        {
            "name": "Share Portfolio",
            "type": "shares",
            "institution": "CommSec",
            "current_value": Decimal("85000.0000"),
            "expected_return": Decimal("8.0"),
            "ticker": "VAS,VGS,CBA",
        },
        {
            "name": "Superannuation",
            "type": "super",
            "institution": "AustralianSuper",
            "current_value": Decimal("180000.0000"),
            "expected_return": Decimal("6.5"),
            "tax_environment": "tax_deferred",
        },
        {
            "name": "Toyota RAV4 2022",
            "type": "other",
            "institution": "",
            "current_value": Decimal("35000.0000"),
            "expected_return": Decimal("-15.0"),  # Depreciating
        },
    ]
    
    for asset_data in assets_data:
        session.add(Asset(
            id=generate_id(),
            user_id=user.id,
            portfolio_id=portfolio.id,
            name=asset_data["name"],
            type=asset_data["type"],
            owner="you",
            institution=asset_data.get("institution", ""),
            current_value=asset_data["current_value"],
            expected_return=asset_data.get("expected_return", Decimal("7.0")),
            ticker=asset_data.get("ticker"),
            tax_environment=asset_data.get("tax_environment", "taxable"),
        ))
    
    session.commit()
    print("✅ Created 4 assets")


def create_liabilities(session: Session, user: User, portfolio: Portfolio):
    """Create non-property liabilities"""
    print("📉 Creating liabilities...")
    
    # Car Loan
    session.add(Liability(
        id=generate_id(),
        user_id=user.id,
        portfolio_id=portfolio.id,
        name="Car Loan",
        type="car_loan",
        owner="you",
        lender="NAB",
        original_amount=Decimal("35000.0000"),
        current_balance=Decimal("18000.0000"),
        interest_rate=Decimal("7.50"),
        minimum_payment=Decimal("700.0000"),
        payment_frequency="monthly",
        payoff_strategy="minimum",
        target_payoff_date=date(2027, 8, 15),
    ))
    
    # Credit Card
    session.add(Liability(
        id=generate_id(),
        user_id=user.id,
        portfolio_id=portfolio.id,
        name="Visa Credit Card",
        type="credit_card",
        owner="you",
        lender="Westpac",
        original_amount=Decimal("15000.0000"),  # Credit limit
        current_balance=Decimal("2500.0000"),
        interest_rate=Decimal("18.00"),
        minimum_payment=Decimal("100.0000"),
        payment_frequency="monthly",
        payoff_strategy="aggressive",
        notes="Pay off in full each month where possible",
    ))
    
    session.commit()
    print("✅ Created 2 liabilities")


def update_portfolio_totals(session: Session, portfolio: Portfolio):
    """Update portfolio financial summary"""
    print("📊 Updating portfolio totals...")
    
    # Calculate totals from related records
    properties = session.exec(
        select(Property).where(Property.portfolio_id == portfolio.id)
    ).all()
    
    total_property_value = sum(p.current_value for p in properties)
    total_loan_amount = Decimal("0")
    
    for prop in properties:
        if prop.loan_details and "amount" in prop.loan_details:
            total_loan_amount += Decimal(str(prop.loan_details["amount"]))
    
    # Get assets
    assets = session.exec(
        select(Asset).where(Asset.portfolio_id == portfolio.id)
    ).all()
    total_assets = sum(a.current_value for a in assets) + total_property_value
    
    # Get liabilities
    liabilities = session.exec(
        select(Liability).where(Liability.portfolio_id == portfolio.id)
    ).all()
    total_liabilities = sum(l.current_balance for l in liabilities) + total_loan_amount
    
    # Update portfolio
    portfolio.total_property_value = total_property_value
    portfolio.total_loan_amount = total_loan_amount
    portfolio.total_equity = total_property_value - total_loan_amount
    portfolio.total_assets = total_assets
    portfolio.total_liabilities = total_liabilities
    portfolio.net_worth = total_assets - total_liabilities
    
    # Calculate annual income (rough estimate)
    income_sources = session.exec(
        select(IncomeSource).where(IncomeSource.portfolio_id == portfolio.id)
    ).all()
    portfolio.annual_income = sum(i.amount for i in income_sources)
    
    # Add rental income
    rental_annual = Decimal("0")
    for prop in properties:
        if prop.rental_details and "income" in prop.rental_details:
            weekly = Decimal(str(prop.rental_details["income"]))
            rental_annual += weekly * 52
    portfolio.annual_income += rental_annual
    
    # Estimate expenses (property + living)
    portfolio.annual_expenses = Decimal("52000")  # Rough estimate
    portfolio.annual_cashflow = portfolio.annual_income - portfolio.annual_expenses
    
    session.add(portfolio)
    session.commit()
    
    print(f"✅ Portfolio updated:")
    print(f"   Net Worth: ${portfolio.net_worth:,.2f}")
    print(f"   Total Assets: ${portfolio.total_assets:,.2f}")
    print(f"   Total Liabilities: ${portfolio.total_liabilities:,.2f}")


def create_net_worth_snapshots(session: Session, user: User, portfolio: Portfolio):
    """Create historical net worth snapshots for the chart"""
    print("📊 Creating net worth snapshots...")
    
    from models.net_worth import NetWorthSnapshot
    
    # Create 6 months of historical snapshots
    base_net_worth = Decimal("750000")
    base_assets = Decimal("1700000")
    base_liabilities = Decimal("950000")
    
    for months_ago in range(6, 0, -1):
        # Simulate growth over time
        growth_factor = Decimal(str(1 + (6 - months_ago) * 0.02))  # 2% growth per month
        snapshot_date = date.today() - timedelta(days=months_ago * 30)
        
        snapshot = NetWorthSnapshot(
            id=generate_id() + str(months_ago),
            user_id=user.id,
            portfolio_id=portfolio.id,
            date=snapshot_date,
            total_assets=base_assets * growth_factor,
            total_liabilities=base_liabilities,
            net_worth=base_net_worth * growth_factor,
            asset_breakdown={
                "properties": float(Decimal("1400000") * growth_factor),
                "super": 175000,
                "shares": 80000,
                "cash": 45000,
                "other": 0
            },
            liability_breakdown={
                "property_loans": 930000,
                "car_loans": 18000,
                "credit_cards": 2500,
                "hecs": 0,
                "other": 0
            },
            monthly_income=10200,
            monthly_expenses=0,
            monthly_cashflow=10200,
            savings_rate=100,
        )
        session.add(snapshot)
    
    session.commit()
    print("✅ Created 6 historical snapshots")


def main():
    """Main seed function"""
    print("\n" + "="*60)
    print("🌱 PropEquityLab Demo Data Seeder")
    print("="*60 + "\n")
    
    with Session(engine) as session:
        # Clear existing demo data
        clear_demo_data(session)
        
        # Create users
        demo_user = create_demo_user(session)
        create_test_users(session)
        
        # Create portfolio
        portfolio = create_portfolio(session, demo_user)
        
        # Create properties
        property_1 = create_property_1(session, demo_user, portfolio)
        property_2 = create_property_2(session, demo_user, portfolio)
        
        # Create detailed financial data
        create_loans(session, property_1, property_2)
        create_valuations(session, property_1, property_2)
        create_growth_rates(session, property_1, property_2)
        create_rental_income(session, property_1, property_2)
        create_expenses(session, property_1, property_2)
        
        # Create personal finances
        create_income_sources(session, demo_user, portfolio)
        create_personal_expenses(session, demo_user, portfolio)
        create_assets(session, demo_user, portfolio)
        create_liabilities(session, demo_user, portfolio)
        
        # Update portfolio totals
        update_portfolio_totals(session, portfolio)
        
        # Create historical net worth snapshots
        create_net_worth_snapshots(session, demo_user, portfolio)
    
    print("\n" + "="*60)
    print("✅ Demo data seeding complete!")
    print("="*60)
    print("\n📧 Demo Account:")
    print(f"   Email: {DEMO_USER['email']}")
    print(f"   Password: {DEMO_USER['password']}")
    print("\n🧪 Test Accounts:")
    for user in TEST_USERS:
        print(f"   {user['email']} ({user['subscription_tier']})")
    print()


if __name__ == "__main__":
    main()
