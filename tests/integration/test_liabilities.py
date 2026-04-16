
def test_liability_crud(client, test_portfolio):
    # Create
    data = {
        "portfolio_id": test_portfolio.id,
        "name": "Car Loan",
        "type": "car_loan",
        "owner": "Me",
        "original_amount": 25000,
        "current_balance": 20000
    }
    response = client.post("/api/liabilities", json=data)
    assert response.status_code == 201, response.json()
    item_id = response.json()["id"]

    # Get by Portfolio
    response = client.get(f"/api/liabilities/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Update
    response = client.put(f"/api/liabilities/{item_id}", json={"current_balance": 18000})
    assert response.status_code == 200
    assert float(response.json()["current_balance"]) == 18000.0

    # Delete
    response = client.delete(f"/api/liabilities/{item_id}")
    assert response.status_code == 204

    # Verify gone
    response = client.get(f"/api/liabilities/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_liability_types(client):
    response = client.get("/api/liabilities/types")
    assert response.status_code == 200
    assert "types" in response.json()
