"""
Seed sample data for Pro user - demonstrates 3 portfolios, 5+ properties, comprehensive financials
This showcases the unlimited Pro tier capabilities
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

# Pro user email
PRO_USER_EMAIL = "pro@test.propequitylab.com"

def seed_pro_user_data():
    """Seed comprehensive sample data for Pro user - demonstrating unlimited tier"""

    with Session(engine) as session:
        # Get Pro user
        user = session.exec(select(User).where(User.email == PRO_USER_EMAIL)).first()
        if not user:
            print(f"[ERROR] User not found: {PRO_USER_EMAIL}")
            return

        print(f"[*] Seeding PRO USER data for: {user.email}")
        print("="*70)

        portfolios = []

        # Portfolio 1: Personal
        print("\n[PORTFOLIO 1] Personal")
        p1 = Portfolio(
            id=str(uuid.uuid4()), user_id=user.id, name="Personal",
            type="actual", settings={}, goal_settings={},
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        )
        session.add(p1)
        session.commit()
        session.refresh(p1)
        portfolios.append(p1)
        print(f"   [OK] {p1.name}")

        # Portfolio 2: Investment
        print("\n[PORTFOLIO 2] Investment")
        p2 = Portfolio(
            id=str(uuid.uuid4()), user_id=user.id, name="Investment",
            type="actual", settings={}, goal_settings={},
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        )
        session.add(p2)
        session.commit()
        session.refresh(p2)
        portfolios.append(p2)
        print(f"   [OK] {p2.name}")

        # Portfolio 3: SMSF
        print("\n[PORTFOLIO 3] SMSF (Self-Managed Super Fund)")
        p3 = Portfolio(
            id=str(uuid.uuid4()), user_id=user.id, name="SMSF",
            type="actual", settings={}, goal_settings={},
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        )
        session.add(p3)
        session.commit()
        session.refresh(p3)
        portfolios.append(p3)
        print(f"   [OK] {p3.name}")

        # Properties (5 total across 3 portfolios)
        print("\n" + "="*70)
        print("PROPERTIES")
        print("="*70)

        properties = [
            # Portfolio 1 - Personal (PPOR)
            {
                "portfolio": p1, "address": "15 Ocean Avenue", "suburb": "Manly", "state": "NSW", "postcode": "2095",
                "type": "house", "beds": 5, "baths": 3, "cars": 2, "land": 850, "building": 380, "year": 2021,
                "purchase_price": 2800000, "purchase_date": date(2021, 5, 10), "stamp_duty": 150000, "costs": 25000,
                "current_value": 3200000, "loan_amt": 2100000, "loan_rate": 5.99, "loan_type": "principal_interest",
                "lender": "NAB", "offset": 80000, "rental_income": 0, "capital_growth": 6.5
            },
            # Portfolio 2 - Investment properties
            {
                "portfolio": p2, "address": "Unit 805, 120 Mary Street", "suburb": "Brisbane City", "state": "QLD", "postcode": "4000",
                "type": "apartment", "beds": 2, "baths": 2, "cars": 1, "land": 0, "building": 95, "year": 2022,
                "purchase_price": 720000, "purchase_date": date(2023, 1, 20), "stamp_duty": 25000, "costs": 8500,
                "current_value": 780000, "loan_amt": 576000, "loan_rate": 6.50, "loan_type": "interest_only",
                "lender": "Westpac", "offset": 0, "rental_income": 680, "capital_growth": 7.0
            },
            {
                "portfolio": p2, "address": "42 Sunshine Crescent", "suburb": "Gold Coast", "state": "QLD", "postcode": "4217",
                "type": "townhouse", "beds": 3, "baths": 2, "cars": 2, "land": 220, "building": 160, "year": 2020,
                "purchase_price": 650000, "purchase_date": date(2023, 6, 15), "stamp_duty": 22000, "costs": 7000,
                "current_value": 690000, "loan_amt": 520000, "loan_rate": 6.40, "loan_type": "interest_only",
                "lender": "ANZ", "offset": 10000, "rental_income": 620, "capital_growth": 6.2
            },
            {
                "portfolio": p2, "address": "8 Garden Street", "suburb": "Newcastle", "state": "NSW", "postcode": "2300",
                "type": "house", "beds": 4, "baths": 2, "cars": 2, "land": 550, "building": 200, "year": 2018,
                "purchase_price": 850000, "purchase_date": date(2024, 3, 1), "stamp_duty": 32000, "costs": 9000,
                "current_value": 880000, "loan_amt": 680000, "loan_rate": 6.35, "loan_type": "interest_only",
                "lender": "CBA", "offset": 15000, "rental_income": 750, "capital_growth": 5.8
            },
            # Portfolio 3 - SMSF property
            {
                "portfolio": p3, "address": "Shop 3, 88 Commercial Road", "suburb": "Melbourne", "state": "VIC", "postcode": "3000",
                "type": "unit", "beds": 0, "baths": 1, "cars": 0, "land": 0, "building": 80, "year": 2015,
                "purchase_price": 550000, "purchase_date": date(2022, 9, 10), "stamp_duty": 28000, "costs": 6500,
                "current_value": 620000, "loan_amt": 330000, "loan_rate": 5.85, "loan_type": "principal_interest",
                "lender": "NAB SMSF Lending", "offset": 0, "rental_income": 1200, "capital_growth": 4.5
            }
        ]

        for i, prop_data in enumerate(properties, 1):
            prop = Property(
                id=str(uuid.uuid4()),
                user_id=user.id,
                portfolio_id=prop_data["portfolio"].id,
                address=prop_data["address"],
                suburb=prop_data["suburb"],
                state=prop_data["state"],
                postcode=prop_data["postcode"],
                property_type=prop_data["type"],
                bedrooms=prop_data["beds"],
                bathrooms=prop_data["baths"],
                car_spaces=prop_data["cars"],
                land_size=Decimal(str(prop_data["land"])),
                building_size=Decimal(str(prop_data["building"])),
                year_built=prop_data["year"],
                purchase_price=Decimal(str(prop_data["purchase_price"])),
                purchase_date=prop_data["purchase_date"],
                stamp_duty=Decimal(str(prop_data["stamp_duty"])),
                purchase_costs=Decimal(str(prop_data["costs"])),
                current_value=Decimal(str(prop_data["current_value"])),
                last_valuation_date=date(2024, 12, 1),
                loan_details={
                    "amount": prop_data["loan_amt"],
                    "interest_rate": prop_data["loan_rate"],
                    "loan_type": prop_data["loan_type"],
                    "loan_term": 30,
                    "lender": prop_data["lender"],
                    "offset_balance": prop_data["offset"]
                } if prop_data["loan_amt"] > 0 else {},
                rental_details={
                    "income": prop_data["rental_income"],
                    "frequency": "weekly",
                    "vacancy_rate": 2.0,
                    "is_rented": True
                } if prop_data["rental_income"] > 0 else {},
                expenses={
                    "strata": 3500 if "apartment" in prop_data["type"] or "unit" in prop_data["type"] else 0,
                    "council_rates": 2000,
                    "water_rates": 900,
                    "insurance": 1800,
                    "maintenance": 3500,
                    "property_management": (prop_data["rental_income"] * 52 * 0.055) if prop_data["rental_income"] > 0 else 0,
                    "land_tax": 2500 if i > 1 else 0,
                    "other": 500
                },
                growth_assumptions={
                    "capital_growth_rate": prop_data["capital_growth"],
                    "rental_growth_rate": 3.0
                },
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(prop)
            session.commit()
            session.refresh(prop)
            print(f"[{i}] {prop.address}, {prop.suburb} - ${prop.current_value:,.0f}")

        # Income sources
        print("\n" + "="*70)
        print("INCOME SOURCES")
        print("="*70)

        incomes = [
            {"portfolio": p1, "name": "Senior Manager Salary", "type": "salary", "amount": 175000, "growth": 4.0},
            {"portfolio": p1, "name": "Partner Salary", "type": "salary", "amount": 95000, "growth": 3.5},
            {"portfolio": p1, "name": "Investment Dividends", "type": "dividend", "amount": 8500, "growth": 5.0},
            {"portfolio": p2, "name": "Rental - Brisbane", "type": "rental", "amount": 35360, "growth": 3.5},
            {"portfolio": p2, "name": "Rental - Gold Coast", "type": "rental", "amount": 32240, "growth": 3.0},
            {"portfolio": p2, "name": "Rental - Newcastle", "type": "rental", "amount": 39000, "growth": 3.2},
            {"portfolio": p3, "name": "Commercial Rent - Melbourne", "type": "rental", "amount": 62400, "growth": 2.5},
        ]

        for inc_data in incomes:
            inc = IncomeSource(
                id=str(uuid.uuid4()),
                user_id=user.id,
                portfolio_id=inc_data["portfolio"].id,
                name=inc_data["name"],
                type=inc_data["type"],
                owner="you",
                amount=Decimal(str(inc_data["amount"])),
                frequency="annual",
                growth_rate=Decimal(str(inc_data["growth"])),
                is_taxable=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(inc)
        session.commit()
        print(f"[OK] Created {len(incomes)} income sources (${sum(i['amount'] for i in incomes):,.0f}/year)")

        # Expenses
        print("\n" + "="*70)
        print("EXPENSES")
        print("="*70)

        expenses = [
            {"portfolio": p1, "name": "Living Expenses", "category": "personal", "amount": 7500, "freq": "monthly", "inflation": 2.8},
            {"portfolio": p1, "name": "Transport", "category": "transport", "amount": 1200, "freq": "monthly", "inflation": 3.0},
            {"portfolio": p1, "name": "Education", "category": "education", "amount": 3000, "freq": "monthly", "inflation": 3.5},
            {"portfolio": p1, "name": "Entertainment", "category": "entertainment", "amount": 800, "freq": "monthly", "inflation": 2.5},
        ]

        for exp_data in expenses:
            exp = Expense(
                id=str(uuid.uuid4()),
                user_id=user.id,
                portfolio_id=exp_data["portfolio"].id,
                name=exp_data["name"],
                category=exp_data["category"],
                amount=Decimal(str(exp_data["amount"])),
                frequency=exp_data["freq"],
                inflation_rate=Decimal(str(exp_data["inflation"])),
                retirement_percentage=Decimal("75.00"),
                is_tax_deductible=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(exp)
        session.commit()
        annual_exp = sum(e["amount"] for e in expenses) * 12
        print(f"[OK] Created {len(expenses)} expenses (${annual_exp:,.0f}/year)")

        # Assets
        print("\n" + "="*70)
        print("ASSETS")
        print("="*70)

        assets = [
            {"portfolio": p1, "name": "ASX 200 ETF", "type": "etf", "value": 180000, "return": 8.5},
            {"portfolio": p1, "name": "International Shares", "type": "etf", "value": 95000, "return": 9.0},
            {"portfolio": p1, "name": "Superannuation - Balanced", "type": "super", "value": 420000, "return": 7.2},
            {"portfolio": p1, "name": "Partner Superannuation", "type": "super", "value": 180000, "return": 7.0},
            {"portfolio": p3, "name": "SMSF - Shares Portfolio", "type": "shares", "value": 350000, "return": 8.0},
            {"portfolio": p3, "name": "SMSF - Cash Reserve", "type": "cash", "value": 75000, "return": 4.5},
        ]

        for asset_data in assets:
            asset = Asset(
                id=str(uuid.uuid4()),
                user_id=user.id,
                portfolio_id=asset_data["portfolio"].id,
                name=asset_data["name"],
                type=asset_data["type"],
                owner="you",
                institution="Various",
                current_value=Decimal(str(asset_data["value"])),
                purchase_value=Decimal(str(asset_data["value"] * 0.75)),
                expected_return=Decimal(str(asset_data["return"])),
                tax_environment="tax_deferred" if "super" in asset_data["type"] else "taxable",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(asset)
        session.commit()
        total_assets = sum(a["value"] for a in assets)
        print(f"[OK] Created {len(assets)} assets (${total_assets:,.0f} total)")

        # Liabilities
        print("\n" + "="*70)
        print("LIABILITIES")
        print("="*70)

        liabs = [
            {"portfolio": p1, "name": "Car Loan - Tesla", "type": "car_loan", "original": 85000, "balance": 52000, "rate": 5.90},
            {"portfolio": p2, "name": "Credit Card", "type": "credit_card", "original": 15000, "balance": 3500, "rate": 19.90},
        ]

        for liab_data in liabs:
            liab = Liability(
                id=str(uuid.uuid4()),
                user_id=user.id,
                portfolio_id=liab_data["portfolio"].id,
                name=liab_data["name"],
                type=liab_data["type"],
                owner="you",
                lender="Various",
                original_amount=Decimal(str(liab_data["original"])),
                current_balance=Decimal(str(liab_data["balance"])),
                interest_rate=Decimal(str(liab_data["rate"])),
                is_tax_deductible=False,
                minimum_payment=Decimal("1200.00"),
                payment_frequency="monthly",
                payoff_strategy="aggressive",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(liab)
        session.commit()
        total_liabs = sum(l["balance"] for l in liabs)
        print(f"[OK] Created {len(liabs)} liabilities (${total_liabs:,.0f} total)")

        # Summary
        print("\n" + "="*70)
        print("[SUCCESS] PRO USER DATA SEEDED SUCCESSFULLY")
        print("="*70)
        print(f"Email: {user.email}")
        print(f"Portfolios: {len(portfolios)} (Personal, Investment, SMSF)")
        print(f"Properties: 5 properties worth $6,170,000")
        print(f"Income: {len(incomes)} sources totaling $447,500/year")
        print(f"Expenses: {len(expenses)} categories totaling ${annual_exp:,.0f}/year")
        print(f"Assets: {len(assets)} totaling ${total_assets:,.0f}")
        print(f"Liabilities: {len(liabs)} totaling ${total_liabs:,.0f}")
        print(f"Net Worth (excl PPOR): ${total_assets - total_liabs + 3370000:,.0f}")
        print("="*70)

if __name__ == "__main__":
    seed_pro_user_data()
