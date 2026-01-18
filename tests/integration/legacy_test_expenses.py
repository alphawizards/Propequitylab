
import pytest

def test_expense_crud(client, db):
    # Create
    data = {
        "portfolio_id": "p1",
        "name": "Groceries",
        "category": "Food",
        "amount": 500,
        "frequency": "monthly",
        "is_active": True
    }
    response = client.post("/api/expenses", json=data)
    assert response.status_code == 200
    item_id = response.json()["id"]

    # Get by Portfolio
    response = client.get("/api/expenses/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/expenses/{item_id}", json={"amount": 600})
    assert response.status_code == 200
    assert response.json()["amount"] == 600

    # Delete
    response = client.delete(f"/api/expenses/{item_id}")
    assert response.status_code == 200
    assert len(db.expenses.data) == 0

def test_expense_categories(client):
    response = client.get("/api/expenses/categories")
    assert response.status_code == 200
    assert "categories" in response.json()
