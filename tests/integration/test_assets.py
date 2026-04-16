
import pytest
from sqlmodel import select
from models.asset import Asset

def test_asset_crud(client, test_portfolio):
    # Create
    asset_data = {
        "portfolio_id": test_portfolio.id,
        "name": "Tesla Stock",
        "type": "shares",
        "owner": "Me",
        "current_value": 10000,
        "is_active": True
    }
    response = client.post("/api/assets", json=asset_data)
    assert response.status_code == 201, response.json()
    asset_id = response.json()["id"]

    # Get by Portfolio
    response = client.get(f"/api/assets/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/assets/{asset_id}", json={"current_value": 12000})
    assert response.status_code == 200
    assert float(response.json()["current_value"]) == 12000.0

    # Delete
    response = client.delete(f"/api/assets/{asset_id}")
    assert response.status_code == 204

    # Verify gone
    response = client.get(f"/api/assets/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_get_asset_types(client):
    response = client.get("/api/assets/types")
    assert response.status_code == 200
    assert "types" in response.json()
