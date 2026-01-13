"""
Seed sample data for Premium user - demonstrates 2 portfolios, 3 properties, comprehensive financials
"""
import os
import sys
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlmodel import Session, select

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from models.portfolio import Portfolio
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from models.user import User
from utils.database_sql import engine

# Premium user email
PREMIUM_USER_EMAIL = "premium@test.propequitylab.com"

def seed_premium_user_data():
    """Seed comprehensive sample data for Premium user"""

    with Session(engine) as session:
        # Get Premium user
        user = session.exec(select(User).where(User.email == PREMIUM_USER_EMAIL)).first()
        if not user:
            print(f"[ERROR] User not found: {PREMIUM_USER_EMAIL}")
            return

        print(f"[*] Seeding data for: {user.email} (ID: {user.id})")

        # ========================================
        # PORTFOLIO 1: Personal
        # ========================================
        print("\n[PORTFOLIO 1] Creating Portfolio 1: Personal")
        portfolio1 = Portfolio(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Personal",
            type="actual",
            settings={},
            goal_settings={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(portfolio1)
        session.commit()
        session.refresh(portfolio1)
        print(f"   [OK] Portfolio: {portfolio1.name} (ID: {portfolio1.id})")

        # Property 1: PPOR (Principal Place of Residence)
        print("\n[PROPERTY] Property 1: PPOR in Parramatta")
        prop1 = Property(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            address="45 George Street",
            suburb="Parramatta",
            state="NSW",
            postcode="2150",
            property_type="house",
            bedrooms=4,
            bathrooms=2,
            car_spaces=2,
            land_size=Decimal("650.00"),
            building_size=Decimal("220.00"),
            year_built=2018,
            purchase_price=Decimal("950000.0000"),
            purchase_date=date(2022, 3, 15),
            stamp_duty=Decimal("38000.0000"),
            purchase_costs=Decimal("8500.0000"),
            current_value=Decimal("1050000.0000"),
            last_valuation_date=date(2024, 12, 1),
            loan_details={
                "amount": 760000.00,
                "interest_rate": 6.25,
                "loan_type": "principal_interest",
                "loan_term": 30,
                "lender": "ANZ Bank",
                "offset_balance": 15000.00
            },
            rental_details={},
            expenses={
                "strata": 0.00,
                "council_rates": 2200.00,
                "water_rates": 800.00,
                "insurance": 1500.00,
                "maintenance": 3000.00,
                "property_management": 0.00,
                "land_tax": 0.00,
                "other": 500.00
            },
            growth_assumptions={
                "capital_growth_rate": 5.5,
                "rental_growth_rate": 0.0
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(prop1)
        session.commit()
        session.refresh(prop1)
        print(f"   [OK] Property: {prop1.address}, {prop1.suburb} - ${prop1.current_value:,.2f}")

        # ========================================
        # PORTFOLIO 2: Investment
        # ========================================
        print("\n[PORTFOLIO] Creating Portfolio 2: Investment")
        portfolio2 = Portfolio(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Investment",
            type="actual",
            settings={},
            goal_settings={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(portfolio2)
        session.commit()
        session.refresh(portfolio2)
        print(f"   [OK] Portfolio: {portfolio2.name} (ID: {portfolio2.id})")

        # Property 2: Investment property - Liverpool apartment
        print("\n[PROPERTY] Property 2: Investment Apartment in Liverpool")
        prop2 = Property(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio2.id,
            address="Unit 12, 88 Moore Street",
            suburb="Liverpool",
            state="NSW",
            postcode="2170",
            property_type="apartment",
            bedrooms=2,
            bathrooms=1,
            car_spaces=1,
            land_size=Decimal("0.00"),
            building_size=Decimal("75.00"),
            year_built=2020,
            purchase_price=Decimal("520000.0000"),
            purchase_date=date(2023, 8, 10),
            stamp_duty=Decimal("18000.0000"),
            purchase_costs=Decimal("6000.0000"),
            current_value=Decimal("560000.0000"),
            last_valuation_date=date(2024, 12, 1),
            loan_details={
                "amount": 416000.00,
                "interest_rate": 6.45,
                "loan_type": "interest_only",
                "loan_term": 30,
                "lender": "Westpac",
                "offset_balance": 0.00
            },
            rental_details={
                "income": 520.00,
                "frequency": "weekly",
                "vacancy_rate": 2.0,
                "is_rented": True
            },
            expenses={
                "strata": 3800.00,
                "council_rates": 1300.00,
                "water_rates": 700.00,
                "insurance": 600.00,
                "maintenance": 1500.00,
                "property_management": 2704.00,
                "land_tax": 0.00,
                "other": 200.00
            },
            growth_assumptions={
                "capital_growth_rate": 6.0,
                "rental_growth_rate": 3.5
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(prop2)
        session.commit()
        session.refresh(prop2)
        print(f"   [OK] Property: {prop2.address}, {prop2.suburb} - ${prop2.current_value:,.2f}")

        # Property 3: Investment property - Campbelltown townhouse
        print("\n[PROPERTY] Property 3: Investment Townhouse in Campbelltown")
        prop3 = Property(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio2.id,
            address="7/24 Broughton Street",
            suburb="Campbelltown",
            state="NSW",
            postcode="2560",
            property_type="townhouse",
            bedrooms=3,
            bathrooms=2,
            car_spaces=2,
            land_size=Decimal("180.00"),
            building_size=Decimal("140.00"),
            year_built=2019,
            purchase_price=Decimal("580000.0000"),
            purchase_date=date(2024, 2, 20),
            stamp_duty=Decimal("21000.0000"),
            purchase_costs=Decimal("7000.0000"),
            current_value=Decimal("590000.0000"),
            last_valuation_date=date(2024, 12, 1),
            loan_details={
                "amount": 464000.00,
                "interest_rate": 6.35,
                "loan_type": "interest_only",
                "loan_term": 30,
                "lender": "Commonwealth Bank",
                "offset_balance": 5000.00
            },
            rental_details={
                "income": 580.00,
                "frequency": "weekly",
                "vacancy_rate": 3.0,
                "is_rented": True
            },
            expenses={
                "strata": 2400.00,
                "council_rates": 1500.00,
                "water_rates": 800.00,
                "insurance": 800.00,
                "maintenance": 2000.00,
                "property_management": 3016.00,
                "land_tax": 1500.00,
                "other": 300.00
            },
            growth_assumptions={
                "capital_growth_rate": 5.8,
                "rental_growth_rate": 3.0
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(prop3)
        session.commit()
        session.refresh(prop3)
        print(f"   [OK] Property: {prop3.address}, {prop3.suburb} - ${prop3.current_value:,.2f}")

        # ========================================
        # INCOME SOURCES
        # ========================================
        print("\n[INCOME] Creating income sources...")

        # Salary
        income1 = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="Full-time Salary",
            type="salary",
            owner="you",
            amount=Decimal("95000.0000"),
            frequency="annual",
            growth_rate=Decimal("3.5"),
            start_date=None,
            end_date=None,
            is_taxable=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income1)

        # Rental income - Liverpool
        income2 = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio2.id,
            name="Rental Income - Liverpool",
            type="rental",
            owner="you",
            amount=Decimal("27040.0000"),
            frequency="annual",
            growth_rate=Decimal("3.5"),
            start_date=date(2023, 9, 1),
            end_date=None,
            is_taxable=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income2)

        # Rental income - Campbelltown
        income3 = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio2.id,
            name="Rental Income - Campbelltown",
            type="rental",
            owner="you",
            amount=Decimal("30160.0000"),
            frequency="annual",
            growth_rate=Decimal("3.0"),
            start_date=date(2024, 3, 15),
            end_date=None,
            is_taxable=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income3)

        # Dividends
        income4 = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="Share Dividends",
            type="dividend",
            owner="you",
            amount=Decimal("2500.0000"),
            frequency="annual",
            growth_rate=Decimal("4.0"),
            start_date=None,
            end_date=None,
            is_taxable=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income4)

        session.commit()
        print(f"   [OK] Created 4 income sources")

        # ========================================
        # EXPENSES
        # ========================================
        print("\n[EXPENSE] Creating expenses...")

        # Living expenses
        exp1 = Expense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="Living Expenses",
            category="personal",
            amount=Decimal("4500.0000"),
            frequency="monthly",
            inflation_rate=Decimal("2.8"),
            retirement_percentage=Decimal("80.00"),
            is_tax_deductible=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(exp1)

        # Transport
        exp2 = Expense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="Transport & Vehicle",
            category="transport",
            amount=Decimal("800.0000"),
            frequency="monthly",
            inflation_rate=Decimal("3.0"),
            retirement_percentage=Decimal("60.00"),
            is_tax_deductible=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(exp2)

        session.commit()
        print(f"   [OK] Created 2 expenses")

        # ========================================
        # ASSETS
        # ========================================
        print("\n[ASSET] Creating assets...")

        # Shares
        asset1 = Asset(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="ASX 200 ETF",
            type="etf",
            owner="you",
            institution="CommSec",
            current_value=Decimal("50000.0000"),
            purchase_value=Decimal("42000.0000"),
            purchase_date=date(2020, 6, 1),
            contributions={
                "amount": 500.00,
                "frequency": "monthly",
                "employer_contribution": 0.00,
                "growth_rate": 3.0
            },
            expected_return=Decimal("8.5"),
            volatility=Decimal("15.0"),
            ticker="IOZ",
            units=Decimal("2500.0000"),
            tax_environment="taxable",
            cost_base=Decimal("42000.0000"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(asset1)

        # Superannuation
        asset2 = Asset(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="Superannuation - Balanced",
            type="super",
            owner="you",
            institution="AustralianSuper",
            current_value=Decimal("120000.0000"),
            purchase_value=Decimal("80000.0000"),
            purchase_date=date(2015, 1, 1),
            contributions={
                "amount": 750.00,
                "frequency": "monthly",
                "employer_contribution": 9025.00,
                "growth_rate": 3.0
            },
            expected_return=Decimal("7.0"),
            volatility=Decimal("12.0"),
            tax_environment="tax_deferred",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(asset2)

        session.commit()
        print(f"   [OK] Created 2 assets")

        # ========================================
        # LIABILITIES
        # ========================================
        print("\n[LIABILITY] Creating liabilities...")

        # Car loan
        liab1 = Liability(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio1.id,
            name="Car Loan - Toyota",
            type="car_loan",
            owner="you",
            lender="Toyota Finance",
            original_amount=Decimal("25000.0000"),
            current_balance=Decimal("15000.0000"),
            interest_rate=Decimal("6.90"),
            is_tax_deductible=False,
            minimum_payment=Decimal("550.0000"),
            payment_frequency="monthly",
            extra_payment=Decimal("100.0000"),
            payoff_strategy="aggressive",
            target_payoff_date=date(2026, 6, 30),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(liab1)

        session.commit()
        print(f"   [OK] Created 1 liability")

        # ========================================
        # SUMMARY
        # ========================================
        print("\n" + "="*60)
        print("[SUCCESS] PREMIUM USER DATA SEEDED SUCCESSFULLY")
        print("="*60)
        print(f"Email: User: {user.email}")
        print(f"[PORTFOLIO] Portfolios: 2 (Personal, Investment)")
        print(f"[PROPERTY] Properties: 3 ($2,200,000 total value)")
        print(f"[INCOME] Income Sources: 4 ($154,700/year)")
        print(f"[EXPENSE] Expenses: 2 ($63,600/year)")
        print(f"[ASSET] Assets: 2 ($170,000)")
        print(f"[LIABILITY] Liabilities: 1 ($15,000)")
        print("="*60)

if __name__ == "__main__":
    seed_premium_user_data()
