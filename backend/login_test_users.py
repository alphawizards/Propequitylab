"""
Login test users and save their tokens
"""
import json
import requests

BASE_URL = "http://localhost:8000"

test_users = [
    {
        "email": "free@test.propequitylab.com",
        "password": "TestPass123!",
        "role": "Free"
    },
    {
        "email": "premium@test.propequitylab.com",
        "password": "TestPass123!",
        "role": "Premium"
    },
    {
        "email": "pro@test.propequitylab.com",
        "password": "TestPass123!",
        "role": "Pro"
    }
]

tokens = []

for user in test_users:
    print(f"\nLogging in {user['role']} user ({user['email']})...")

    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": user["email"], "password": user["password"]}
    )

    if response.status_code == 200:
        data = response.json()
        tokens.append({
            "role": user["role"],
            "email": user["email"],
            "user_id": data["user"]["id"],
            "access_token": data["access_token"],
            "refresh_token": data["refresh_token"],
            "user": data["user"]
        })
        print(f"  [OK] Logged in successfully")
        print(f"  User ID: {data['user']['id']}")
    else:
        print(f"  [ERROR] Login failed: {response.text}")

# Save tokens to file
with open("test_user_tokens.json", "w") as f:
    json.dump(tokens, f, indent=2)

print(f"\n[SUCCESS] Saved tokens for {len(tokens)} users to test_user_tokens.json")

# Print summary
print("\n=== SUMMARY ===")
for token in tokens:
    print(f"{token['role']} User:")
    print(f"  ID: {token['user_id']}")
    print(f"  Email: {token['email']}")
    print(f"  Token: {token['access_token'][:50]}...")
