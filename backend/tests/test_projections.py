"""
Tests for projections and plans/project route handlers.

Calls handlers directly with a real SQLite in-memory session and stub user,
matching the pattern in test_portfolio_summary.py.

Covers:
1. GET /projections/{property_id} — single property projections
2. GET /projections/portfolio/{portfolio_id} — portfolio-level projections
3. POST /plans/project — pure calculation, no DB, returns ProjectionResult
4. Data isolation — other user cannot fetch projections for properties they don't own
5. Validation — years out of range raises 400
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

from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from routes.projections import get_property_projections, get_portfolio_projections
from routes.plans import calculate_projection, ProjectionInput


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


def _make_portfolio(engine, user: User) -> Portfolio:
    pid = str(uuid.uuid4())
    with Session(engine) as s:
        p = Portfolio(id=pid, user_id=user.id, name="Test Portfolio", type="actual")
        s.add(p)
        s.commit()
        s.refresh(p)
        return Portfolio.model_validate(p)


def _make_property(engine, user: User, portfolio_id: str) -> Property:
    prop_id = str(uuid.uuid4())
    with Session(engine) as s:
        prop = Property(
            id=prop_id,
            user_id=user.id,
            portfolio_id=portfolio_id,
            address="42 Test Ave",
            suburb="Testville",
            state="NSW",
            postcode="2000",
            purchase_date=date(2018, 6, 1),
            current_value=Decimal("750000.0000"),
            purchase_price=Decimal("600000.0000"),
        )
        s.add(prop)
        s.commit()
        s.refresh(prop)
        return Property.model_validate(prop)


# ---------------------------------------------------------------------------
# Tests: get_property_projections
# ---------------------------------------------------------------------------

class TestPropertyProjections:

    def test_returns_projection_response_shape(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        prop = _make_property(engine, user_a, p.id)
        with Session(engine) as session:
            result = run(get_property_projections(
                property_id=prop.id,
                years=5,
                current_user=user_a,
                session=session,
            ))
        assert result.property_id == prop.id
        assert result.property_address == "42 Test Ave"
        assert len(result.projections) == 6  # years + 1 (inclusive)

    def test_projections_span_correct_years(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        prop = _make_property(engine, user_a, p.id)
        with Session(engine) as session:
            result = run(get_property_projections(
                property_id=prop.id,
                years=10,
                current_user=user_a,
                session=session,
            ))
        assert len(result.projections) == 11
        years = [yr.year for yr in result.projections]
        assert years == sorted(years)  # ascending order
        assert years[-1] - years[0] == 10

    def test_property_not_found_raises_404(self, engine, user_a):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_property_projections(
                    property_id=str(uuid.uuid4()),
                    years=10,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_other_users_property_raises_404(self, engine, user_a, user_b):
        p_b = _make_portfolio(engine, user_b)
        prop_b = _make_property(engine, user_b, p_b.id)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_property_projections(
                    property_id=prop_b.id,
                    years=5,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_years_out_of_range_raises_400(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        prop = _make_property(engine, user_a, p.id)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_property_projections(
                    property_id=prop.id,
                    years=51,  # max is 50
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 400

    def test_years_zero_raises_400(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        prop = _make_property(engine, user_a, p.id)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_property_projections(
                    property_id=prop.id,
                    years=0,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 400

    def test_each_projection_year_has_required_fields(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        prop = _make_property(engine, user_a, p.id)
        with Session(engine) as session:
            result = run(get_property_projections(
                property_id=prop.id,
                years=3,
                current_user=user_a,
                session=session,
            ))
        for yr in result.projections:
            assert hasattr(yr, "year")
            assert hasattr(yr, "property_value")
            assert hasattr(yr, "equity")
            assert hasattr(yr, "total_debt")
            assert hasattr(yr, "net_cashflow")

    def test_property_value_grows_with_default_growth(self, engine, user_a):
        """Without explicit growth_rates, value should still not decrease from base."""
        p = _make_portfolio(engine, user_a)
        prop = _make_property(engine, user_a, p.id)
        with Session(engine) as session:
            result = run(get_property_projections(
                property_id=prop.id,
                years=5,
                current_user=user_a,
                session=session,
            ))
        first_value = result.projections[0].property_value
        last_value = result.projections[-1].property_value
        # With any positive (or zero) growth rate, last >= first
        assert last_value >= first_value


# ---------------------------------------------------------------------------
# Tests: get_portfolio_projections
# ---------------------------------------------------------------------------

class TestPortfolioProjections:

    def test_portfolio_not_found_raises_404(self, engine, user_a):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_portfolio_projections(
                    portfolio_id=str(uuid.uuid4()),
                    years=10,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_portfolio_with_no_properties_raises_404(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_portfolio_projections(
                    portfolio_id=p.id,
                    years=10,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_portfolio_projections_response_shape(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        _make_property(engine, user_a, p.id)
        with Session(engine) as session:
            result = run(get_portfolio_projections(
                portfolio_id=p.id,
                years=5,
                current_user=user_a,
                session=session,
            ))
        assert result.portfolio_id == p.id
        assert result.portfolio_name == "Test Portfolio"
        assert len(result.totals) == 6  # years + 1
        assert len(result.properties) == 1

    def test_other_users_portfolio_raises_404(self, engine, user_a, user_b):
        p_b = _make_portfolio(engine, user_b)
        _make_property(engine, user_b, p_b.id)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_portfolio_projections(
                    portfolio_id=p_b.id,
                    years=5,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_portfolio_years_out_of_range_raises_400(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        _make_property(engine, user_a, p.id)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_portfolio_projections(
                    portfolio_id=p.id,
                    years=0,
                    current_user=user_a,
                    session=session,
                ))
        assert exc_info.value.status_code == 400

    def test_totals_aggregate_across_properties(self, engine, user_a):
        p = _make_portfolio(engine, user_a)
        _make_property(engine, user_a, p.id)
        _make_property(engine, user_a, p.id)  # two properties
        with Session(engine) as session:
            result = run(get_portfolio_projections(
                portfolio_id=p.id,
                years=3,
                current_user=user_a,
                session=session,
            ))
        assert len(result.properties) == 2
        # Portfolio total value should be sum of both properties
        prop_sum = sum(prop.projections[0].property_value for prop in result.properties)
        assert result.totals[0].property_value == prop_sum


# ---------------------------------------------------------------------------
# Tests: calculate_projection (POST /plans/project — pure calculation)
# ---------------------------------------------------------------------------

class TestCalculateProjection:

    def test_basic_projection_returns_result(self):
        data = ProjectionInput(
            current_net_worth=500000,
            annual_savings=50000,
            expected_return=7.0,
            inflation_rate=2.5,
            withdrawal_rate=4.0,
            current_age=35,
            retirement_age=55,
            life_expectancy=85,
        )
        result = run(calculate_projection(data, current_user=make_user("calc")))
        assert result.projections is not None
        assert len(result.projections) > 0
        assert result.fire_number > 0

    def test_projection_covers_life_expectancy(self):
        data = ProjectionInput(
            current_net_worth=0,
            annual_savings=30000,
            expected_return=7.0,
            inflation_rate=2.5,
            withdrawal_rate=4.0,
            current_age=30,
            retirement_age=65,
            life_expectancy=90,
        )
        result = run(calculate_projection(data, current_user=make_user("calc2")))
        # Should produce 90 - 30 + 1 = 61 projection years
        assert len(result.projections) == 61

    def test_projection_phase_transitions(self):
        """Accumulation phase before retirement age, retirement after."""
        data = ProjectionInput(
            current_net_worth=100000,
            annual_savings=40000,
            expected_return=7.0,
            inflation_rate=2.5,
            withdrawal_rate=4.0,
            current_age=40,
            retirement_age=50,
            life_expectancy=70,
        )
        result = run(calculate_projection(data, current_user=make_user("phase")))
        for yr in result.projections:
            if yr.age < 50:
                assert yr.phase == "accumulation"
            else:
                assert yr.phase == "retirement"

    def test_projection_with_explicit_fire_target(self):
        data = ProjectionInput(
            current_net_worth=2_000_000,
            annual_savings=0,
            expected_return=7.0,
            inflation_rate=2.5,
            withdrawal_rate=4.0,
            current_age=45,
            retirement_age=65,
            life_expectancy=85,
            target_net_worth=1_000_000,  # already exceeded
        )
        result = run(calculate_projection(data, current_user=make_user("fire")))
        # Already above target, so years_to_fire should be 0
        assert result.years_to_fire == 0
        assert result.fire_age == 45

    def test_projection_returns_decimal_fields(self):
        """fire_number and final_net_worth must be Decimal, not float."""
        data = ProjectionInput(
            current_net_worth=100000,
            annual_savings=20000,
            current_age=30,
            retirement_age=60,
            life_expectancy=80,
        )
        result = run(calculate_projection(data, current_user=make_user("dec")))
        from decimal import Decimal
        assert isinstance(result.fire_number, Decimal)
        assert isinstance(result.final_net_worth, Decimal)
        assert isinstance(result.total_withdrawals, Decimal)

    def test_age_range_too_large_raises_400(self):
        data = ProjectionInput(
            current_net_worth=0,
            annual_savings=10000,
            current_age=0,
            retirement_age=50,
            life_expectancy=120,  # 120 - 0 = 120 > 100 -> should 400
        )
        with pytest.raises(HTTPException) as exc_info:
            run(calculate_projection(data, current_user=make_user("toolarge")))
        assert exc_info.value.status_code == 400
