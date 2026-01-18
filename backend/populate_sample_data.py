"""
Populate sample data for test users
"""
from sqlmodel import Session
from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.income import Income
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from utils.database_sql import engine
import uuid
from datetime import datetime, date

# User IDs
FREE_USER_ID = "0380d07e-950e-4a7e-9180-f6e7ff107fe4"
PREMIUM_USER_ID = "1542bb50-a6cb-4041-8e8f-4d2ff0c44399"
PRO_USER_ID = "3cae4493-c535-4ae2-ac4f-bcc3230d5207"

print("Populating sample data for test users...")
print("=" * 60)

with Session(engine) as session:

    # ========================================================================
    # FREE USER - Basic Data
    # ========================================================================
    print("\n[FREE USER] Creating sample data...")

    # 1 Portfolio
    free_portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=FREE_USER_ID,
        name="My First Portfolio",
        type="personal",
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(free_portfolio)

    # 1 Property
    free_property = Property(
        id=str(uuid.uuid4()),
        portfolio_id=free_portfolio.id,
        user_id=FREE_USER_ID,
        address="123 Test St",
        suburb="Sydney",
        state="NSW",
        postcode="2000",
        property_type="Residential",
        purchase_price=750000.00,
        current_value=750000.00,
        purchase_date=date(2024, 1, 15),
        created_at=datetime.utcnow()
    )
    session.add(free_property)

    # 1 Income - Salary
    free_income = Income(
        id=str(uuid.uuid4()),
        user_id=FREE_USER_ID,
        source="Salary",
        amount=85000.00,
        frequency="annually",
        category="employment",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(free_income)

    # 2 Expenses
    free_expense_rent = Expense(
        id=str(uuid.uuid4()),
        user_id=FREE_USER_ID,
        category="Housing",
        description="Rent",
        amount=2000.00,
        frequency="monthly",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(free_expense_rent)

    free_expense_utilities = Expense(
        id=str(uuid.uuid4()),
        user_id=FREE_USER_ID,
        category="Utilities",
        description="Utilities",
        amount=200.00,
        frequency="monthly",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(free_expense_utilities)

    print("  [SUCCESS] Free user data created")
    print(f"    Portfolio: {free_portfolio.name}")
    print(f"    Property: {free_property.address}")
    print(f"    Income sources: 1")
    print(f"    Expenses: 2")

    # ========================================================================
    # PREMIUM USER - Intermediate Data
    # ========================================================================
    print("\n[PREMIUM USER] Creating sample data...")

    # 2 Portfolios
    premium_portfolio_1 = Portfolio(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        name="Personal",
        type="personal",
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_portfolio_1)

    premium_portfolio_2 = Portfolio(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        name="Investment",
        type="investment",
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_portfolio_2)

    # 3 Properties
    premium_property_1 = Property(
        id=str(uuid.uuid4()),
        portfolio_id=premium_portfolio_1.id,
        user_id=PREMIUM_USER_ID,
        address="45 Main Avenue",
        suburb="Melbourne",
        state="VIC",
        postcode="3000",
        property_type="Residential",
        purchase_price=950000.00,
        current_value=1050000.00,
        purchase_date=date(2022, 6, 10),
        created_at=datetime.utcnow()
    )
    session.add(premium_property_1)

    premium_property_2 = Property(
        id=str(uuid.uuid4()),
        portfolio_id=premium_portfolio_2.id,
        user_id=PREMIUM_USER_ID,
        address="78 Investment Drive",
        suburb="Brisbane",
        state="QLD",
        postcode="4000",
        property_type="Residential",
        purchase_price=650000.00,
        current_value=720000.00,
        purchase_date=date(2023, 3, 20),
        created_at=datetime.utcnow()
    )
    session.add(premium_property_2)

    premium_property_3 = Property(
        id=str(uuid.uuid4()),
        portfolio_id=premium_portfolio_2.id,
        user_id=PREMIUM_USER_ID,
        address="Unit 5/92 Beach Road",
        suburb="Gold Coast",
        state="QLD",
        postcode="4217",
        property_type="Residential",
        purchase_price=550000.00,
        current_value=580000.00,
        purchase_date=date(2024, 1, 5),
        created_at=datetime.utcnow()
    )
    session.add(premium_property_3)

    # Multiple income sources
    premium_income_1 = Income(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        source="Primary Job",
        amount=120000.00,
        frequency="annually",
        category="employment",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_income_1)

    premium_income_2 = Income(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        source="Rental Income - Investment Drive",
        amount=550.00,
        frequency="weekly",
        category="rental",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_income_2)

    premium_income_3 = Income(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        source="Rental Income - Beach Road",
        amount=450.00,
        frequency="weekly",
        category="rental",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_income_3)

    # Assets
    premium_asset_1 = Asset(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        name="Share Portfolio",
        category="Shares/Stocks",
        value=50000.00,
        description="ETF and blue-chip shares",
        created_at=datetime.utcnow()
    )
    session.add(premium_asset_1)

    premium_asset_2 = Asset(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        name="Superannuation",
        category="Retirement",
        value=120000.00,
        description="Superannuation balance",
        created_at=datetime.utcnow()
    )
    session.add(premium_asset_2)

    # Liabilities
    premium_liability_1 = Liability(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        name="Car Loan",
        category="Auto Loan",
        balance=15000.00,
        interest_rate=6.5,
        minimum_payment=450.00,
        payment_frequency="monthly",
        description="Tesla Model 3",
        created_at=datetime.utcnow()
    )
    session.add(premium_liability_1)

    # Expenses
    premium_expense_1 = Expense(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        category="Housing",
        description="Mortgage - Main Avenue",
        amount=4200.00,
        frequency="monthly",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_expense_1)

    premium_expense_2 = Expense(
        id=str(uuid.uuid4()),
        user_id=PREMIUM_USER_ID,
        category="Property",
        description="Council Rates - Investment Drive",
        amount=2500.00,
        frequency="annually",
        is_recurring=True,
        created_at=datetime.utcnow()
    )
    session.add(premium_expense_2)

    print("  [SUCCESS] Premium user data created")
    print(f"    Portfolios: 2")
    print(f"    Properties: 3")
    print(f"    Income sources: 3")
    print(f"    Assets: 2")
    print(f"    Liabilities: 1")
    print(f"    Expenses: 2")

    # ========================================================================
    # PRO USER - Complete Data
    # ========================================================================
    print("\n[PRO USER] Creating sample data...")

    # 3 Portfolios
    pro_portfolio_1 = Portfolio(
        id=str(uuid.uuid4()),
        user_id=PRO_USER_ID,
        name="Personal",
        type="personal",
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(pro_portfolio_1)

    pro_portfolio_2 = Portfolio(
        id=str(uuid.uuid4()),
        user_id=PRO_USER_ID,
        name="Investment",
        type="investment",
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(pro_portfolio_2)

    pro_portfolio_3 = Portfolio(
        id=str(uuid.uuid4()),
        user_id=PRO_USER_ID,
        name="SMSF",
        type="retirement",
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(pro_portfolio_3)

    # 5+ Properties
    properties_data = [
        {"portfolio": pro_portfolio_1, "address": "10 Luxury Lane", "suburb": "Sydney", "state": "NSW", "postcode": "2000", "purchase": 1500000, "current": 1650000, "date": date(2020, 1, 15)},
        {"portfolio": pro_portfolio_2, "address": "22 Investment St", "suburb": "Melbourne", "state": "VIC", "postcode": "3000", "purchase": 850000, "current": 950000, "date": date(2021, 5, 20)},
        {"portfolio": pro_portfolio_2, "address": "33 Rental Road", "suburb": "Brisbane", "state": "QLD", "postcode": "4000", "purchase": 720000, "current": 800000, "date": date(2022, 3, 10)},
        {"portfolio": pro_portfolio_2, "address": "44 Coastal Court", "suburb": "Perth", "state": "WA", "postcode": "6000", "purchase": 680000, "current": 750000, "date": date(2022, 9, 5)},
        {"portfolio": pro_portfolio_3, "address": "55 SMSF Avenue", "suburb": "Adelaide", "state": "SA", "postcode": "5000", "purchase": 550000, "current": 620000, "date": date(2023, 6, 1)},
    ]

    for prop_data in properties_data:
        prop = Property(
            id=str(uuid.uuid4()),
            portfolio_id=prop_data["portfolio"].id,
            user_id=PRO_USER_ID,
            address=prop_data["address"],
            suburb=prop_data["suburb"],
            state=prop_data["state"],
            postcode=prop_data["postcode"],
            property_type="Residential",
            purchase_price=prop_data["purchase"],
            current_value=prop_data["current"],
            purchase_date=prop_data["date"],
            created_at=datetime.utcnow()
        )
        session.add(prop)

    # Multiple income sources
    income_sources = [
        {"source": "Salary - Senior Position", "amount": 180000, "frequency": "annually", "category": "employment"},
        {"source": "Consulting Income", "amount": 5000, "frequency": "monthly", "category": "business"},
        {"source": "Rental - Investment St", "amount": 700, "frequency": "weekly", "category": "rental"},
        {"source": "Rental - Rental Road", "amount": 650, "frequency": "weekly", "category": "rental"},
        {"source": "Rental - Coastal Court", "amount": 600, "frequency": "weekly", "category": "rental"},
        {"source": "Rental - SMSF Avenue", "amount": 500, "frequency": "weekly", "category": "rental"},
    ]

    for income_data in income_sources:
        income = Income(
            id=str(uuid.uuid4()),
            user_id=PRO_USER_ID,
            source=income_data["source"],
            amount=income_data["amount"],
            frequency=income_data["frequency"],
            category=income_data["category"],
            is_recurring=True,
            created_at=datetime.utcnow()
        )
        session.add(income)

    # Assets
    assets_data = [
        {"name": "Share Portfolio", "category": "Shares/Stocks", "value": 250000, "description": "Diversified portfolio"},
        {"name": "SMSF Balance", "category": "Retirement", "value": 850000, "description": "Self-managed super fund"},
        {"name": "Business Assets", "category": "Business", "value": 150000, "description": "Consulting business assets"},
        {"name": "Savings", "category": "Cash/Savings", "value": 75000, "description": "Emergency fund + savings"},
    ]

    for asset_data in assets_data:
        asset = Asset(
            id=str(uuid.uuid4()),
            user_id=PRO_USER_ID,
            name=asset_data["name"],
            category=asset_data["category"],
            value=asset_data["value"],
            description=asset_data["description"],
            created_at=datetime.utcnow()
        )
        session.add(asset)

    # Liabilities
    liabilities_data = [
        {"name": "Personal Loan", "category": "Personal Loan", "balance": 25000, "rate": 7.5, "payment": 800, "freq": "monthly"},
        {"name": "Investment Line of Credit", "category": "Line of Credit", "balance": 100000, "rate": 5.5, "payment": 0, "freq": "monthly"},
    ]

    for liab_data in liabilities_data:
        liability = Liability(
            id=str(uuid.uuid4()),
            user_id=PRO_USER_ID,
            name=liab_data["name"],
            category=liab_data["category"],
            balance=liab_data["balance"],
            interest_rate=liab_data["rate"],
            minimum_payment=liab_data["payment"],
            payment_frequency=liab_data["freq"],
            created_at=datetime.utcnow()
        )
        session.add(liability)

    # Expenses
    expenses_data = [
        {"category": "Housing", "description": "Mortgage - Luxury Lane", "amount": 6500, "frequency": "monthly"},
        {"category": "Property", "description": "Property Management Fees", "amount": 1200, "frequency": "monthly"},
        {"category": "Insurance", "description": "Landlord Insurance (all properties)", "amount": 5000, "frequency": "annually"},
        {"category": "Utilities", "description": "Utilities", "amount": 400, "frequency": "monthly"},
        {"category": "Transport", "description": "Car expenses", "amount": 500, "frequency": "monthly"},
    ]

    for expense_data in expenses_data:
        expense = Expense(
            id=str(uuid.uuid4()),
            user_id=PRO_USER_ID,
            category=expense_data["category"],
            description=expense_data["description"],
            amount=expense_data["amount"],
            frequency=expense_data["frequency"],
            is_recurring=True,
            created_at=datetime.utcnow()
        )
        session.add(expense)

    print("  [SUCCESS] Pro user data created")
    print(f"    Portfolios: 3")
    print(f"    Properties: 5")
    print(f"    Income sources: 6")
    print(f"    Assets: 4")
    print(f"    Liabilities: 2")
    print(f"    Expenses: 5")

    # Commit all changes
    session.commit()

    print("\n" + "=" * 60)
    print("Sample data population COMPLETE!")
    print("\nSummary:")
    print("  Free User: 1 portfolio, 1 property, 1 income, 2 expenses")
    print("  Premium User: 2 portfolios, 3 properties, 3 income, 2 assets, 1 liability, 2 expenses")
    print("  Pro User: 3 portfolios, 5 properties, 6 income, 4 assets, 2 liabilities, 5 expenses")
