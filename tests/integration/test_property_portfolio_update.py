
import pytest

def test_add_property_updates_portfolio_summary(client, db):
    # 1. Setup: Create a portfolio
    portfolio_id = "p1"
    db.portfolios.data = [{"id": portfolio_id, "user_id": "dev-user-01", "name": "Test Portfolio"}]
    # Ensure no existing properties or assets
    db.properties.data = []
    db.assets.data = []
    db.liabilities.data = []

    # 2. Add a property
    # Value: 850,000, Debt: 680,000 -> Equity: 170,000
    property_payload = {
        "portfolio_id": portfolio_id,
        "address": "42 Harbour Street",
        "suburb": "Sydney",
        "state": "NSW",
        "postcode": "2000",
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 2,
        "car_spaces": 1,
        "land_size": 450,
        "building_size": 180,
        "year_built": 2010,
        "purchase_price": 850000,
        "purchase_date": "2020-01-01",
        "current_value": 850000,
        "loan_details": {
          "amount": 680000,
          "interest_rate": 6.25,
          "loan_type": "interest_only",
          "loan_term": 30,
          "lender": "Commonwealth Bank",
          "offset_balance": 0
        },
        "rental_details": {
            "income": 0
        },
        "expenses": {
            "other": 0
        }
    }

    response = client.post("/api/properties", json=property_payload)
    assert response.status_code == 200, f"Failed to create property: {response.text}"

    # 3. Check Portfolio Summary
    response = client.get(f"/api/portfolios/{portfolio_id}/summary")
    assert response.status_code == 200
    summary = response.json()

    # 4. Verify Calculations
    expected_value = 850000
    expected_debt = 680000
    expected_equity = expected_value - expected_debt

    assert summary["properties_count"] == 1
    assert summary["total_value"] == expected_value
    assert summary["total_debt"] == expected_debt
    assert summary["total_equity"] == expected_equity
    assert summary["net_worth"] == expected_equity # Assuming no other assets/liabilities

    # 5. Add a second property to verify accumulation
    # Value: 500,000, Debt: 0 -> Equity: 500,000
    property_payload_2 = {
        "portfolio_id": portfolio_id,
        "address": "10 Park Road",
        "suburb": "Melbourne",
        "state": "VIC",
        "postcode": "3000",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 1,
        "car_spaces": 1,
        "purchase_price": 500000,
        "purchase_date": "2021-01-01",
        "current_value": 500000,
        "rental_details": {"income": 0},
        "expenses": {"other": 0}
    }

    response = client.post("/api/properties", json=property_payload_2)
    assert response.status_code == 200

    # Check Summary again
    response = client.get(f"/api/portfolios/{portfolio_id}/summary")
    summary = response.json()

    assert summary["properties_count"] == 2
    assert summary["total_value"] == 850000 + 500000
    assert summary["total_debt"] == 680000
    assert summary["total_equity"] == (850000 + 500000) - 680000
