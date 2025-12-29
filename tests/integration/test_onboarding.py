
import pytest

def test_onboarding_status(test_client, db):
    # Setup - mock user
    db.users.data = [{"id": "dev-user-01", "onboarding_completed": False, "onboarding_step": 0}]

    response = test_client.get("/api/onboarding/status")
    assert response.status_code == 200
    # The actual response model field is 'completed', not 'is_complete'
    assert "completed" in response.json()

def test_onboarding_step(test_client, db):
    # Setup - mock user
    db.users.data = [{"id": "dev-user-01", "onboarding_step": 0}]

    response = test_client.put("/api/onboarding/step/1", json={"step": 1, "data": {"name": "John"}})
    assert response.status_code == 200
    # The endpoint returns {message, data}, not updated user object with current_step
    assert response.json()["message"] == "Step 1 saved successfully"

def test_complete_onboarding(test_client, db):
    # Setup - mock user
    db.users.data = [{"id": "dev-user-01"}]

    response = test_client.post("/api/onboarding/complete")
    assert response.status_code == 200
    # The endpoint returns a message
    assert response.json()["message"] == "Onboarding completed successfully"
