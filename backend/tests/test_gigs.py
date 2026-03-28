def test_list_gigs(client):
    response = client.get("/api/v1/gigs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_gig(client, auth_headers):
    response = client.post(
        "/api/v1/gigs",
        json={
            "title": "Test Gig",
            "description": "Test description",
            "price": 10.0,
            "category": "programming"
        },
        headers=auth_headers
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["success"] is True
    assert data["gig"]["title"] == "Test Gig"
    assert data["gig"]["category"] == "programming"

def test_get_gig_not_found(client):
    response = client.get("/api/v1/gigs/nonexistent-id")
    assert response.status_code == 404