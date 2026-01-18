"""
Quick script to verify test users for development
"""
import os
import sys
from sqlmodel import Session, select

# Add parent directory to path to import models
sys.path.insert(0, os.path.dirname(__file__))

from models.user import User
from utils.database_sql import engine

def verify_test_users():
    """Mark test users as verified"""
    test_emails = [
        'free@test.propequitylab.com',
        'premium@test.propequitylab.com',
        'pro@test.propequitylab.com'
    ]

    with Session(engine) as session:
        for email in test_emails:
            user = session.exec(select(User).where(User.email == email)).first()
            if user:
                user.is_verified = True
                session.add(user)
                print(f"[OK] Verified: {email}")
            else:
                print(f"[ERROR] Not found: {email}")

        session.commit()
        print("\n[SUCCESS] All test users verified!")

if __name__ == "__main__":
    verify_test_users()
