"""
Regression tests for get_portfolio_summary route handler.

Calls the handler directly with a real SQLite in-memory session and a stub user,
avoiding the FastAPI/Starlette version incompatibility that prevents TestClient use.

Covers:
1. Response shape — all fields in PortfolioSummary present; old fields absent
2. Computed values — total_value, total_debt, total_equity, net_worth, annual_*
3. Data isolation — another user's portfolio_id returns 404
"""

import sys
import os
import uuid
import asyncio
from decimal import Decimal
from datetime import date

import pytest
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.portfolio import Portfolio, PortfolioSummary
from models.property import Property
from models.income import IncomeSource
from models.expense import Expense
from models.asset import Asset
from models.liability import Liability
from models.user import User
from routes.portfolios import get_portfolio_summary


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SQLITE_URL = "sqlite://"


def make_engine():
    return create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def make_user(tag: str = "") -> User:
    return User(
        id=f"user_{tag or uuid.uuid4().hex[:8]}",
        email=f"{tag or 'test'}@example.com",
        first_name="Test",
        last_name="User",
    )


def run(coro):
    """Run an async coroutine synchronously."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def engine():
    eng = make_engine()
    SQLModel.metadata.create_all(eng)
    yield eng
    SQLModel.metadata.drop_all(eng)


@pytest.fixture()
def user_a():
    return make_user("a")


@pytest.fixture()
def user_b():
    return make_user("b")


def _empty_portfolio(engine, user: User) -> str:
    pid = str(uuid.uuid4())
    with Session(engine) as s:
        s.add(Portfolio(id=pid, user_id=user.id, name="Empty", type="actual"))
        s.commit()
    return pid


def _full_portfolio(engine, user: User) -> str:
    """
    Seed a portfolio with known values.

    Property  : current_value=500_000, loan amount=400_000, rental income=2_000
    Income    : 5_000
    Expense   : 1_000
    Asset     : 10_000
    Liability : 3_000

    Expected:
        total_value       = 500_000
        total_debt        = 400_000
        total_equity      = 100_000   (500k − 400k)
        total_assets      = 10_000
        total_liabilities = 3_000
        net_worth         = 500_000 + 10_000 − 3_000 − 400_000 = 107_000
        annual_income     = 2_000 + 5_000 = 7_000
        annual_expenses   = 1_000
        annual_cashflow   = 6_000
        properties_count  = 1
    """
    pid = str(uuid.uuid4())
    with Session(engine) as s:
        s.add(Portfolio(id=pid, user_id=user.id, name="Full", type="actual"))
        s.add(Property(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=pid,
            address="1 St", suburb="Suburb", state="VIC", postcode="3000",
            purchase_date=date(2020, 1, 1),
            current_value=Decimal("500000.0000"),
            loan_details={"amount": 400000},
            rental_details={"income": 2000},
        ))
        s.add(IncomeSource(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=pid,
            name="Salary", type="salary", amount=Decimal("5000.0000"), frequency="monthly",
        ))
        s.add(Expense(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=pid,
            name="Rates", category="rates", amount=Decimal("1000.0000"), frequency="monthly",
        ))
        s.add(Asset(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=pid,
            name="Savings", type="savings", current_value=Decimal("10000.0000"),
        ))
        s.add(Liability(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=pid,
            name="CC", type="credit_card", current_balance=Decimal("3000.0000"),
        ))
        s.commit()
    return pid


def _call_summary(engine, user: User, portfolio_id: str) -> PortfolioSummary:
    with Session(engine) as session:
        return run(get_portfolio_summary(
            portfolio_id=portfolio_id,
            current_user=user,
            session=session,
        ))


# ---------------------------------------------------------------------------
# Tests: response shape
# ---------------------------------------------------------------------------

EXPECTED_FIELDS = {
    "portfolio_id", "properties_count", "total_value", "total_debt",
    "total_equity", "total_assets", "total_liabilities", "net_worth",
    "annual_income", "annual_expenses", "annual_cashflow", "goal_year",
}

FORBIDDEN_FIELDS = {
    "portfolio_name", "total_property_value", "total_property_equity",
    "total_rental_income", "total_income", "total_expenses",
    "monthly_cashflow", "property_count", "asset_count", "liability_count",
}


class TestPortfolioSummaryShape:

    def test_returns_portfolio_summary_instance(self, engine, user_a):
        pid = _empty_portfolio(engine, user_a)
        result = _call_summary(engine, user_a, pid)
        assert isinstance(result, PortfolioSummary)

    def test_all_expected_fields_present(self, engine, user_a):
        pid = _empty_portfolio(engine, user_a)
        result = _call_summary(engine, user_a, pid)
        data = result.model_dump()
        for field in EXPECTED_FIELDS:
            assert field in data, f"Missing field: {field!r}"

    def test_no_forbidden_fields_present(self, engine, user_a):
        pid = _empty_portfolio(engine, user_a)
        result = _call_summary(engine, user_a, pid)
        data = result.model_dump()
        for field in FORBIDDEN_FIELDS:
            assert field not in data, f"Forbidden field still present: {field!r}"

    def test_portfolio_id_matches(self, engine, user_a):
        pid = _empty_portfolio(engine, user_a)
        result = _call_summary(engine, user_a, pid)
        assert result.portfolio_id == pid


# ---------------------------------------------------------------------------
# Tests: computed values
# ---------------------------------------------------------------------------

class TestPortfolioSummaryValues:

    def test_empty_portfolio_zeros(self, engine, user_a):
        pid = _empty_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.properties_count == 0
        assert r.total_value == Decimal("0")
        assert r.total_debt == Decimal("0")
        assert r.total_equity == Decimal("0")
        assert r.net_worth == Decimal("0")
        assert r.annual_income == Decimal("0")
        assert r.annual_expenses == Decimal("0")
        assert r.annual_cashflow == Decimal("0")

    def test_total_value(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.total_value == Decimal("500000")

    def test_total_debt_is_loan_amount_not_equity(self, engine, user_a):
        """total_debt must reflect the actual loan balance, not equity."""
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.total_debt == Decimal("400000")

    def test_total_equity(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.total_equity == Decimal("100000")  # 500k - 400k

    def test_total_assets(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.total_assets == Decimal("10000")

    def test_total_liabilities(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.total_liabilities == Decimal("3000")

    def test_net_worth(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        # 500k + 10k - 3k - 400k = 107k
        assert r.net_worth == Decimal("107000")

    def test_annual_income_combines_rental_and_other(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        # rental: 2000/week × 52 = 104,000; IncomeSource: 5000/month × 12 = 60,000
        assert r.annual_income == Decimal("164000")

    def test_annual_expenses(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        # Expense: 1000/month × 12 = 12,000
        assert r.annual_expenses == Decimal("12000")

    def test_annual_cashflow_equals_income_minus_expenses(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        # 164,000 - 12,000 = 152,000
        assert r.annual_cashflow == Decimal("152000")

    def test_properties_count(self, engine, user_a):
        pid = _full_portfolio(engine, user_a)
        r = _call_summary(engine, user_a, pid)
        assert r.properties_count == 1


# ---------------------------------------------------------------------------
# Tests: data isolation
# ---------------------------------------------------------------------------

class TestPortfolioSummaryIsolation:

    def test_other_user_raises_404(self, engine, user_a, user_b):
        pid = _empty_portfolio(engine, user_a)
        with pytest.raises(HTTPException) as exc_info:
            _call_summary(engine, user_b, pid)
        assert exc_info.value.status_code == 404

    def test_nonexistent_portfolio_raises_404(self, engine, user_a):
        with pytest.raises(HTTPException) as exc_info:
            _call_summary(engine, user_a, str(uuid.uuid4()))
        assert exc_info.value.status_code == 404
