
import pytest

def test_plan_crud(test_client, db):
    # Create
    data = {
        "portfolio_id": "p1",
        "name": "Fire Plan",
        "description": "Retire early",
        "type": "fire",
        "retirement_age": 55,
        "target_equity": 1000000
    }
    response = test_client.post("/api/plans", json=data)
    if response.status_code != 200:
        print(response.json())
    assert response.status_code == 200
    item_id = response.json()["id"]

    # Get by Portfolio
    response = test_client.get("/api/plans/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = test_client.put(f"/api/plans/{item_id}", json={"target_equity": 1200000})
    assert response.status_code == 200
    assert response.json()["target_equity"] == 1200000

    # Delete
    response = test_client.delete(f"/api/plans/{item_id}")
    assert response.status_code == 200
    assert len(db.plans.data) == 0

def test_plan_types(test_client):
    response = test_client.get("/api/plans/types")
    assert response.status_code == 200
    assert "types" in response.json()
