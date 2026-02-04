
import pytest
import uuid
from sqlmodel import select
from models.portfolio import Portfolio
from models.property import Property
from models.asset import Asset
from models.liability import Liability

def test_create_portfolio(client, test_user):
    data = {
        "name": "Test Portfolio",
        "type": "personal",
        "settings": {"currency": "USD"},
        "goal_settings": {"retirement_age": 65}
    }
    response = client.post("/api/portfolios", json=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["name"] == "Test Portfolio"
    assert "id" in res_data
    assert res_data["user_id"] == test_user.id

def test_get_portfolios(client, session, test_user):
    # Setup
    p1 = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Portfolio 1", type="personal")
    p2 = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Portfolio 2", type="company")
    session.add(p1)
    session.add(p2)
    session.commit()

    response = client.get("/api/portfolios")
    assert response.status_code == 200
    assert len(response.json()) == 3  # +1 from conftest test_portfolio fixture if auto-used? No, test_portfolio is not autouse.
    names = [p["name"] for p in response.json()]
    assert "Portfolio 1" in names
    assert "Portfolio 2" in names

def test_get_portfolio_detail(client, session, test_user):
    # Setup
    p1 = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Portfolio 1", type="personal")
    session.add(p1)
    session.commit()
    session.refresh(p1)

    response = client.get(f"/api/portfolios/{p1.id}")
    assert response.status_code == 200
    assert response.json()["id"] == p1.id

    response_404 = client.get("/api/portfolios/non_existent_id")
    assert response_404.status_code == 404

def test_update_portfolio(client, session, test_user):
    # Setup
    p1 = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Portfolio 1", type="personal")
    session.add(p1)
    session.commit()
    session.refresh(p1)

    update_data = {"name": "Updated Name"}
    response = client.put(f"/api/portfolios/{p1.id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

    # Verify in DB
    session.refresh(p1)
    assert p1.name == "Updated Name"

def test_delete_portfolio(client, session, test_user):
    # Setup
    p1 = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Portfolio 1", type="personal")
    session.add(p1)
    session.commit()
    session.refresh(p1)
    
    # Add a property to test cascade
    prop = Property(id=str(uuid.uuid4()), portfolio_id=p1.id, user_id=test_user.id, address="123 St", postcode="2000", state="NSW", suburb="Sydney", purchase_price=100, purchase_date="2020-01-01", current_value=100)
    session.add(prop)
    session.commit()

    response = client.delete(f"/api/portfolios/{p1.id}")
    assert response.status_code == 200

    # Verify DB
    assert session.get(Portfolio, p1.id) is None

def test_get_portfolio_summary(client, session, test_user):
    # Setup
    p1 = Portfolio(id=str(uuid.uuid4()), user_id=test_user.id, name="Portfolio 1", type="personal")
    session.add(p1)
    session.commit()
    session.refresh(p1)

    # Add property
    prop = Property(id=str(uuid.uuid4()), portfolio_id=p1.id, user_id=test_user.id, address="123 St", postcode="2000", state="NSW", suburb="Sydney", purchase_price=500000, purchase_date="2020-01-01", current_value=500000, loan_details={"amount": 400000})
    session.add(prop)
    
    # Add asset (Asset model likely needs ID too, check defaults. Assuming likely needs explicit ID or int pk. If Asset uses str UUID, need ID. If int, auto.)
    # Assets likely use UUID str based on pattern.
    asset = Asset(id=str(uuid.uuid4()), portfolio_id=p1.id, user_id=test_user.id, name="Stock", type="stock", current_value=10000)
    session.add(asset)
    
    session.commit()

    response = client.get(f"/api/portfolios/{p1.id}/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_value" in data
    assert "total_assets" in data

