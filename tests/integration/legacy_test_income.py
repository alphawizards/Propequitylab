
import pytest
from sqlmodel import select
from models.income import IncomeSource

def test_income_crud(client, test_portfolio):
    # Create
    data = {
        "portfolio_id": test_portfolio.id,
        "name": "Salary",
        "type": "salary",
        "amount": 5000,
        "frequency": "monthly",
        "owner": "Me",
        "is_active": True
    }
    response = client.post("/api/income", json=data)
    assert response.status_code == 201, response.json()
    item_id = response.json()["id"]

    # Get by Portfolio
    response = client.get(f"/api/income/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/income/{item_id}", json={"amount": 5500})
    assert response.status_code == 200
    assert float(response.json()["amount"]) == 5500.0

    # Delete
    response = client.delete(f"/api/income/{item_id}")
    assert response.status_code == 200

    # Verify gone
    response = client.get(f"/api/income/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 0
