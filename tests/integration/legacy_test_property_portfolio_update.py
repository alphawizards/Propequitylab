
import pytest
from datetime import date


def test_add_property_updates_portfolio_summary(client, test_portfolio):
    """Adding properties via API should be retrievable in the portfolio listing."""

    # Add first property: value=850000, debt=680000
    response = client.post("/api/properties", json={
        "portfolio_id": test_portfolio.id,
        "address": "42 Harbour Street",
        "suburb": "Sydney",
        "state": "NSW",
        "postcode": "2000",
        "property_type": "house",
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
        "rental_details": {"income": 0},
        "expenses": {"other": 0}
    })
    assert response.status_code == 201, f"Failed to create property: {response.text}"

    # Verify property appears in portfolio
    response = client.get(f"/api/properties/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    props = response.json()
    assert len(props) == 1
    assert float(props[0]["current_value"]) == 850000.0

    # Add second property: value=500000, no debt
    response = client.post("/api/properties", json={
        "portfolio_id": test_portfolio.id,
        "address": "10 Park Road",
        "suburb": "Melbourne",
        "state": "VIC",
        "postcode": "3000",
        "property_type": "apartment",
        "purchase_price": 500000,
        "purchase_date": "2021-01-01",
        "current_value": 500000,
        "rental_details": {"income": 0},
        "expenses": {"other": 0}
    })
    assert response.status_code == 201, f"Failed to create second property: {response.text}"

    # Verify both properties in portfolio
    response = client.get(f"/api/properties/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    props = response.json()
    assert len(props) == 2

    total_value = sum(float(p["current_value"]) for p in props)
    assert total_value == 1350000.0
