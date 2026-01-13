"""
Add sample data for Free tier test user
"""
import json
import requests

BASE_URL = "http://localhost:8000"

# Load Free user token
with open("test_user_tokens_temp.json", "r") as f:
    tokens = json.load(f)
    free_user = tokens[0]

ACCESS_TOKEN = free_user["access_token"]
HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

print(f"Adding sample data for Free User: {free_user['email']}")
print(f"User ID: {free_user['user_id']}\n")

# 1. Create Portfolio: "My First Portfolio"
print("1. Creating portfolio...")
portfolio_data = {
    "name": "My First Portfolio",
    "description": "Getting started with property investment tracking"
}
response = requests.post(f"{BASE_URL}/api/api/portfolios", json=portfolio_data, headers=HEADERS)
if response.status_code in [200, 201]:
    portfolio = response.json()
    portfolio_id = portfolio["id"]
    print(f"   [OK] Portfolio created: {portfolio['name']} (ID: {portfolio_id})")
else:
    print(f"   [ERROR] Failed to create portfolio: {response.text}")
    exit(1)

# 2. Create Property: 123 Test St, Sydney NSW 2000 ($750,000)
print("\n2. Creating property...")
property_data = {
    "portfolio_id": portfolio_id,
    "address": "123 Test St",
    "suburb": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country": "Australia",
    "property_type": "House",
    "bedrooms": 3,
    "bathrooms": 2,
    "car_spaces": 1,
    "land_area": 450,
    "floor_area": 180,
    "purchase_price": 750000,
    "purchase_date": "2024-01-15",
    "current_value": 750000,
    "status": "Owned"
}
response = requests.post(f"{BASE_URL}/api/api/properties", json=property_data, headers=HEADERS)
if response.status_code in [200, 201]:
    property_obj = response.json()
    property_id = property_obj["id"]
    print(f"   [OK] Property created: {property_obj['address']}, {property_obj['suburb']} (ID: {property_id})")
else:
    print(f"   [ERROR] Failed to create property: {response.text}")
    exit(1)

# 3. Create Income: Salary $85,000/year
print("\n3. Creating income...")
income_data = {
    "source_name": "Salary",
    "amount": 85000,
    "frequency": "Annual",
    "category": "Employment",
    "is_recurring": True,
    "start_date": "2024-01-01"
}
response = requests.post(f"{BASE_URL}/api/api/income", json=income_data, headers=HEADERS)
if response.status_code in [200, 201]:
    income = response.json()
    print(f"   [OK] Income created: {income['source_name']} ${income['amount']}/{income['frequency']}")
else:
    print(f"   [ERROR] Failed to create income: {response.text}")
    # Continue anyway

# 4. Create Expense 1: Rent $2,000/month
print("\n4. Creating expense - Rent...")
expense_data_1 = {
    "description": "Rent",
    "amount": 2000,
    "frequency": "Monthly",
    "category": "Housing",
    "is_recurring": True,
    "start_date": "2024-01-01"
}
response = requests.post(f"{BASE_URL}/api/api/expenses", json=expense_data_1, headers=HEADERS)
if response.status_code in [200, 201]:
    expense1 = response.json()
    print(f"   [OK] Expense created: {expense1['description']} ${expense1['amount']}/{expense1['frequency']}")
else:
    print(f"   [ERROR] Failed to create expense: {response.text}")
    # Continue anyway

# 5. Create Expense 2: Utilities $200/month
print("\n5. Creating expense - Utilities...")
expense_data_2 = {
    "description": "Utilities",
    "amount": 200,
    "frequency": "Monthly",
    "category": "Housing",
    "is_recurring": True,
    "start_date": "2024-01-01"
}
response = requests.post(f"{BASE_URL}/api/api/expenses", json=expense_data_2, headers=HEADERS)
if response.status_code in [200, 201]:
    expense2 = response.json()
    print(f"   [OK] Expense created: {expense2['description']} ${expense2['amount']}/{expense2['frequency']}")
else:
    print(f"   [ERROR] Failed to create expense: {response.text}")
    # Continue anyway

print("\n" + "="*60)
print("[SUCCESS] Free user sample data created!")
print("="*60)
print(f"\nPortfolio: My First Portfolio (ID: {portfolio_id})")
print(f"Property:  123 Test St, Sydney NSW 2000 ($750,000)")
print(f"Income:    Salary $85,000/year")
print(f"Expenses:  Rent $2,000/month, Utilities $200/month")
