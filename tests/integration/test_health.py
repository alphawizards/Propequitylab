
def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["stack"] == "PostgreSQL + App Runner"
    assert data["components"]["api"] == "running"
    assert data["status"] in ("healthy", "degraded")

