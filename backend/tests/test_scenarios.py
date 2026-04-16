"""
Tests for scenarios route handlers.

Calls handlers directly with a real SQLite in-memory session and stub user,
matching the pattern in test_portfolio_summary.py.

Covers:
1. POST /scenarios/create/{portfolio_id} — create scenario (deep copy)
2. GET /scenarios/portfolio/{portfolio_id} — list scenarios for a source
3. GET /scenarios/{scenario_id} — get single scenario
4. PUT /scenarios/{scenario_id} — update scenario name/description
5. DELETE /scenarios/{scenario_id} — delete scenario and its children
6. GET /scenarios/{scenario_id}/compare — compare scenario to source
7. Data isolation — other user cannot access scenarios they don't own
"""

import sys
import os
import uuid
import asyncio
from decimal import Decimal
from datetime import date

import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.user import User
from models.portfolio import Portfolio
from models.property import Property
from routes.scenarios import (
    create_scenario,
    list_scenarios,
    get_scenario,
    update_scenario,
    delete_scenario,
    compare_scenario,
)


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
        subscription_tier="pro",  # scenarios require pro
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
def user_pro():
    return make_user("pro")


@pytest.fixture()
def user_b():
    u = make_user("b")
    u.subscription_tier = "pro"
    return u


def _make_actual_portfolio(engine, user: User, name: str = "My Portfolio") -> Portfolio:
    pid = str(uuid.uuid4())
    with Session(engine) as s:
        p = Portfolio(id=pid, user_id=user.id, name=name, type="actual")
        s.add(p)
        s.commit()
        s.refresh(p)
        return Portfolio.model_validate(p)


def _create_scenario_for(engine, user: User, source_id: str, name: str = "Optimistic") -> Portfolio:
    with Session(engine) as session:
        result = run(create_scenario(
            portfolio_id=source_id,
            scenario_name=name,
            scenario_description=None,
            current_user=user,
            session=session,
        ))
    return result


# ---------------------------------------------------------------------------
# Tests: create_scenario
# ---------------------------------------------------------------------------

class TestCreateScenario:

    def test_create_scenario_returns_portfolio_with_type_scenario(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        with Session(engine) as session:
            result = run(create_scenario(
                portfolio_id=source.id,
                scenario_name="Bull Case",
                scenario_description="High growth assumption",
                current_user=user_pro,
                session=session,
            ))
        assert result.type == "scenario"
        assert result.source_portfolio_id == source.id
        assert result.scenario_name == "Bull Case"

    def test_create_scenario_not_found_raises_404(self, engine, user_pro):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(create_scenario(
                    portfolio_id=str(uuid.uuid4()),
                    scenario_name="Ghost",
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_create_scenario_other_users_portfolio_raises_404(self, engine, user_pro, user_b):
        source = _make_actual_portfolio(engine, user_b)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(create_scenario(
                    portfolio_id=source.id,
                    scenario_name="Steal",
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_free_user_cannot_create_scenario(self, engine):
        free_user = make_user("free")
        free_user.subscription_tier = "free"
        source = _make_actual_portfolio(engine, free_user)
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(create_scenario(
                    portfolio_id=source.id,
                    scenario_name="Should fail",
                    current_user=free_user,
                    session=session,
                ))
        assert exc_info.value.status_code == 403


# ---------------------------------------------------------------------------
# Tests: list_scenarios
# ---------------------------------------------------------------------------

class TestListScenarios:

    def test_empty_list_when_no_scenarios(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        with Session(engine) as session:
            result = run(list_scenarios(
                portfolio_id=source.id,
                current_user=user_pro,
                session=session,
            ))
        assert result == []

    def test_returns_created_scenario(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        # Seed a scenario directly
        with Session(engine) as s:
            s.add(Portfolio(
                id=str(uuid.uuid4()),
                user_id=user_pro.id,
                name=f"{source.name} - Bear",
                type="scenario",
                source_portfolio_id=source.id,
                scenario_name="Bear",
            ))
            s.commit()
        with Session(engine) as session:
            result = run(list_scenarios(
                portfolio_id=source.id,
                current_user=user_pro,
                session=session,
            ))
        assert len(result) == 1
        assert result[0].scenario_name == "Bear"

    def test_list_raises_404_for_nonexistent_portfolio(self, engine, user_pro):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(list_scenarios(
                    portfolio_id=str(uuid.uuid4()),
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Tests: get_scenario
# ---------------------------------------------------------------------------

class TestGetScenario:

    def test_get_scenario_returns_correct_record(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        sid = str(uuid.uuid4())
        with Session(engine) as s:
            s.add(Portfolio(
                id=sid, user_id=user_pro.id, name="Test - Bear",
                type="scenario", source_portfolio_id=source.id, scenario_name="Bear",
            ))
            s.commit()
        with Session(engine) as session:
            result = run(get_scenario(
                scenario_id=sid,
                current_user=user_pro,
                session=session,
            ))
        assert result.id == sid
        assert result.type == "scenario"

    def test_get_scenario_not_found_raises_404(self, engine, user_pro):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_scenario(
                    scenario_id=str(uuid.uuid4()),
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404

    def test_get_scenario_other_user_raises_404(self, engine, user_pro, user_b):
        source = _make_actual_portfolio(engine, user_b)
        sid = str(uuid.uuid4())
        with Session(engine) as s:
            s.add(Portfolio(
                id=sid, user_id=user_b.id, name="B's Scenario",
                type="scenario", source_portfolio_id=source.id, scenario_name="Bear",
            ))
            s.commit()
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(get_scenario(
                    scenario_id=sid,
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Tests: update_scenario
# ---------------------------------------------------------------------------

class TestUpdateScenario:

    def test_update_scenario_name(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        sid = str(uuid.uuid4())
        with Session(engine) as s:
            s.add(Portfolio(
                id=sid, user_id=user_pro.id, name="Portfolio - Old",
                type="scenario", source_portfolio_id=source.id, scenario_name="Old",
            ))
            s.commit()
        with Session(engine) as session:
            result = run(update_scenario(
                scenario_id=sid,
                scenario_name="New Name",
                scenario_description="Updated description",
                current_user=user_pro,
                session=session,
            ))
        assert result.scenario_name == "New Name"
        assert result.scenario_description == "Updated description"

    def test_update_nonexistent_scenario_raises_404(self, engine, user_pro):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(update_scenario(
                    scenario_id=str(uuid.uuid4()),
                    scenario_name="Nope",
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Tests: delete_scenario
# ---------------------------------------------------------------------------

class TestDeleteScenario:

    def test_delete_scenario_removes_record(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        sid = str(uuid.uuid4())
        with Session(engine) as s:
            s.add(Portfolio(
                id=sid, user_id=user_pro.id, name="Portfolio - ToDelete",
                type="scenario", source_portfolio_id=source.id, scenario_name="ToDelete",
            ))
            s.commit()
        with Session(engine) as session:
            result = run(delete_scenario(
                scenario_id=sid,
                current_user=user_pro,
                session=session,
            ))
        assert "deleted" in result["message"].lower()
        # Verify gone from DB
        with Session(engine) as s:
            gone = s.exec(select(Portfolio).where(Portfolio.id == sid)).first()
        assert gone is None

    def test_delete_nonexistent_scenario_raises_404(self, engine, user_pro):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(delete_scenario(
                    scenario_id=str(uuid.uuid4()),
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# Tests: compare_scenario
# ---------------------------------------------------------------------------

class TestCompareScenario:

    def test_compare_returns_actual_and_scenario_keys(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        sid = str(uuid.uuid4())
        with Session(engine) as s:
            s.add(Portfolio(
                id=sid, user_id=user_pro.id, name="Portfolio - Compare",
                type="scenario", source_portfolio_id=source.id, scenario_name="Compare",
            ))
            s.commit()
        with Session(engine) as session:
            result = run(compare_scenario(
                scenario_id=sid,
                current_user=user_pro,
                session=session,
            ))
        assert "actual" in result
        assert "scenario" in result
        assert "differences" in result

    def test_compare_differences_are_numeric(self, engine, user_pro):
        source = _make_actual_portfolio(engine, user_pro)
        sid = str(uuid.uuid4())
        with Session(engine) as s:
            s.add(Portfolio(
                id=sid, user_id=user_pro.id, name="Portfolio - Numeric",
                type="scenario", source_portfolio_id=source.id, scenario_name="Numeric",
            ))
            s.commit()
        with Session(engine) as session:
            result = run(compare_scenario(
                scenario_id=sid,
                current_user=user_pro,
                session=session,
            ))
        diffs = result["differences"]
        for key in ("total_value", "total_equity", "net_worth", "annual_cashflow"):
            assert isinstance(diffs[key], (int, float))

    def test_compare_nonexistent_scenario_raises_404(self, engine, user_pro):
        with pytest.raises(HTTPException) as exc_info:
            with Session(engine) as session:
                run(compare_scenario(
                    scenario_id=str(uuid.uuid4()),
                    current_user=user_pro,
                    session=session,
                ))
        assert exc_info.value.status_code == 404
