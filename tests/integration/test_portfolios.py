
import pytest

def test_create_portfolio(test_client, db):
    data = {
        "name": "Test Portfolio",
        "type": "personal",
        "settings": {"currency": "USD"},
        "goal_settings": {"retirement_age": 65}
    }
    response = test_client.post("/api/portfolios", json=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["name"] == "Test Portfolio"
    assert "id" in res_data

    # Verify in DB
    assert len(db.portfolios.data) == 1
    assert db.portfolios.data[0]["name"] == "Test Portfolio"

def test_get_portfolios(test_client, db):
    # Setup
    db.portfolios.data = [
        {"id": "p1", "user_id": "dev-user-01", "name": "Portfolio 1", "type": "personal"},
        {"id": "p2", "user_id": "dev-user-01", "name": "Portfolio 2", "type": "company"}
    ]

    response = test_client.get("/api/portfolios")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["name"] == "Portfolio 1"

def test_get_portfolio_detail(test_client, db):
    # Setup
    db.portfolios.data = [
        {"id": "p1", "user_id": "dev-user-01", "name": "Portfolio 1", "type": "personal", "created_at": "2023-01-01T00:00:00", "updated_at": "2023-01-01T00:00:00"}
    ]

    response = test_client.get("/api/portfolios/p1")
    assert response.status_code == 200
    assert response.json()["id"] == "p1"

    response_404 = test_client.get("/api/portfolios/p999")
    assert response_404.status_code == 404

def test_update_portfolio(test_client, db):
    # Setup
    db.portfolios.data = [
        {"id": "p1", "user_id": "dev-user-01", "name": "Portfolio 1", "type": "personal", "settings": {}, "goal_settings": {}, "created_at": "2023-01-01T00:00:00", "updated_at": "2023-01-01T00:00:00"}
    ]

    update_data = {"name": "Updated Name"}
    response = test_client.put("/api/portfolios/p1", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

    # Verify in DB
    assert db.portfolios.data[0]["name"] == "Updated Name"

def test_delete_portfolio(test_client, db):
    # Setup
    db.portfolios.data = [{"id": "p1", "user_id": "dev-user-01"}]
    db.properties.data = [{"id": "prop1", "portfolio_id": "p1"}]

    response = test_client.delete("/api/portfolios/p1")
    assert response.status_code == 200

    # Verify DB
    assert len(db.portfolios.data) == 0
    # Cascade delete verification (mock logic depends on delete_many implementation)
    # Our mock implementation of delete_many removes items, so:
    assert len(db.properties.data) == 0

def test_get_portfolio_summary(test_client, db):
    # Setup
    db.portfolios.data = [{"id": "p1", "user_id": "dev-user-01"}]
    db.properties.data = [{"portfolio_id": "p1", "current_value": 500000, "loan_details": {"amount": 400000}}]
    db.assets.data = [{"portfolio_id": "p1", "is_active": True, "current_value": 10000}]

    response = test_client.get("/api/portfolios/p1/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_value"] == 500000
    assert data["total_assets"] == 510000
