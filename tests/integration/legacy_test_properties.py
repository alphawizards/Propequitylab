
import pytest
import uuid
from datetime import date
from sqlmodel import select
from models.property import Property

def test_create_property(client, session, test_user, test_portfolio):
    data = {
        "portfolio_id": test_portfolio.id,
        "address": "123 Street",
        "suburb": "Sydney",
        "state": "NSW",
        "postcode": "2000",
        "purchase_price": 400000,
        "current_value": 500000,
        "purchase_date": "2020-01-01",
        "rental_details": {"income": 0},
        "expenses": {"other": 0},
        "loan_details": {"amount": 300000, "interest_rate": 3.5}
    }
    response = client.post("/api/properties", json=data)
    if response.status_code != 200:
        print(response.json())
    assert response.status_code == 200
    assert response.json()["address"] == "123 Street"
    
    # Verify in DB
    props = session.exec(select(Property).where(Property.user_id == test_user.id)).all()
    assert len(props) == 1
    assert props[0].address == "123 Street"

def test_get_properties(client, session, test_user, test_portfolio):
    # Setup
    prop = Property(
        id=str(uuid.uuid4()),
        portfolio_id=test_portfolio.id,
        user_id=test_user.id,
        address="123 Street",
        suburb="Sydney", 
        state="NSW", 
        postcode="2000",
        purchase_price=400000,
        purchase_date=date(2020, 1, 1),
        current_value=500000,
        property_type="house"
    )
    session.add(prop)
    session.commit()

    response = client.get(f"/api/properties/portfolio/{test_portfolio.id}")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == prop.id

def test_update_property(client, session, test_user, test_portfolio):
    # Setup
    prop = Property(
        id=str(uuid.uuid4()),
        portfolio_id=test_portfolio.id,
        user_id=test_user.id,
        address="123 Street",
        suburb="Sydney", 
        state="NSW", 
        postcode="2000",
        purchase_price=400000,
        purchase_date=date(2020, 1, 1),
        current_value=500000,
        property_type="house"
    )
    session.add(prop)
    session.commit()
    session.refresh(prop)

    response = client.put(f"/api/properties/{prop.id}", json={"current_value": 550000})
    assert response.status_code == 200
    assert response.json()["current_value"] == 550000
    
    # Verify in DB
    session.refresh(prop)
    assert prop.current_value == 550000

def test_delete_property(client, session, test_user, test_portfolio):
    # Setup
    prop = Property(
        id=str(uuid.uuid4()),
        portfolio_id=test_portfolio.id,
        user_id=test_user.id,
        address="123 Street", 
        suburb="Sydney",
        state="NSW",
        postcode="2000",
        purchase_price=400000,
        purchase_date=date(2020, 1, 1),
        current_value=500000
    )
    session.add(prop)
    session.commit()
    session.refresh(prop)

    response = client.delete(f"/api/properties/{prop.id}")
    assert response.status_code == 200
    
    # Verify in DB
    assert session.get(Property, prop.id) is None


