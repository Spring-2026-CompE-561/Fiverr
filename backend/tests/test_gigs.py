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


def test_list_gigs_sort_price(client, auth_headers):
    client.post(
        "/api/v1/gigs",
        json={
            "title": "Cheap",
            "description": "Low price",
            "price": 5.0,
            "category": "Design",
        },
        headers=auth_headers,
    )
    client.post(
        "/api/v1/gigs",
        json={
            "title": "Premium",
            "description": "High price",
            "price": 99.0,
            "category": "Design",
        },
        headers=auth_headers,
    )
    asc_resp = client.get("/api/v1/gigs?sort=price_asc")
    assert asc_resp.status_code == 200
    prices = [g["price"] for g in asc_resp.json()]
    assert prices == sorted(prices)


def test_list_gigs_filter_by_seller(client, auth_headers):
    create = client.post(
        "/api/v1/gigs",
        json={
            "title": "Seller filtered gig",
            "description": "Only for filter test",
            "price": 25.0,
            "category": "Design",
        },
        headers=auth_headers,
    )
    assert create.status_code == 201, create.text
    seller_id = create.json()["gig"]["seller_id"]

    listed = client.get(
        f"/api/v1/gigs?sellerId={seller_id}",
    )
    assert listed.status_code == 200
    body = listed.json()
    assert isinstance(body, list)
    assert any(g["title"] == "Seller filtered gig" for g in body)