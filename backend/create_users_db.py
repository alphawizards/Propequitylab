"""
Create test users directly in database
"""
from sqlmodel import Session, select
from models.user import User
from utils.auth import hash_password
from utils.database_sql import engine
import uuid

users_to_create = [
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

print("Creating test users in database...")
print("=" * 60)

with Session(engine) as session:
    for user_data in users_to_create:
        print(f"\nCreating user: {user_data['email']}")

        # Check if user exists
        existing = session.exec(
            select(User).where(User.email == user_data['email'])
        ).first()

        if existing:
            print(f"  [SKIP] User already exists")
            continue

        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email=user_data['email'],
            name=user_data['name'],
            password_hash=hash_password(user_data['password']),
            email_verified=True,
            onboarding_completed=False
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        print(f"  [SUCCESS] User created")
        print(f"    User ID: {user.id}")
        print(f"    Email: {user.email}")

print("\n" + "=" * 60)
print("Done!")
