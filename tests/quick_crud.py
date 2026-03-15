"""Quick CRUD test for Property, Asset, Liability"""
import asyncio
from playwright.async_api import async_playwright

API = "http://localhost:8000/api"

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Login
        res = await page.request.post(f"{API}/auth/login", data={
            "email": "test@propequitylab.com",
            "password": "TestPassword123!"
        })
        login = await res.json()
        token = login["access_token"]
        h = {"Authorization": f"Bearer {token}"}
        
        # Get or create portfolio
        res = await page.request.get(f"{API}/portfolios", headers=h)
        portfolios = await res.json()
        pid = portfolios[0]["id"] if portfolios else (await (await page.request.post(f"{API}/portfolios", data={"name": "Test"}, headers=h)).json())["id"]
        print(f"Portfolio: {pid}")
        
        # Property
        res = await page.request.post(f"{API}/properties", data={
            "portfolio_id": pid, "address": "123 Test St", "suburb": "Maroochydore",
            "state": "QLD", "postcode": "4558", "property_type": "house",
            "purchase_price": "750000.00", "purchase_date": "2024-01-15",
            "current_value": "820000.00",
            "loan_details": {"amount": "600000", "interest_rate": "5.99", "loan_type": "principal_interest", "loan_term": 30},
            "rental_details": {"income": "550", "frequency": "weekly", "vacancy_rate": "2.0", "is_rented": True}
        }, headers=h)
        prop = await res.json()
        print(f"Property: {res.status} - {prop.get('address')}, {prop.get('suburb')} - ${prop.get('current_value')}")
        prop_id = prop.get("id")
        
        # Asset
        res = await page.request.post(f"{API}/assets", data={
            "portfolio_id": pid, "name": "Vanguard VGS ETF", "type": "shares",
            "current_value": "50000.00", "purchase_value": "40000.00", "ticker": "VGS"
        }, headers=h)
        asset = await res.json()
        print(f"Asset: {res.status} - {asset.get('name')} - ${asset.get('current_value')}")
        
        # Liability
        res = await page.request.post(f"{API}/liabilities", data={
            "portfolio_id": pid, "name": "Car Loan", "type": "car_loan",
            "original_amount": "35000.00", "current_balance": "28000.00", "interest_rate": "6.5"
        }, headers=h)
        liab = await res.json()
        print(f"Liability: {res.status} - {liab.get('name')} - ${liab.get('current_balance')}")
        
        # Dashboard
        res = await page.request.get(f"{API}/dashboard/summary", headers=h)
        dash = await res.json()
        print(f"\nDashboard: Net Worth = ${dash.get('net_worth', 0)}")
        print(f"  Properties: {dash.get('total_properties', 0)}")
        print(f"  Assets: {dash.get('total_assets', 0)}")
        print(f"  Liabilities: {dash.get('total_liabilities', 0)}")
        
        await browser.close()

asyncio.run(run())
