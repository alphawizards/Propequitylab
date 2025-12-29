
import pytest

def test_get_dashboard_summary(test_client, db):
    # Setup
    db.portfolios.data = [{"id": "p1", "user_id": "dev-user-01"}]
    db.properties.data = [{"portfolio_id": "p1", "current_value": 500000, "loan_details": {"amount": 400000}}]
    db.assets.data = [{"portfolio_id": "p1", "type": "shares", "current_value": 10000, "is_active": True}]
    db.liabilities.data = [{"portfolio_id": "p1", "type": "credit_card", "current_balance": 5000, "is_active": True}]
    db.income_sources.data = [{"portfolio_id": "p1", "amount": 5000, "frequency": "monthly", "is_active": True}]
    db.expenses.data = [{"portfolio_id": "p1", "amount": 2000, "frequency": "monthly", "is_active": True}]

    # Test with explicit portfolio_id
    response = test_client.get("/api/dashboard/summary?portfolio_id=p1")
    assert response.status_code == 200
    data = response.json()

    assert data["net_worth"] == 105000 # 500k + 10k - 400k - 5k
    assert data["monthly_cashflow"] == 3000

    # Test without portfolio_id (should find first)
    response_default = test_client.get("/api/dashboard/summary")
    assert response_default.status_code == 200
    assert response_default.json()["net_worth"] == 105000

def test_dashboard_history_and_snapshot(test_client, db):
    # Setup
    db.portfolios.data = [{"id": "p1", "user_id": "dev-user-01"}]

    # Create snapshot
    response = test_client.post("/api/dashboard/snapshot?portfolio_id=p1")
    assert response.status_code == 200
    assert "snapshot" in response.json()

    # Get history
    response_hist = test_client.get("/api/dashboard/net-worth-history?portfolio_id=p1")
    assert response_hist.status_code == 200
    assert len(response_hist.json()) == 1
