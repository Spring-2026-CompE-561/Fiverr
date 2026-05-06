"""Pytest fixtures. PostgreSQL must be reachable (see root README)."""

from __future__ import annotations

import os
import uuid

# Ensure DATABASE_URL is set before any `app` import (matches docker-compose dev DB).
os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://giglink:giglink@127.0.0.1:5432/giglink",
    ),
)

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

    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": password,
            "role": "seller",
        },
    )
    assert register_response.status_code in (200, 201), register_response.text

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )
    assert login_response.status_code == 200, login_response.text

    data = login_response.json()
    token = data.get("token") or data.get("access_token")
    assert token is not None, data

    return {"Authorization": f"Bearer {token}"}
