"""
Tests for dashboard route handlers.

Calls handlers directly with a real SQLite in-memory session and stub user,
matching the pattern in test_portfolio_summary.py.

Covers:
1. GET /api/dashboard/summary — empty portfolio, with data, no portfolio
2. GET /api/dashboard/net-worth-history — empty list, with snapshots
3. POST /api/dashboard/snapshot — creates and persists snapshot
4. Data isolation — another user's portfolio_id is ignored or rejected
"""

import sys
import os
import uuid
import asyncio
from decimal import Decimal
from datetime import date, datetime, timezone

import pytest
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from models.asset import Asset
from models.liability import Liability
from models.income import IncomeSource
from models.expense import Expense
from models.net_worth import NetWorthSnapshot
from routes.dashboard import get_dashboard_summary, get_net_worth_history, create_net_worth_snapshot, SnapshotRequest


SQLITE_URL = "sqlite://"


def make_engine():
    return create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def make_user(tag: str = "") -> User:
    uid = tag or uuid.uuid4().hex[:8]
    return User(
        id=f"user_{uid}",
        email=f"{uid}@example.com",
        first_name="Test",
        last_name="User",
    )


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


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


def _make_portfolio(engine, user: User, name: str = "Test") -> Portfolio:
    pid = str(uuid.uuid4())
    with Session(engine) as s:
        p = Portfolio(id=pid, user_id=user.id, name=name, type="actual")
        s.add(p)
        s.commit()
        s.refresh(p)
    return p


def _seed_portfolio_data(engine, user: User, portfolio_id: str):
    """Add a property, asset, liability, income, and expense to a portfolio."""
    with Session(engine) as s:
        s.add(Property(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=portfolio_id,
            address="1 Test St", suburb="Suburb", state="VIC", postcode="3000",
            purchase_date=date(2020, 1, 1),
            current_value=Decimal("500000.0000"),
            loan_details={"amount": 300000},
        ))
        s.add(Asset(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=portfolio_id,
            name="Savings", type="cash", current_value=Decimal("20000.0000"),
            is_active=True,
        ))
        s.add(Liability(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=portfolio_id,
            name="Credit card", type="credit_card",
            current_balance=Decimal("5000.0000"), is_active=True,
        ))
        s.add(IncomeSource(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=portfolio_id,
            name="Salary", type="salary",
            amount=Decimal("5000.0000"), frequency="monthly", is_active=True,
        ))
        s.add(Expense(
            id=str(uuid.uuid4()), user_id=user.id, portfolio_id=portfolio_id,
            name="Rates", category="rates",
            amount=Decimal("500.0000"), frequency="monthly", is_active=True,
        ))
        s.commit()


# ---------------------------------------------------------------------------
# Tests: get_dashboard_summary
# ---------------------------------------------------------------------------

class TestDashboardSummary:

    def test_no_portfolio_returns_empty_summary(self, engine, user_a):
        """User with no portfolio gets zeroed-out summary, not an error."""
        with Session(engine) as session:
            result = run(get_dashboard_summary(
                portfolio_id=None,
                current_user=user_a,
                session=session,
            ))
        assert result.net_worth == 0
        assert result.properties_count == 0
        assert result.total_assets == 0
        assert result.total_liabilities == 0

    def test_empty_portfolio_returns_zeros(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        with Session(engine) as session:
            result = run(get_dashboard_summary(
                portfolio_id=p.id,
                current_user=user_a,
                session=session,
            ))
        assert result.net_worth == 0
        assert result.properties_count == 0

    def test_summary_with_data(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        _seed_portfolio_data(engine, user_a, p.id)
        with Session(engine) as session:
            result = run(get_dashboard_summary(
                portfolio_id=p.id,
                current_user=user_a,
                session=session,
            ))
        # property (500k) + asset (20k) - credit card (5k) - loan (300k) = 215k
        assert result.properties_count == 1
        assert result.total_assets > 0
        assert result.total_liabilities > 0
        assert result.monthly_income > 0
        assert result.monthly_expenses > 0

    def test_other_users_portfolio_ignored(self, engine, user_a, user_b):
        """Requesting another user's portfolio_id returns empty summary (no 403/404)."""
        p_b = _make_portfolio(engine, user_b)
        _seed_portfolio_data(engine, user_b, p_b.id)
        with Session(engine) as session:
            # user_a requests user_b's portfolio_id — should not see user_b's data
            result = run(get_dashboard_summary(
                portfolio_id=p_b.id,
                current_user=user_a,
                session=session,
            ))
        # The handler returns empty summary when portfolio not found for user
        assert result.properties_count == 0
        assert result.net_worth == 0

    def test_response_has_asset_breakdown(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        with Session(engine) as session:
            result = run(get_dashboard_summary(
                portfolio_id=p.id,
                current_user=user_a,
                session=session,
            ))
        assert hasattr(result, "asset_breakdown")
        assert hasattr(result, "liability_breakdown")


# ---------------------------------------------------------------------------
# Tests: get_net_worth_history
# ---------------------------------------------------------------------------

class TestNetWorthHistory:

    def test_empty_history(self, engine, user_a):
        with Session(engine) as session:
            result = run(get_net_worth_history(
                portfolio_id=None,
                limit=12,
                current_user=user_a,
                session=session,
            ))
        assert result == []

    def test_returns_list(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        # Seed a snapshot manually
        with Session(engine) as s:
            s.add(NetWorthSnapshot(
                id=str(uuid.uuid4()),
                user_id=user_a.id,
                portfolio_id=p.id,
                date=date.today(),
                total_assets=Decimal("100000.0000"),
                total_liabilities=Decimal("50000.0000"),
                net_worth=Decimal("50000.0000"),
                asset_breakdown={},
                liability_breakdown={},
                monthly_income=Decimal("0"),
                monthly_expenses=Decimal("0"),
                monthly_cashflow=Decimal("0"),
                savings_rate=Decimal("0"),
            ))
            s.commit()
        with Session(engine) as session:
            result = run(get_net_worth_history(
                portfolio_id=p.id,
                limit=12,
                current_user=user_a,
                session=session,
            ))
        assert len(result) == 1
        assert result[0].net_worth == Decimal("50000.0000")

    def test_history_isolated_by_user(self, engine, user_a, user_b):
        """User B's snapshots are not returned when querying as user A."""
        p_b = _make_portfolio(engine, user_b)
        with Session(engine) as s:
            s.add(NetWorthSnapshot(
                id=str(uuid.uuid4()),
                user_id=user_b.id,
                portfolio_id=p_b.id,
                date=date.today(),
                total_assets=Decimal("999999.0000"),
                total_liabilities=Decimal("0"),
                net_worth=Decimal("999999.0000"),
                asset_breakdown={},
                liability_breakdown={},
                monthly_income=Decimal("0"),
                monthly_expenses=Decimal("0"),
                monthly_cashflow=Decimal("0"),
                savings_rate=Decimal("0"),
            ))
            s.commit()
        with Session(engine) as session:
            result = run(get_net_worth_history(
                portfolio_id=None,
                limit=12,
                current_user=user_a,
                session=session,
            ))
        assert result == []


# ---------------------------------------------------------------------------
# Tests: create_net_worth_snapshot
# ---------------------------------------------------------------------------

class TestCreateSnapshot:

    def test_snapshot_created_for_own_portfolio(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        req = SnapshotRequest(portfolio_id=p.id)
        with Session(engine) as session:
            result = run(create_net_worth_snapshot(
                request=req,
                current_user=user_a,
                session=session,
            ))
        assert result["message"] == "Snapshot created"
        assert "snapshot" in result

    def test_snapshot_raises_404_for_other_users_portfolio(self, engine, user_a, user_b):
        p_b = _make_portfolio(engine, user_b)
        req = SnapshotRequest(portfolio_id=p_b.id)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(create_net_worth_snapshot(
                    request=req,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_snapshot_raises_404_for_nonexistent_portfolio(self, engine, user_a):
        req = SnapshotRequest(portfolio_id=str(uuid.uuid4()))
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(create_net_worth_snapshot(
                    request=req,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404
