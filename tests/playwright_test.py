"""Playwright browser tests for PropEquityLab"""
import asyncio
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8000"
API_URL = "http://localhost:8000/api"

async def run_tests():
    results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Test 1: Health check
        print("Test 1: Health check...")
        response = await page.goto(f"{API_URL}/health")
        status = response.status
        body = await response.json()
        results.append(("Health Check", status == 200, f"Status: {status}, DB: {body.get('database', 'unknown')}"))
        
        # Test 2: OpenAPI docs load
        print("Test 2: OpenAPI docs page...")
        await page.goto(f"{BASE_URL}/docs")
        title = await page.title()
        has_swagger = "PropEquityLab" in title or await page.locator("text=PropEquityLab").count() > 0
        results.append(("API Docs Page", has_swagger, f"Title: {title}"))
        
        # Test 3: Register a user
        print("Test 3: User registration...")
        register_data = {
            "email": "test@propequitylab.com",
            "password": "TestPassword123!",
            "name": "Test User"
        }
        
        response = await page.request.post(f"{API_URL}/auth/register", data=register_data)
        reg_status = response.status
        reg_body = await response.json()
        reg_success = reg_status in [200, 201]
        results.append(("User Registration", reg_success, f"Status: {reg_status}, Message: {reg_body.get('message', reg_body.get('detail', 'OK'))}"))
        
        # Test 4: Login
        print("Test 4: User login...")
        login_data = {
            "email": "test@propequitylab.com",
            "password": "TestPassword123!"
        }
        
        response = await page.request.post(f"{API_URL}/auth/login", data=login_data)
        login_status = response.status
        login_body = await response.json()
        has_token = "access_token" in login_body
        results.append(("User Login", has_token, f"Status: {login_status}, Token: {'Yes' if has_token else 'No'}"))
        
        if has_token:
            token = login_body["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test 5: Get current user
            print("Test 5: Get current user...")
            response = await page.request.get(f"{API_URL}/auth/me", headers=headers)
            me_body = await response.json()
            results.append(("Get Current User", response.status == 200, f"Email: {me_body.get('email', 'N/A')}"))
            
            # Test 6: Create portfolio
            print("Test 6: Create portfolio...")
            portfolio_data = {
                "name": "Test Portfolio",
                "description": "Playwright test portfolio"
            }
            response = await page.request.post(f"{API_URL}/portfolios", data=portfolio_data, headers=headers)
            port_body = await response.json()
            portfolio_id = port_body.get("id")
            results.append(("Create Portfolio", response.status in [200, 201], f"ID: {portfolio_id}, Name: {port_body.get('name', 'N/A')}"))
            
            if portfolio_id:
                # Test 7: Create property
                print("Test 7: Create property...")
                prop_data = {
                    "portfolio_id": portfolio_id,
                    "name": "Test Property",
                    "address": "123 Test St, Sunshine Coast QLD",
                    "property_type": "house",
                    "purchase_price": "750000.00",
                    "current_value": "800000.00",
                    "purchase_date": "2024-01-15",
                    "loan_details": {"loan_amount": 600000, "interest_rate": 5.99, "loan_term": 30},
                    "rental_details": {"weekly_rent": 550, "vacancy_rate": 2}
                }
                response = await page.request.post(f"{API_URL}/properties", data=prop_data, headers=headers)
                prop_body = await response.json()
                results.append(("Create Property", response.status in [200, 201], f"Address: {prop_body.get('address', 'N/A')}"))
                
                # Test 8: Get dashboard summary
                print("Test 8: Dashboard summary...")
                response = await page.request.get(f"{API_URL}/dashboard/summary", headers=headers)
                dash_body = await response.json()
                results.append(("Dashboard Summary", response.status == 200, f"Net Worth: ${dash_body.get('net_worth', 0)}"))
                
                # Test 9: Get projections
                print("Test 9: Portfolio projections...")
                response = await page.request.get(f"{API_URL}/projections/portfolio/{portfolio_id}?years=5", headers=headers)
                results.append(("Portfolio Projections", response.status == 200, f"Status: {response.status}"))
        
        # Test 10: Visual test - API docs screenshot
        print("Test 10: Screenshot of API docs...")
        await page.goto(f"{BASE_URL}/docs")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="C:/Users/matt lee/.openclaw/workspace/propequitylab/tests/api-docs-screenshot.png", full_page=True)
        results.append(("API Docs Screenshot", True, "Saved to tests/api-docs-screenshot.png"))
        
        await browser.close()
    
    # Print results
    print("\n" + "="*60)
    print("PLAYWRIGHT TEST RESULTS")
    print("="*60)
    passed = sum(1 for _, ok, _ in results if ok)
    for name, ok, detail in results:
        status = "[PASS]" if ok else "[FAIL]"
        print(f"  {status} {name}: {detail}")
    print(f"\n{'='*60}")
    print(f"  TOTAL: {passed}/{len(results)} passed")
    print("="*60)
    
    return all(ok for _, ok, _ in results)

if __name__ == "__main__":
    success = asyncio.run(run_tests())
    exit(0 if success else 1)
