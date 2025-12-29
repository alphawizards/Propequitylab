
import pytest
from backend.routes.assets import SuperProjectionRequest

def test_super_projection_logic(test_client):
    payload = {
        "current_balance": 100000,
        "income_gross": 100000,
        "employer_contribution_rate": 11.5,
        "personal_contribution_rate": 0,
        "expected_return": 7.0,
        "years": 10,
        "salary_growth_rate": 3.0,
        "inflation_rate": 2.5
    }

    response = test_client.post("/api/assets/project-super", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Assert output structure
    assert "projections" in data
    assert len(data["projections"]) == 10
    assert "final_balance_nominal" in data
    assert "final_balance_real" in data

    # Assert values logic
    # Year 1:
    # Contribs = 100000 * 0.115 * 0.85 (tax) = 11500 * 0.85 = 9775
    # Growth = 100000 * 0.07 = 7000
    # End Bal = 100000 + 7000 + 9775 = 116775

    proj1 = data["projections"][0]
    assert proj1["year"] > 2024
    assert 116000 < proj1["balance_nominal"] < 117000

    # Assert final year
    final = data["projections"][-1]
    assert final["balance_nominal"] > data["projections"][-2]["balance_nominal"]
    assert final["balance_real"] < final["balance_nominal"]
