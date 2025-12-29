
def test_health_check(test_client):
    response = test_client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "dev_user_id": "dev-user-01"}

def test_root(test_client):
    response = test_client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"message": "Zapiio API is running", "version": "1.0.0"}
