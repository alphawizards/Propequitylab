
import pytest


def test_onboarding_status(client, test_user):
    """GET /api/onboarding/status returns the current user's onboarding state."""
    response = client.get("/api/onboarding/status")
    assert response.status_code == 200
    body = response.json()
    assert "completed" in body
    # test_user fixture has onboarding_completed=True
    assert body["completed"] is True
    assert body["current_step"] == 8
    assert body["total_steps"] == 8


def test_onboarding_step(client, test_user):
    """PUT /api/onboarding/step/{step} saves step data and returns a success message."""
    payload = {"step": 1, "data": {"name": "John"}}
    response = client.put("/api/onboarding/step/1", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Step 1 saved successfully"
    # The returned data dict should contain the updated name
    assert body["data"].get("name") == "John"


def test_complete_onboarding(client, test_user):
    """POST /api/onboarding/complete marks onboarding as done (idempotent)."""
    response = client.post("/api/onboarding/complete")
    assert response.status_code == 200
    assert response.json()["message"] == "Onboarding completed successfully"
