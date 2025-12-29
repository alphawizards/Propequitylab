
import pytest

def test_liability_crud(test_client, db):
    # Create
    data = {
        "portfolio_id": "p1",
        "name": "Car Loan",
        "type": "car_loan",
        "owner": "Me",
        "original_amount": 25000,
        "current_balance": 20000,
        "is_active": True
    }
    response = test_client.post("/api/liabilities", json=data)
    assert response.status_code == 200
    item_id = response.json()["id"]

    # Get by Portfolio
    response = test_client.get("/api/liabilities/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = test_client.put(f"/api/liabilities/{item_id}", json={"current_balance": 18000})
    assert response.status_code == 200
    assert response.json()["current_balance"] == 18000

    # Delete
    response = test_client.delete(f"/api/liabilities/{item_id}")
    assert response.status_code == 200
    assert len(db.liabilities.data) == 0

def test_liability_types(test_client):
    response = test_client.get("/api/liabilities/types")
    assert response.status_code == 200
    assert "types" in response.json()
