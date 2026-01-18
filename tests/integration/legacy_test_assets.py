
import pytest

def test_asset_crud(client, db):
    # Create
    asset_data = {
        "portfolio_id": "p1",
        "name": "Tesla Stock",
        "type": "shares",
        "owner": "Me",
        "current_value": 10000,
        "is_active": True
    }
    response = client.post("/api/assets", json=asset_data)
    assert response.status_code == 200
    asset_id = response.json()["id"]

    # Get by Portfolio
    response = client.get("/api/assets/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/assets/{asset_id}", json={"current_value": 12000})
    assert response.status_code == 200
    assert response.json()["current_value"] == 12000

    # Delete
    response = client.delete(f"/api/assets/{asset_id}")
    assert response.status_code == 200
    assert len(db.assets.data) == 0

def test_get_asset_types(client):
    response = client.get("/api/assets/types")
    assert response.status_code == 200
    assert "types" in response.json()
