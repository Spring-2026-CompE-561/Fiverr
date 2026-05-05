"""
Integration test: verifies the backend API is reachable and returns
expected responses for core endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_register_and_login():
    import uuid
    email = f"integration{uuid.uuid4().hex}@test.com"
    password = "Integration!2026"

    # Register
    res = client.post("/api/v1/auth/register", json={
        "name": "Integration User",
        "email": email,
        "password": password,
        "role": "buyer",
    })
    assert res.status_code in (200, 201), res.text

    # Login
    res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password,
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert "access_token" in data or "token" in data


def test_gigs_list_is_accessible():
    response = client.get("/api/v1/gigs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_unauthorized_post_gig():
    response = client.post("/api/v1/gigs", json={
        "title": "Unauthorized Gig",
        "description": "This should fail",
        "price": 10.0,
        "tags": ["test"],
    })
    assert response.status_code == 401