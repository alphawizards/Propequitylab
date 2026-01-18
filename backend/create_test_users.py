"""
Create test users for PropEquityLab
"""
import requests
import json

API_BASE = "http://127.0.0.1:8000/api"

users_to_create = [
    {
        "email": "free@test.propequitylab.com",
        "password": "TestPass123!",
        "name": "Free Tier User"
    },
    {
        "email": "premium@test.propequitylab.com",
        "password": "TestPass123!",
        "name": "Premium Tier User"
    },
    {
        "email": "pro@test.propequitylab.com",
        "password": "TestPass123!",
        "name": "Pro Tier User"
    }
]

created_users = []

print("Creating test users...")
print("=" * 60)

for user_data in users_to_create:
    print(f"\nCreating user: {user_data['email']}")

    try:
        response = requests.post(
            f"{API_BASE}/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            data = response.json()
            created_users.append({
                "email": user_data["email"],
                "user_id": data.get("user", {}).get("id"),
                "access_token": data.get("access_token"),
                "name": user_data["name"]
            })
            print(f"  [SUCCESS] User created")
            print(f"    User ID: {data.get('user', {}).get('id')}")
            print(f"    Token: {data.get('access_token')[:50]}...")
        else:
            print(f"  [FAILED] {response.status_code}")
            print(f"    Error: {response.json()}")

    except Exception as e:
        print(f"  [ERROR] {e}")

print("\n" + "=" * 60)
print(f"\nCreated {len(created_users)} users successfully")

# Save tokens to file for later use
with open("test_user_tokens.json", "w") as f:
    json.dump(created_users, f, indent=2)

print("Tokens saved to test_user_tokens.json")
