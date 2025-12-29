
import pytest
from backend.routes.properties import PropertyProjectionRequest

def test_property_equity_projection_logic(test_client):
    payload = {
        "current_value": 800000,
        "loan_balance": 600000,
        "interest_rate": 6.0,
        "loan_term_years": 30,
        "capital_growth_rate": 5.0,
        "repayment_type": "principal_interest",
        "years": 10
    }

    response = test_client.post("/api/properties/project-equity", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Assert output structure
    assert "projections" in data
    assert len(data["projections"]) == 10
    assert "final_value" in data
    assert "final_equity" in data

    # Assert values logic
    # Year 1:
    # Value = 800000 * 1.05 = 840000
    # Debt should decrease (P&I)

    proj1 = data["projections"][0]
    assert 839000 < proj1["property_value"] < 841000
    assert proj1["loan_balance"] < 600000
    assert proj1["equity"] == round(proj1["property_value"] - proj1["loan_balance"], 2)

    # Test Interest Only
    payload["repayment_type"] = "interest_only"
    response_io = test_client.post("/api/properties/project-equity", json=payload)
    data_io = response_io.json()

    # Loan balance should remain roughly constant (ignoring offset for now)
    # Actually, simplistic logic might have small floating point diffs, but it shouldn't drop like P&I
    assert data_io["projections"][-1]["loan_balance"] == 600000 or abs(data_io["projections"][-1]["loan_balance"] - 600000) < 1
    assert data_io["projections"][-1]["property_value"] > 800000
