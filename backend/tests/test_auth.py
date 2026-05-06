import uuid


def test_register(client):
    email = f"newuser_{uuid.uuid4().hex}@test.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New User",
            "email": email,
            "password": "test1234",
            "role": "buyer",
        },
    )
    assert response.status_code == 201
    assert response.json()["success"] is True


def test_login(client):
    email = f"login_{uuid.uuid4().hex}@test.com"
    password = "test1234"
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Login User",
            "email": email,
            "password": password,
            "role": "buyer",
        },
    )
    assert reg.status_code in (200, 201), reg.text

    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    assert "token" in response.json()


def test_login_wrong_password(client):
    email = f"wrongpw_{uuid.uuid4().hex}@test.com"
    password = "test1234"
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Wrong PW User",
            "email": email,
            "password": password,
            "role": "buyer",
        },
    )
    assert reg.status_code in (200, 201), reg.text

    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrongpassword"},
    )
    assert response.status_code == 401
