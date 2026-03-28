import uuid

def test_register(client):
    email = f"newuser_{uuid.uuid4().hex}@test.com"
    response = client.post("/api/v1/auth/register", json={
        "name": "New User",
        "email": email,
        "password": "test1234",
        "role": "buyer"
    })
    assert response.status_code == 201
    assert response.json()["success"] is True

def test_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@test.com",
        "password": "test1234"
    })
    assert response.status_code == 200
    assert "token" in response.json()

def test_login_wrong_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401