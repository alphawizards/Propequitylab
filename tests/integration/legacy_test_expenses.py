
import pytest
from sqlmodel import select
from models.expense import Expense

def test_expense_crud(client, test_portfolio):
    # Create
    data = {
        "portfolio_id": test_portfolio.id,
        "name": "Groceries",
        "category": "Food",
        "amount": 500,
        "frequency": "monthly"
    }
    response = client.post("/api/expenses", json=data)
    assert response.status_code == 201, response.json()
    item_id = response.json()["id"]

    # Get by Portfolio
    response = client.get(f"/api/expenses/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/expenses/{item_id}", json={"amount": 600})
    assert response.status_code == 200
    assert float(response.json()["amount"]) == 600.0

    # Delete
    response = client.delete(f"/api/expenses/{item_id}")
    assert response.status_code == 200

    # Verify gone
    response = client.get(f"/api/expenses/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_expense_categories(client):
    response = client.get("/api/expenses/categories")
    assert response.status_code == 200
    assert "categories" in response.json()
