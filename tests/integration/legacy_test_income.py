
import pytest

def test_income_crud(client, db):
    # Create
    data = {
        "portfolio_id": "p1",
        "name": "Salary",
        "type": "salary",
        "amount": 5000,
        "frequency": "monthly",
        "owner": "Me",
        "is_active": True
    }
    response = client.post("/api/income", json=data)
    assert response.status_code == 200
    item_id = response.json()["id"]

    # Get by Portfolio
    response = client.get("/api/income/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/income/{item_id}", json={"amount": 5500})
    assert response.status_code == 200
    assert response.json()["amount"] == 5500

    # Delete
    response = client.delete(f"/api/income/{item_id}")
    assert response.status_code == 200
    assert len(db.income_sources.data) == 0
