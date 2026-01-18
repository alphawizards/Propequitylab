"""
Seed sample data for Free user directly using SQLModel
"""
import os
import sys
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlmodel import Session

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from models.portfolio import Portfolio
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.user import User
from utils.database_sql import engine
from sqlmodel import select

# Free user email
FREE_USER_EMAIL = "free@test.propequitylab.com"

def seed_free_user_data():
    """Seed sample data for Free user"""

    with Session(engine) as session:
        # Get Free user
        user = session.exec(select(User).where(User.email == FREE_USER_EMAIL)).first()
        if not user:
            print(f"[ERROR] User not found: {FREE_USER_EMAIL}")
            return

        print(f"Seeding data for: {user.email} (ID: {user.id})")

        # 1. Create Portfolio: "My First Portfolio"
        print("\n1. Creating portfolio...")
        portfolio = Portfolio(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="My First Portfolio",
            type="actual",
            settings={},
            goal_settings={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(portfolio)
        session.commit()
        session.refresh(portfolio)
        print(f"   [OK] Portfolio: {portfolio.name} (ID: {portfolio.id})")

        # 2. Create Property: 123 Test St, Sydney NSW 2000 ($750,000)
        print("\n2. Creating property...")
        property_obj = Property(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio.id,
            address="123 Test St",
            suburb="Sydney",
            state="NSW",
            postcode="2000",
            country="Australia",
            property_type="House",
            bedrooms=3,
            bathrooms=2,
            car_spaces=1,
            land_size=Decimal("450.00"),
            building_size=Decimal("180.00"),
            purchase_price=Decimal("750000.0000"),
            purchase_date=date(2024, 1, 15),
            current_value=Decimal("750000.0000"),
            status="Owned",
            loan_details={},
            rental_details={},
            expenses={},
            growth_assumptions={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(property_obj)
        session.commit()
        session.refresh(property_obj)
        print(f"   [OK] Property: {property_obj.address}, {property_obj.suburb} (ID: {property_obj.id})")

        # 3. Create Income: Salary $85,000/year
        print("\n3. Creating income...")
        income = IncomeSource(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio.id,
            name="Salary",
            type="salary",
            owner="you",
            amount=Decimal("85000.0000"),
            frequency="Annual",
            start_date=date(2024, 1, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(income)
        session.commit()
        session.refresh(income)
        print(f"   [OK] Income: {income.name} ${income.amount}/{income.frequency}")

        # 4. Create Expense 1: Rent $2,000/month
        print("\n4. Creating expense - Rent...")
        expense1 = Expense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio.id,
            name="Rent",
            amount=Decimal("2000.0000"),
            frequency="Monthly",
            category="Housing",
            start_date=date(2024, 1, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(expense1)
        session.commit()
        print(f"   [OK] Expense: {expense1.name} ${expense1.amount}/{expense1.frequency}")

        # 5. Create Expense 2: Utilities $200/month
        print("\n5. Creating expense - Utilities...")
        expense2 = Expense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            portfolio_id=portfolio.id,
            name="Utilities",
            amount=Decimal("200.0000"),
            frequency="Monthly",
            category="Housing",
            start_date=date(2024, 1, 1),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(expense2)
        session.commit()
        print(f"   [OK] Expense: {expense2.name} ${expense2.amount}/{expense2.frequency}")

        print("\n" + "="*60)
        print("[SUCCESS] Free user sample data created!")
        print("="*60)
        print(f"\nPortfolio: {portfolio.name}")
        print(f"Property:  {property_obj.address}, {property_obj.suburb} ${property_obj.purchase_price}")
        print(f"Income:    {income.name} ${income.amount}/{income.frequency}")
        print(f"Expenses:  {expense1.name} ${expense1.amount}/{expense1.frequency}")
        print(f"           {expense2.name} ${expense2.amount}/{expense2.frequency}")

if __name__ == "__main__":
    seed_free_user_data()
