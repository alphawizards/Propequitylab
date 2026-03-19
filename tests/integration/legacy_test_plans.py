
import pytest
from sqlmodel import select
from models.plan import Plan

def test_plan_crud(client, test_portfolio):
    # Create
    data = {
        "portfolio_id": test_portfolio.id,
        "name": "Fire Plan",
        "description": "Retire early",
        "type": "fire",
        "retirement_age": 55,
        "target_equity": 1000000
    }
    response = client.post("/api/plans", json=data)
    assert response.status_code == 201, response.json()
    item_id = response.json()["id"]

    # Get by Portfolio
    response = client.get(f"/api/plans/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/plans/{item_id}", json={"target_equity": 1200000})
    assert response.status_code == 200
    assert float(response.json()["target_equity"]) == 1200000.0

    # Delete
    response = client.delete(f"/api/plans/{item_id}")
    assert response.status_code == 200

    # Verify gone
    response = client.get(f"/api/plans/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_plan_types(client):
    response = client.get("/api/plans/types")
    assert response.status_code == 200
    assert "types" in response.json()
