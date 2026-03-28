import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    email = f"test{uuid.uuid4().hex}@test.com"
    password = "test1234"

    register_response = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": password,
        "role": "seller"
    })
    assert register_response.status_code in (200, 201), register_response.text

    login_response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200, login_response.text

    data = login_response.json()
    token = data.get("token") or data.get("access_token")
    assert token is not None, data

    return {"Authorization": f"Bearer {token}"}