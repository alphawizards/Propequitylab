
import pytest

def test_create_property(client, db):
    data = {
        "portfolio_id": "p1",
        "address": "123 Street",
        "suburb": "Sydney",
        "state": "NSW",
        "postcode": "2000",
        "purchase_price": 400000,
        "current_value": 500000,
        "purchase_date": "2020-01-01",
        # rental_income and expenses are part of nested objects in PropertyCreate
        "rental_details": {"income": 0},
        "expenses": {"other": 0},
        "loan_details": {"amount": 300000, "interest_rate": 3.5}
    }
    response = client.post("/api/properties", json=data)
    if response.status_code != 200:
        print(response.json())
    assert response.status_code == 200
    assert response.json()["address"] == "123 Street"
    assert len(db.properties.data) == 1

def test_get_properties(client, db):
    # Property response model requires all fields
    db.properties.data = [{
        "id": "prop1", "portfolio_id": "p1", "user_id": "dev-user-01",
        "address": "123 Street", "suburb": "Sydney", "state": "NSW", "postcode": "2000",
        "purchase_price": 400000, "purchase_date": "2020-01-01",
        "current_value": 500000,
        "property_type": "house"
    }]
    response = client.get("/api/properties/portfolio/p1")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == "prop1"

def test_update_property(client, db):
    # Important: db item must match the user_id query which is usually required by update endpoints
    # Check if update_property in backend requires user_id (usually yes)
    # The mock patch for dev user returns user_id "dev-user-01"
    # So the item in DB must have user_id="dev-user-01"
    db.properties.data = [{
        "id": "prop1", "portfolio_id": "p1", "user_id": "dev-user-01",
        "address": "123 Street", "suburb": "Sydney", "state": "NSW", "postcode": "2000",
        "purchase_price": 400000, "purchase_date": "2020-01-01",
        "current_value": 500000,
        "property_type": "house"
    }]
    response = client.put("/api/properties/prop1", json={"current_value": 550000})
    assert response.status_code == 200
    assert response.json()["current_value"] == 550000
    assert db.properties.data[0]["current_value"] == 550000

def test_delete_property(client, db):
    db.properties.data = [{"id": "prop1", "portfolio_id": "p1", "user_id": "dev-user-01"}]
    response = client.delete("/api/properties/prop1")
    assert response.status_code == 200
    assert len(db.properties.data) == 0
