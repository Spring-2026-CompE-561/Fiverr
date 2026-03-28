import pytest
from fastapi.testclient import TestClient
from src.app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    client.post("/api/v1/auth/register", json={
        "email": "test@test.com",
        "password": "test1234",
        "username": "testuser",
        "role": "buyer"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "test@test.com",
        "password": "test1234"
    })
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}