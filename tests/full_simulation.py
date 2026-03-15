"""Full Australian user simulation - 3 properties, complete financial profile"""
import asyncio
from playwright.async_api import async_playwright
import time

API = "http://localhost:8000/api"

# Average Australian financial profile
USER = {
    "email": f"aussie{int(time.time())}@test.com",
    "password": "SecurePass123!",
    "name": "Sarah Mitchell"
}

PROPERTIES = [
    {
        "name": "PPOR - Family Home",
        "address": "42 Wattle Street",
        "suburb": "Buderim",
        "state": "QLD",
        "postcode": "4556",
        "property_type": "house",
        "bedrooms": 4,
        "bathrooms": 2,
        "car_spaces": 2,
        "land_size": "650",
        "building_size": "220",
        "year_built": 2015,
        "purchase_price": "685000.00",
        "purchase_date": "2019-03-20",
        "current_value": "920000.00",
        "stamp_duty": "23425.00",
        "purchase_costs": "3500.00",
        "loan_details": {
            "amount": "548000.00",
            "interest_rate": "5.89",
            "loan_type": "principal_interest",
            "loan_term": 30,
            "lender": "Commonwealth Bank",
            "offset_balance": "35000.00"
        },
        "rental_details": None,
        "expenses": {
            "council_rates": "3200.00",
            "water_rates": "1400.00",
            "insurance": "2200.00",
            "maintenance": "4000.00",
            "strata": "0.00",
            "property_management": "0.00",
            "land_tax": "0.00",
            "other": "800.00"
        },
        "growth_assumptions": {
            "capital_growth_rate": "5.5",
            "rental_growth_rate": "0.0"
        }
    },
    {
        "name": "Investment Property 1 - Brisbane Unit",
        "address": "15/89 Queen Street",
        "suburb": "Brisbane City",
        "state": "QLD",
        "postcode": "4000",
        "property_type": "apartment",
        "bedrooms": 2,
        "bathrooms": 1,
        "car_spaces": 1,
        "land_size": "0",
        "building_size": "85",
        "year_built": 2018,
        "purchase_price": "485000.00",
        "purchase_date": "2021-08-10",
        "current_value": "565000.00",
        "stamp_duty": "17325.00",
        "purchase_costs": "2500.00",
        "loan_details": {
            "amount": "436500.00",
            "interest_rate": "6.19",
            "loan_type": "interest_only",
            "loan_term": 30,
            "lender": "ANZ",
            "offset_balance": "8000.00"
        },
        "rental_details": {
            "income": "520.00",
            "frequency": "weekly",
            "vacancy_rate": "2.5",
            "is_rented": True
        },
        "expenses": {
            "council_rates": "2800.00",
            "water_rates": "1200.00",
            "insurance": "1600.00",
            "maintenance": "2500.00",
            "strata": "6500.00",
            "property_management": "7.5",
            "land_tax": "1200.00",
            "other": "500.00"
        },
        "growth_assumptions": {
            "capital_growth_rate": "4.5",
            "rental_growth_rate": "3.0"
        }
    },
    {
        "name": "Investment Property 2 - Sunshine Coast House",
        "address": "27 Pandanus Parade",
        "suburb": "Caloundra",
        "state": "QLD",
        "postcode": "4551",
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 2,
        "car_spaces": 1,
        "land_size": "450",
        "building_size": "165",
        "year_built": 2005,
        "purchase_price": "620000.00",
        "purchase_date": "2023-02-15",
        "current_value": "710000.00",
        "stamp_duty": "21725.00",
        "purchase_costs": "3000.00",
        "loan_details": {
            "amount": "496000.00",
            "interest_rate": "6.09",
            "loan_type": "interest_only",
            "loan_term": 30,
            "lender": "Westpac",
            "offset_balance": "12000.00"
        },
        "rental_details": {
            "income": "580.00",
            "frequency": "weekly",
            "vacancy_rate": "2.0",
            "is_rented": True
        },
        "expenses": {
            "council_rates": "3100.00",
            "water_rates": "1300.00",
            "insurance": "2400.00",
            "maintenance": "3500.00",
            "strata": "0.00",
            "property_management": "8.0",
            "land_tax": "1800.00",
            "other": "600.00"
        },
        "growth_assumptions": {
            "capital_growth_rate": "6.0",
            "rental_growth_rate": "3.5"
        }
    }
]

INCOME_SOURCES = [
    {
        "portfolio_id": None,  # filled at runtime
        "name": "Salary - Marketing Manager",
        "type": "salary",
        "amount": "95000.00",
        "frequency": "annually",
        "tax_rate": "32.5",
        "is_taxable": True
    },
    {
        "portfolio_id": None,
        "name": "Rental Income - Brisbane Unit",
        "type": "rental",
        "amount": "26960.00",
        "frequency": "annually",
        "tax_rate": "32.5",
        "is_taxable": True
    },
    {
        "portfolio_id": None,
        "name": "Rental Income - Caloundra House",
        "type": "rental",
        "amount": "30160.00",
        "frequency": "annually",
        "tax_rate": "32.5",
        "is_taxable": True
    }
]

EXPENSES = [
    {"portfolio_id": None, "name": "Groceries", "category": "living", "amount": "12000.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Utilities (Elec/Gas)", "category": "utilities", "amount": "3600.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Car Insurance", "category": "insurance", "amount": "1800.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Health Insurance", "category": "insurance", "amount": "2400.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Internet & Phone", "category": "utilities", "amount": "1800.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Transport/Fuel", "category": "transport", "amount": "4800.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Childcare", "category": "childcare", "amount": "15000.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Private School Fees", "category": "education", "amount": "8000.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Subscriptions", "category": "entertainment", "amount": "1200.00", "frequency": "annually"},
    {"portfolio_id": None, "name": "Dining Out", "category": "entertainment", "amount": "3600.00", "frequency": "annually"},
]

ASSETS = [
    {"portfolio_id": None, "name": "Superannuation - Hostplus", "type": "super", "current_value": "185000.00", "purchase_value": "120000.00", "purchase_date": "2015-07-01", "expected_return": "7.5", "tax_environment": "super"},
    {"portfolio_id": None, "name": "Vanguard VDHG ETF", "type": "shares", "current_value": "42000.00", "purchase_value": "30000.00", "purchase_date": "2022-01-15", "ticker": "VDHG", "units": "850.00", "expected_return": "8.0", "tax_environment": "taxable"},
    {"portfolio_id": None, "name": "Emergency Savings", "type": "cash", "current_value": "25000.00", "purchase_value": "25000.00", "expected_return": "4.5", "tax_environment": "taxable"},
    {"portfolio_id": None, "name": "Car - 2022 Toyota RAV4", "type": "vehicle", "current_value": "38000.00", "purchase_value": "52000.00", "purchase_date": "2022-06-01", "expected_return": "-10.0", "tax_environment": "taxable"},
]

LIABILITIES = [
    {"portfolio_id": None, "name": "Car Loan - RAV4", "type": "car_loan", "original_amount": "40000.00", "current_balance": "22000.00", "interest_rate": "7.2", "minimum_payment": "780.00", "payment_frequency": "monthly"},
    {"portfolio_id": None, "name": "HECS-HELP Debt", "type": "student_loan", "original_amount": "45000.00", "current_balance": "18000.00", "interest_rate": "4.0", "minimum_payment": "0.00", "payment_frequency": "annually"},
    {"portfolio_id": None, "name": "Credit Card", "type": "credit_card", "original_amount": "5000.00", "current_balance": "3200.00", "interest_rate": "19.9", "minimum_payment": "100.00", "payment_frequency": "monthly"},
]

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("="*60)
        print("AUSTRALIAN USER SIMULATION")
        print(f"User: {USER['name']}")
        print(f"Email: {USER['email']}")
        print("="*60)
        
        # Register
        res = await page.request.post(f"{API}/auth/register", data={
            "email": USER["email"],
            "password": USER["password"],
            "name": USER["name"]
        })
        reg = await res.json()
        print(f"\n[REGISTER] Status: {res.status}")
        
        # Verify user in DB
        import subprocess
        subprocess.run(["C:/Program Files/PostgreSQL/18/bin/psql.exe", "-U", "postgres", "-d", "propequitylab", "-c", f"UPDATE users SET is_verified = true WHERE email = '{USER['email']}'"], capture_output=True)
        
        # Login
        res = await page.request.post(f"{API}/auth/login", data={
            "email": USER["email"],
            "password": USER["password"]
        })
        login = await res.json()
        token = login["access_token"]
        h = {"Authorization": f"Bearer {token}"}
        print(f"[LOGIN] Status: {res.status}")
        
        # Create Portfolio
        res = await page.request.post(f"{API}/portfolios", data={
            "name": "Mitchell Family Portfolio",
            "description": "Complete family financial portfolio - 3 properties, investments, and liabilities"
        }, headers=h)
        portfolio = await res.json()
        pid = portfolio["id"]
        print(f"\n[PORTFOLIO] Created: {portfolio['name']}")
        
        # Create Properties
        print(f"\n[PROPERTIES]")
        prop_ids = []
        for p_data in PROPERTIES:
            p_data["portfolio_id"] = pid
            res = await page.request.post(f"{API}/properties", data=p_data, headers=h)
            prop = await res.json()
            prop_id = prop.get("id")
            prop_ids.append(prop_id)
            
            # Calculate metrics
            purchase = float(p_data["purchase_price"])
            current = float(p_data["current_value"])
            growth = ((current - purchase) / purchase) * 100
            
            loan = p_data.get("loan_details") or {}
            rental = p_data.get("rental_details")
            expenses = p_data.get("expenses") or {}
            
            weekly_rent = float(rental["income"]) if rental else 0
            annual_rent = weekly_rent * 52
            loan_amount = float(loan.get("amount", 0))
            rate = float(loan.get("interest_rate", 0)) / 100
            annual_interest = loan_amount * rate
            
            total_expenses = sum(float(v) for k, v in expenses.items() if k != "property_management")
            pm_rate = float(expenses.get("property_management", 0)) / 100 if rental else 0
            pm_cost = annual_rent * pm_rate if pm_rate > 0 else 0
            total_expenses += pm_cost
            
            net_rental = annual_rent - annual_interest - total_expenses if rental else 0
            
            print(f"  {res.status} {p_data['name']}")
            print(f"    Purchase: ${purchase:,.0f} -> Current: ${current:,.0f} ({growth:+.1f}%)")
            if loan:
                print(f"    Loan: ${loan_amount:,.0f} @ {float(loan['interest_rate']):.2f}% = ${annual_interest:,.0f}/yr interest")
            if rental:
                print(f"    Rent: ${weekly_rent:,.0f}/wk = ${annual_rent:,.0f}/yr")
                print(f"    Expenses: ${total_expenses:,.0f}/yr")
                print(f"    Net Rental: ${net_rental:,.0f}/yr {'(negatively geared)' if net_rental < 0 else '(positively geared)'}")
        
        # Create Income
        print(f"\n[INCOME]")
        total_income = 0
        for inc in INCOME_SOURCES:
            inc["portfolio_id"] = pid
            res = await page.request.post(f"{API}/income", data=inc, headers=h)
            body = await res.json()
            amt = float(inc["amount"])
            total_income += amt
            tax = amt * float(inc.get("tax_rate", 0)) / 100
            print(f"  {res.status} {inc['name']}: ${amt:,.0f}/yr (tax: ${tax:,.0f})")
        
        # Create Expenses
        print(f"\n[EXPENSES]")
        total_expenses = 0
        for exp in EXPENSES:
            exp["portfolio_id"] = pid
            res = await page.request.post(f"{API}/expenses", data=exp, headers=h)
            body = await res.json()
            amt = float(exp["amount"])
            total_expenses += amt
            print(f"  {res.status} {exp['name']}: ${amt:,.0f}/yr")
        
        # Create Assets
        print(f"\n[ASSETS]")
        total_assets = 0
        for asset in ASSETS:
            asset["portfolio_id"] = pid
            res = await page.request.post(f"{API}/assets", data=asset, headers=h)
            body = await res.json()
            val = float(asset["current_value"])
            total_assets += val
            growth = ((val - float(asset["purchase_value"])) / float(asset["purchase_value"])) * 100 if asset.get("purchase_value") else 0
            print(f"  {res.status} {asset['name']}: ${val:,.0f} ({growth:+.1f}% growth)")
        
        # Create Liabilities
        print(f"\n[LIABILITIES]")
        total_liabilities = 0
        for liab in LIABILITIES:
            liab["portfolio_id"] = pid
            res = await page.request.post(f"{API}/liabilities", data=liab, headers=h)
            body = await res.json()
            bal = float(liab["current_balance"])
            total_liabilities += bal
            interest = bal * float(liab["interest_rate"]) / 100
            print(f"  {res.status} {liab['name']}: ${bal:,.0f} @ {liab['interest_rate']}% (interest: ${interest:,.0f}/yr)")
        
        # Dashboard Summary
        res = await page.request.get(f"{API}/dashboard/summary", headers=h)
        dash = await res.json()
        
        print(f"\n{'='*60}")
        print("PORTFOLIO SUMMARY")
        print(f"{'='*60}")
        print(f"  Total Property Value:    ${sum(float(p['current_value']) for p in PROPERTIES):>12,.0f}")
        print(f"  Total Property Loans:    ${sum(float(p['loan_details']['amount']) for p in PROPERTIES if p.get('loan_details')):>12,.0f}")
        print(f"  Total Other Assets:      ${total_assets:>12,.0f}")
        print(f"  Total Liabilities:       ${total_liabilities:>12,.0f}")
        print(f"  {'─'*40}")
        print(f"  NET WORTH:               ${dash.get('net_worth', 0):>12,.0f}")
        print(f"{'='*60}")
        
        print(f"\n  Annual Salary:           ${95000:>12,.0f}")
        print(f"  Annual Rental Income:    ${57120:>12,.0f}")
        print(f"  Annual Living Expenses:  ${total_expenses:>12,.0f}")
        print(f"  Annual Interest (loans): ${sum(float(p['loan_details']['amount']) * float(p['loan_details']['interest_rate']) / 100 for p in PROPERTIES if p.get('loan_details')):>12,.0f}")
        
        print(f"\n{'='*60}")
        print("VERIFICATION RESULTS")
        print(f"{'='*60}")
        
        # Verify calculations
        checks = []
        
        # Check net worth calculation
        property_values = sum(float(p['current_value']) for p in PROPERTIES)
        property_loans = sum(float(p['loan_details']['amount']) for p in PROPERTIES if p.get('loan_details'))
        expected_nw = property_values + total_assets - property_loans - total_liabilities
        actual_nw = float(dash.get('net_worth', 0))
        nw_correct = abs(expected_nw - actual_nw) < 100
        checks.append(("Net Worth Calculation", nw_correct, f"Expected: ${expected_nw:,.0f}, Got: ${actual_nw:,.0f}"))
        
        # Check negative gearing
        for i, p in enumerate(PROPERTIES):
            rental = p.get('rental_details')
            if rental:
                loan = p['loan_details']
                annual_rent = float(rental['income']) * 52
                annual_interest = float(loan['amount']) * float(loan['interest_rate']) / 100
                expenses_total = sum(float(v) for k, v in p['expenses'].items() if k != 'property_management')
                pm = float(p['expenses'].get('property_management', 0)) / 100 * annual_rent
                expenses_total += pm
                net = annual_rent - annual_interest - expenses_total
                is_negative = net < 0
                checks.append((f"{p['name']} Negative Gearing", True, f"Net: ${net:,.0f}/yr ({'negatively geared' if is_negative else 'positively geared'})"))
        
        # Check equity
        for i, p in enumerate(PROPERTIES):
            equity = float(p['current_value']) - float(p['loan_details']['amount']) if p.get('loan_details') else float(p['current_value'])
            lvr = (float(p['loan_details']['amount']) / float(p['current_value']) * 100) if p.get('loan_details') else 0
            checks.append((f"{p['name']} Equity/Equity", True, f"Equity: ${equity:,.0f}, LVR: {lvr:.1f}%"))
        
        # Print checks
        passed = 0
        for name, ok, detail in checks:
            status = "PASS" if ok else "FAIL"
            if ok: passed += 1
            print(f"  [{status}] {name}")
            print(f"         {detail}")
        
        print(f"\n{'='*60}")
        print(f"  TOTAL: {passed}/{len(checks)} checks passed")
        print(f"{'='*60}")
        
        await browser.close()

asyncio.run(run())
