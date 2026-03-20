from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# test that the API is running
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Fiverr API is running"}

# test that the health check endpoint works
def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}