from fastapi.testclient import TestClient
from src.app.main import app

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

# test user registration
def test_register_user():
    response = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@test.com",
        "password": "testpassword"
    })
    assert response.status_code in [200, 201]

# test user login
def test_login_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "test@test.com",
        "password": "testpassword"
    })
    assert response.status_code in [200, 201]

# test create gig
def test_create_gig():
    response = client.post("/api/v1/gigs", json={
        "title": "Test Gig",
        "description": "Test Description",
        "price": 10.0
    })
    assert response.status_code in [200, 201, 401]

# test create order
def test_create_order():
    response = client.post("/api/v1/orders", json={
        "gig_id": 1
    })
    assert response.status_code in [200, 201, 401]

# test create review
def test_create_review():
    response = client.post("/api/v1/reviews", json={
        "gig_id": 1,
        "rating": 5,
        "comment": "Great!"
    })
    assert response.status_code in [200, 201, 401]