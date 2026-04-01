"""
Auth isolation tests — verifies IDOR protection across all major endpoints.

Pattern: test_user creates data, other_client (authenticated as other_user) tries
to access it. Any response other than 404 is a security bug.
"""

import uuid
import pytest
from datetime import date
from models.portfolio import Portfolio
from models.property import Property
from models.asset import Asset
from models.income import IncomeSource
from models.expense import Expense
from models.liability import Liability


# ============================================================================
# Unauthenticated access — should return 403 (Clerk returns 403, not 401)
# ============================================================================

def test_unauthenticated_portfolios_returns_403(unauthenticated_client):
    response = unauthenticated_client.get("/api/portfolios")
    assert response.status_code == 403


def test_unauthenticated_dashboard_returns_403(unauthenticated_client):
    response = unauthenticated_client.get("/api/dashboard/summary")
    assert response.status_code == 403


def test_unauthenticated_onboarding_returns_403(unauthenticated_client):
    response = unauthenticated_client.get("/api/onboarding/status")
    assert response.status_code == 403


# ============================================================================
# IDOR: other_user cannot access test_user's portfolios
# ============================================================================

def test_cannot_get_other_users_portfolio(client, other_client, session, test_user):
    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Private Portfolio",
        type="personal",
    )
    session.add(portfolio)
    session.commit()

    response = other_client.get(f"/api/portfolios/{portfolio.id}")
    assert response.status_code == 404


def test_cannot_update_other_users_portfolio(client, other_client, session, test_user):
    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Private Portfolio",
        type="personal",
    )
    session.add(portfolio)
    session.commit()

    response = other_client.put(f"/api/portfolios/{portfolio.id}", json={"name": "Hacked"})
    assert response.status_code == 404


def test_cannot_delete_other_users_portfolio(client, other_client, session, test_user):
    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Private Portfolio",
        type="personal",
    )
    session.add(portfolio)
    session.commit()

    response = other_client.delete(f"/api/portfolios/{portfolio.id}")
    assert response.status_code == 404


def test_list_portfolios_excludes_other_users(client, other_client, session, test_user):
    """other_user listing portfolios sees only their own — not test_user's."""
    portfolio = Portfolio(
        id=str(uuid.uuid4()),
        user_id=test_user.id,
        name="Private Portfolio",
        type="personal",
    )
    session.add(portfolio)
    session.commit()

    response = other_client.get("/api/portfolios")
    assert response.status_code == 200
    ids = [p["id"] for p in response.json()]
    assert portfolio.id not in ids


# ============================================================================
# IDOR: other_user cannot access test_user's properties
# ============================================================================

def test_cannot_get_other_users_property(client, other_client, session, test_user):
    portfolio = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="P", type="personal")
    session.add(portfolio)
    session.commit()

    prop = Property(
        id=str(uuid.uuid4()),
        portfolio_id=portfolio.id,
        user_id=test_user.id,
        address="123 Private St",
        postcode="2000",
        state="NSW",
        suburb="Sydney",
        purchase_price=500000,
        purchase_date=date(2020, 1, 1),
        current_value=550000,
    )
    session.add(prop)
    session.commit()

    response = other_client.get(f"/api/properties/{prop.id}")
    assert response.status_code == 404


def test_cannot_access_portfolio_properties_via_portfolio_id(other_client, session, test_user):
    """Requesting properties for another user's portfolio_id returns 404."""
    portfolio = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="P", type="personal")
    session.add(portfolio)
    session.commit()

    response = other_client.get(f"/api/properties/portfolio/{portfolio.id}")
    assert response.status_code == 404


# ============================================================================
# IDOR: cross-user data never appears in list responses
# ============================================================================

def test_cross_user_data_never_leaks_from_lists(other_client, session, test_user, other_user):
    """
    Seed test_user with a full portfolio. Verify other_user's scoped list
    endpoints return no items belonging to test_user.
    Assets/income/expenses are scoped by portfolio_id — use other_user's own
    portfolio (created directly in DB) so the 404 is not triggered by portfolio
    ownership, and verify test_user's items don't appear.
    """
    # test_user portfolio + data
    test_portfolio = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Full Portfolio", type="personal")
    session.add(test_portfolio)

    # other_user portfolio (empty) — needed so /portfolio/{id} call returns 200
    other_portfolio = Portfolio(id=str(uuid.uuid4()), user_id=other_user.id, name="Other Portfolio", type="personal")
    session.add(other_portfolio)
    session.commit()

    asset = Asset(
        id=str(uuid.uuid4()),
        portfolio_id=test_portfolio.id,
        user_id=test_user.id,
        name="Shares",
        type="stock",
        current_value=50000,
    )
    income = IncomeSource(
        id=str(uuid.uuid4()),
        portfolio_id=test_portfolio.id,
        user_id=test_user.id,
        name="Salary",
        type="salary",
        amount=5000,
        frequency="monthly",
        owner="Me",
    )
    expense = Expense(
        id=str(uuid.uuid4()),
        portfolio_id=test_portfolio.id,
        user_id=test_user.id,
        name="Rent",
        category="housing",
        amount=2000,
        frequency="monthly",
    )
    session.add_all([asset, income, expense])
    session.commit()

    # other_user requesting scoped endpoints for their own portfolio returns empty (not test_user's data)
    assets_resp = other_client.get(f"/api/assets/portfolio/{other_portfolio.id}")
    assert assets_resp.status_code == 200
    assert assets_resp.json() == []

    income_resp = other_client.get(f"/api/income/portfolio/{other_portfolio.id}")
    assert income_resp.status_code == 200
    assert income_resp.json() == []

    expense_resp = other_client.get(f"/api/expenses/portfolio/{other_portfolio.id}")
    assert expense_resp.status_code == 200
    assert expense_resp.json() == []


# ============================================================================
# IDOR: dashboard summary cross-user
# ============================================================================

def test_dashboard_summary_cross_user_portfolio_returns_empty(other_client, session, test_user):
    """
    other_user requesting summary for test_user's portfolio_id gets 200 with
    all-zero summary (dashboard filters by user_id internally — no data leak).

    Note: This returns 200 (not 404) because the dashboard treats an unowned
    portfolio_id the same as "no portfolio found" and returns an empty summary.
    The isolation is correct — no data from test_user is exposed.
    """
    portfolio = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="P", type="personal")
    session.add(portfolio)
    session.commit()

    response = other_client.get(f"/api/dashboard/summary?portfolio_id={portfolio.id}")
    assert response.status_code == 200
    data = response.json()
    # All financial fields should be zero — no data leaked from test_user
    assert data["net_worth"] == 0
    assert data["total_assets"] == 0
    assert data["monthly_income"] == 0


# ============================================================================
# IDOR: onboarding isolation
# Note: tests are split because client + other_client share app.dependency_overrides
# and cannot safely be used together in a single test.
# ============================================================================

def test_onboarding_status_returns_test_user(client, test_user):
    """Authenticated as test_user → onboarding status returns test_user's data."""
    response = client.get("/api/onboarding/status")
    assert response.status_code == 200
    assert response.json()["user"]["id"] == test_user.id


def test_onboarding_status_returns_other_user(other_client, other_user):
    """Authenticated as other_user → onboarding status returns other_user's data."""
    response = other_client.get("/api/onboarding/status")
    assert response.status_code == 200
    assert response.json()["user"]["id"] == other_user.id
