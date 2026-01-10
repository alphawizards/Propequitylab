#!/usr/bin/env python3
"""
ETL Migration Script: MongoDB → PostgreSQL (Neon)
Migrates all PropEquityLab data from MongoDB to PostgreSQL with DECIMAL precision

Usage:
    python migrate_mongo_to_postgres.py

Environment Variables Required:
    - DATABASE_URL: PostgreSQL connection string (Neon)
    - MONGODB_URI: MongoDB connection string
    - MONGODB_DATABASE: MongoDB database name (default: propequitylab)
"""

import os
import sys
import asyncio
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List
import uuid

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# MongoDB imports
from pymongo import MongoClient

# SQLModel imports
from sqlmodel import Session, create_engine
from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from models.plan import Plan
from models.net_worth import NetWorthSnapshot


# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "propequitylab")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL environment variable not set")
    print("Please set DATABASE_URL to your Neon PostgreSQL connection string")
    sys.exit(1)

# Create PostgreSQL engine
pg_engine = create_engine(DATABASE_URL, echo=False)

# Create MongoDB client
mongo_client = MongoClient(MONGODB_URI)
mongo_db = mongo_client[MONGODB_DATABASE]


def to_decimal(value: Any, default: str = "0.0000") -> Decimal:
    """
    Convert any numeric value to Decimal
    Handles None, int, float, str, and Decimal types
    """
    if value is None:
        return Decimal(default)
    if isinstance(value, Decimal):
        return value
    if isinstance(value, (int, float)):
        return Decimal(str(value))
    if isinstance(value, str):
        try:
            return Decimal(value)
        except:
            return Decimal(default)
    return Decimal(default)


def to_date(value: Any) -> Any:
    """
    Convert string date to date object
    """
    if value is None:
        return None
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace('Z', '+00:00')).date()
        except:
            return None
    if isinstance(value, datetime):
        return value.date()
    return value


def migrate_users() -> int:
    """Migrate users collection"""
    print("\n📦 Migrating users...")
    
    mongo_users = list(mongo_db.users.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_users:
            try:
                user = User(
                    id=doc.get("id", str(uuid.uuid4())),
                    email=doc.get("email", ""),
                    password_hash=doc.get("password_hash", ""),
                    name=doc.get("name", ""),
                    date_of_birth=doc.get("date_of_birth"),
                    planning_type=doc.get("planning_type", "individual"),
                    country=doc.get("country", "Australia"),
                    state=doc.get("state", "NSW"),
                    currency=doc.get("currency", "AUD"),
                    partner_details=doc.get("partner_details"),
                    onboarding_completed=doc.get("onboarding_completed", False),
                    onboarding_step=doc.get("onboarding_step", 0),
                    subscription_tier=doc.get("subscription_tier", "free"),
                    is_verified=doc.get("is_verified", False),
                    verification_token=doc.get("verification_token"),
                    reset_token=doc.get("reset_token"),
                    reset_token_expires=doc.get("reset_token_expires"),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(user)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating user {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} users")
    return count


def migrate_portfolios() -> int:
    """Migrate portfolios collection"""
    print("\n📦 Migrating portfolios...")
    
    mongo_portfolios = list(mongo_db.portfolios.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_portfolios:
            try:
                portfolio = Portfolio(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    name=doc.get("name", ""),
                    type=doc.get("type", "actual"),
                    members=doc.get("members"),
                    settings=doc.get("settings"),
                    goal_settings=doc.get("goal_settings"),
                    total_property_value=to_decimal(doc.get("total_property_value")),
                    total_loan_amount=to_decimal(doc.get("total_loan_amount")),
                    total_equity=to_decimal(doc.get("total_equity")),
                    total_assets=to_decimal(doc.get("total_assets")),
                    total_liabilities=to_decimal(doc.get("total_liabilities")),
                    net_worth=to_decimal(doc.get("net_worth")),
                    annual_income=to_decimal(doc.get("annual_income")),
                    annual_expenses=to_decimal(doc.get("annual_expenses")),
                    annual_cashflow=to_decimal(doc.get("annual_cashflow")),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(portfolio)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating portfolio {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} portfolios")
    return count


def migrate_properties() -> int:
    """Migrate properties collection"""
    print("\n📦 Migrating properties...")
    
    mongo_properties = list(mongo_db.properties.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_properties:
            try:
                property_obj = Property(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    address=doc.get("address", ""),
                    suburb=doc.get("suburb", ""),
                    state=doc.get("state", ""),
                    postcode=doc.get("postcode", ""),
                    property_type=doc.get("property_type", "house"),
                    bedrooms=doc.get("bedrooms", 3),
                    bathrooms=doc.get("bathrooms", 2),
                    car_spaces=doc.get("car_spaces", 1),
                    land_size=to_decimal(doc.get("land_size", 0), "0.00"),
                    building_size=to_decimal(doc.get("building_size", 0), "0.00"),
                    year_built=doc.get("year_built"),
                    purchase_price=to_decimal(doc.get("purchase_price")),
                    purchase_date=to_date(doc.get("purchase_date")),
                    stamp_duty=to_decimal(doc.get("stamp_duty")),
                    purchase_costs=to_decimal(doc.get("purchase_costs")),
                    current_value=to_decimal(doc.get("current_value")),
                    last_valuation_date=to_date(doc.get("last_valuation_date")),
                    loan_details=doc.get("loan_details"),
                    rental_details=doc.get("rental_details"),
                    expenses=doc.get("expenses"),
                    growth_assumptions=doc.get("growth_assumptions"),
                    notes=doc.get("notes", ""),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(property_obj)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating property {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} properties")
    return count


def migrate_income() -> int:
    """Migrate income_sources collection"""
    print("\n📦 Migrating income sources...")
    
    mongo_income = list(mongo_db.income_sources.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_income:
            try:
                income = IncomeSource(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    name=doc.get("name", ""),
                    type=doc.get("type", "salary"),
                    owner=doc.get("owner", "you"),
                    amount=to_decimal(doc.get("amount")),
                    frequency=doc.get("frequency", "annual"),
                    growth_rate=to_decimal(doc.get("growth_rate", 3.0), "3.00"),
                    start_date=to_date(doc.get("start_date")),
                    end_date=to_date(doc.get("end_date")),
                    end_age=doc.get("end_age"),
                    is_taxable=doc.get("is_taxable", True),
                    tax_deductions=to_decimal(doc.get("tax_deductions")),
                    notes=doc.get("notes", ""),
                    is_active=doc.get("is_active", True),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(income)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating income {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} income sources")
    return count


def migrate_expenses() -> int:
    """Migrate expenses collection"""
    print("\n📦 Migrating expenses...")
    
    mongo_expenses = list(mongo_db.expenses.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_expenses:
            try:
                expense = Expense(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    name=doc.get("name", ""),
                    category=doc.get("category", "other"),
                    amount=to_decimal(doc.get("amount")),
                    frequency=doc.get("frequency", "monthly"),
                    inflation_rate=to_decimal(doc.get("inflation_rate", 2.5), "2.50"),
                    start_date=to_date(doc.get("start_date")),
                    end_date=to_date(doc.get("end_date")),
                    retirement_percentage=to_decimal(doc.get("retirement_percentage", 100), "100.00"),
                    is_tax_deductible=doc.get("is_tax_deductible", False),
                    notes=doc.get("notes", ""),
                    is_active=doc.get("is_active", True),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(expense)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating expense {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} expenses")
    return count


def migrate_assets() -> int:
    """Migrate assets collection"""
    print("\n📦 Migrating assets...")
    
    mongo_assets = list(mongo_db.assets.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_assets:
            try:
                asset = Asset(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    name=doc.get("name", ""),
                    type=doc.get("type", "cash"),
                    owner=doc.get("owner", "you"),
                    institution=doc.get("institution", ""),
                    current_value=to_decimal(doc.get("current_value")),
                    purchase_value=to_decimal(doc.get("purchase_value")),
                    purchase_date=to_date(doc.get("purchase_date")),
                    contributions=doc.get("contributions"),
                    expected_return=to_decimal(doc.get("expected_return", 7.0), "7.00"),
                    volatility=to_decimal(doc.get("volatility", 15.0), "15.00"),
                    ticker=doc.get("ticker"),
                    units=to_decimal(doc.get("units")),
                    tax_environment=doc.get("tax_environment", "taxable"),
                    cost_base=to_decimal(doc.get("cost_base")),
                    notes=doc.get("notes", ""),
                    is_active=doc.get("is_active", True),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(asset)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating asset {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} assets")
    return count


def migrate_liabilities() -> int:
    """Migrate liabilities collection"""
    print("\n📦 Migrating liabilities...")
    
    mongo_liabilities = list(mongo_db.liabilities.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_liabilities:
            try:
                liability = Liability(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    name=doc.get("name", ""),
                    type=doc.get("type", "other"),
                    owner=doc.get("owner", "you"),
                    lender=doc.get("lender", ""),
                    original_amount=to_decimal(doc.get("original_amount")),
                    current_balance=to_decimal(doc.get("current_balance")),
                    interest_rate=to_decimal(doc.get("interest_rate", 0), "0.00"),
                    is_tax_deductible=doc.get("is_tax_deductible", False),
                    minimum_payment=to_decimal(doc.get("minimum_payment")),
                    payment_frequency=doc.get("payment_frequency", "monthly"),
                    extra_payment=to_decimal(doc.get("extra_payment")),
                    payoff_strategy=doc.get("payoff_strategy", "minimum"),
                    target_payoff_date=to_date(doc.get("target_payoff_date")),
                    is_indexed=doc.get("is_indexed", False),
                    repayment_threshold=to_decimal(doc.get("repayment_threshold")),
                    notes=doc.get("notes", ""),
                    is_active=doc.get("is_active", True),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(liability)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating liability {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} liabilities")
    return count


def migrate_plans() -> int:
    """Migrate plans collection"""
    print("\n📦 Migrating plans...")
    
    mongo_plans = list(mongo_db.plans.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_plans:
            try:
                plan = Plan(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    name=doc.get("name", ""),
                    description=doc.get("description", ""),
                    type=doc.get("type", "fire"),
                    retirement_age=doc.get("retirement_age", 60),
                    life_expectancy=doc.get("life_expectancy", 95),
                    target_equity=to_decimal(doc.get("target_equity")),
                    target_passive_income=to_decimal(doc.get("target_passive_income")),
                    target_withdrawal_rate=to_decimal(doc.get("target_withdrawal_rate", 4.0), "4.00"),
                    withdrawal_strategy=doc.get("withdrawal_strategy"),
                    social_security=doc.get("social_security"),
                    modifications=doc.get("modifications"),
                    simulation_years=doc.get("simulation_years", 50),
                    inflation_rate=to_decimal(doc.get("inflation_rate", 2.5), "2.50"),
                    use_monte_carlo=doc.get("use_monte_carlo", False),
                    monte_carlo_runs=doc.get("monte_carlo_runs", 1000),
                    success_threshold=to_decimal(doc.get("success_threshold", 95.0), "95.00"),
                    is_active=doc.get("is_active", True),
                    is_baseline=doc.get("is_baseline", False),
                    last_calculated=doc.get("last_calculated"),
                    success_probability=to_decimal(doc.get("success_probability")) if doc.get("success_probability") else None,
                    projected_fire_age=doc.get("projected_fire_age"),
                    projected_fire_year=doc.get("projected_fire_year"),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow())
                )
                session.add(plan)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating plan {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} plans")
    return count


def migrate_net_worth_snapshots() -> int:
    """Migrate net_worth_snapshots collection"""
    print("\n📦 Migrating net worth snapshots...")
    
    mongo_snapshots = list(mongo_db.net_worth_snapshots.find())
    count = 0
    
    with Session(pg_engine) as session:
        for doc in mongo_snapshots:
            try:
                snapshot = NetWorthSnapshot(
                    id=doc.get("id", str(uuid.uuid4())),
                    user_id=doc.get("user_id", ""),
                    portfolio_id=doc.get("portfolio_id", ""),
                    date=to_date(doc.get("date")),
                    total_assets=to_decimal(doc.get("total_assets")),
                    total_liabilities=to_decimal(doc.get("total_liabilities")),
                    net_worth=to_decimal(doc.get("net_worth")),
                    asset_breakdown=doc.get("asset_breakdown"),
                    liability_breakdown=doc.get("liability_breakdown"),
                    monthly_income=to_decimal(doc.get("monthly_income")),
                    monthly_expenses=to_decimal(doc.get("monthly_expenses")),
                    monthly_cashflow=to_decimal(doc.get("monthly_cashflow")),
                    savings_rate=to_decimal(doc.get("savings_rate"), "0.00"),
                    property_equity=to_decimal(doc.get("property_equity")),
                    property_ltv=to_decimal(doc.get("property_ltv"), "0.00"),
                    change_from_previous=to_decimal(doc.get("change_from_previous")),
                    change_percentage=to_decimal(doc.get("change_percentage"), "0.00"),
                    is_manual=doc.get("is_manual", False),
                    notes=doc.get("notes", ""),
                    created_at=doc.get("created_at", datetime.utcnow())
                )
                session.add(snapshot)
                count += 1
            except Exception as e:
                print(f"  ⚠️  Error migrating snapshot {doc.get('id')}: {e}")
        
        session.commit()
    
    print(f"  ✅ Migrated {count} net worth snapshots")
    return count


def create_tables():
    """Create all tables in PostgreSQL"""
    print("\n🔧 Creating database tables...")
    from utils.database_sql import create_db_and_tables
    create_db_and_tables()
    print("  ✅ Tables created")


def verify_migration():
    """Verify migration by counting records"""
    print("\n🔍 Verifying migration...")
    
    with Session(pg_engine) as session:
        user_count = session.query(User).count()
        portfolio_count = session.query(Portfolio).count()
        property_count = session.query(Property).count()
        income_count = session.query(IncomeSource).count()
        expense_count = session.query(Expense).count()
        asset_count = session.query(Asset).count()
        liability_count = session.query(Liability).count()
        plan_count = session.query(Plan).count()
        snapshot_count = session.query(NetWorthSnapshot).count()
        
        print(f"\n📊 PostgreSQL Record Counts:")
        print(f"  Users: {user_count}")
        print(f"  Portfolios: {portfolio_count}")
        print(f"  Properties: {property_count}")
        print(f"  Income Sources: {income_count}")
        print(f"  Expenses: {expense_count}")
        print(f"  Assets: {asset_count}")
        print(f"  Liabilities: {liability_count}")
        print(f"  Plans: {plan_count}")
        print(f"  Net Worth Snapshots: {snapshot_count}")
        print(f"\n  Total Records: {user_count + portfolio_count + property_count + income_count + expense_count + asset_count + liability_count + plan_count + snapshot_count}")


def main():
    """Main migration function"""
    print("=" * 60)
    print("🚀 PropEquityLab ETL Migration: MongoDB → PostgreSQL (Neon)")
    print("=" * 60)
    
    print(f"\n📍 Source: {MONGODB_URI}/{MONGODB_DATABASE}")
    print(f"📍 Target: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'PostgreSQL'}")
    
    try:
        # Step 1: Create tables
        create_tables()
        
        # Step 2: Migrate all collections
        total_records = 0
        total_records += migrate_users()
        total_records += migrate_portfolios()
        total_records += migrate_properties()
        total_records += migrate_income()
        total_records += migrate_expenses()
        total_records += migrate_assets()
        total_records += migrate_liabilities()
        total_records += migrate_plans()
        total_records += migrate_net_worth_snapshots()
        
        # Step 3: Verify migration
        verify_migration()
        
        print("\n" + "=" * 60)
        print(f"✅ Migration completed successfully!")
        print(f"✅ Total records migrated: {total_records}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        mongo_client.close()


if __name__ == "__main__":
    main()
