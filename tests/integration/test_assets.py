
import pytest

def test_asset_crud(test_client, db):
    # Create
    asset_data = {
        "portfolio_id": "p1",
        "name": "Tesla Stock",
        "type": "shares",
        "owner": "Me",
        "current_value": 10000,
        "is_active": True
    }
    response = test_client.post("/api/assets", json=asset_data)
    assert response.status_code == 200
    asset_id = response.json()["id"]

    # Get by Portfolio
    response = test_client.get("/api/assets/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = test_client.put(f"/api/assets/{asset_id}", json={"current_value": 12000})
    assert response.status_code == 200
    assert response.json()["current_value"] == 12000

    # Delete
    response = test_client.delete(f"/api/assets/{asset_id}")
    assert response.status_code == 200
    assert len(db.assets.data) == 0

def test_get_asset_types(test_client):
    response = test_client.get("/api/assets/types")
    assert response.status_code == 200
    assert "types" in response.json()
