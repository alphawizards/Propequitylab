#!/usr/bin/env python3
"""
Backend Setup Verification Script
Run this to verify all backend components are properly configured
"""

import os
import sys
from typing import List, Tuple

def check_env_var(name: str, required: bool = True) -> Tuple[bool, str]:
    """Check if an environment variable is set"""
    value = os.getenv(name)

    if not value:
        if required:
            return False, f"❌ CRITICAL: {name} is not set"
        else:
            return True, f"⚠️  OPTIONAL: {name} is not set (may be okay)"
    else:
        # Mask sensitive values
        if any(secret in name.lower() for secret in ['key', 'secret', 'password', 'token']):
            masked = value[:8] + "..." if len(value) > 8 else "***"
            return True, f"✅ {name} = {masked}"
        else:
            return True, f"✅ {name} = {value}"

def check_database_connection():
    """Test database connection"""
    try:
        from utils.database_sql import test_connection, get_connection_info

        print("\n" + "="*60)
        print("DATABASE CONNECTION TEST")
        print("="*60)

        # Show connection info
        info = get_connection_info()
        print(f"\nConnection Info:")
        print(f"  Host: {info['database_url']}")
        print(f"  Pool Size: {info['pool_size']}")
        print(f"  Max Overflow: {info['max_overflow']}")

        # Test connection
        print(f"\nTesting connection...")
        if test_connection():
            return True, "✅ Database connection successful"
        else:
            return False, "❌ Database connection failed"

    except Exception as e:
        return False, f"❌ Database connection error: {str(e)}"

def check_tables_exist():
    """Check if database tables exist"""
    try:
        from sqlmodel import Session, select, text
        from utils.database_sql import engine
        from models.user import User

        print("\n" + "="*60)
        print("DATABASE TABLES CHECK")
        print("="*60)

        with Session(engine) as session:
            # Check if user table exists
            try:
                result = session.exec(text("SELECT COUNT(*) FROM \"user\"")).first()
                user_count = result if result else 0
                print(f"✅ 'user' table exists ({user_count} users)")

                # Try to query users to verify structure
                users = session.exec(select(User)).all()
                print(f"✅ User table structure is valid")

                return True, f"✅ Database tables exist and are valid"

            except Exception as e:
                return False, f"❌ Database tables missing or invalid: {str(e)}"

    except Exception as e:
        return False, f"❌ Table check error: {str(e)}"

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\n" + "="*60)
    print("DEPENDENCIES CHECK")
    print("="*60)

    required_packages = [
        ('fastapi', 'FastAPI web framework'),
        ('sqlmodel', 'SQLModel ORM'),
        ('passlib', 'Password hashing'),
        ('jose', 'JWT token handling'),
        ('uvicorn', 'ASGI server'),
    ]

    missing = []

    for package, description in required_packages:
        try:
            __import__(package)
            print(f"✅ {package:15s} - {description}")
        except ImportError:
            print(f"❌ {package:15s} - {description} (MISSING)")
            missing.append(package)

    if missing:
        return False, f"❌ Missing packages: {', '.join(missing)}"
    else:
        return True, "✅ All required dependencies installed"

def check_user_model():
    """Verify User model structure"""
    try:
        from models.user import User

        print("\n" + "="*60)
        print("USER MODEL CHECK")
        print("="*60)

        # Get all fields
        fields = User.__fields__.keys()
        required_fields = [
            'id', 'email', 'password_hash', 'name', 'is_verified',
            'verification_token', 'created_at', 'updated_at'
        ]

        missing_fields = [f for f in required_fields if f not in fields]

        if missing_fields:
            return False, f"❌ User model missing fields: {', '.join(missing_fields)}"

        print(f"✅ User model has all required fields")
        print(f"   Total fields: {len(fields)}")

        return True, "✅ User model is valid"

    except Exception as e:
        return False, f"❌ User model error: {str(e)}"

def create_test_user():
    """Create a test user for login testing"""
    try:
        from sqlmodel import Session, select
        from utils.database_sql import engine
        from utils.auth import hash_password
        from models.user import User
        from datetime import datetime
        import uuid

        print("\n" + "="*60)
        print("TEST USER CREATION")
        print("="*60)

        test_email = "test@propequitylab.com"
        test_password = "TestPassword123!"

        with Session(engine) as session:
            # Check if user already exists
            existing = session.exec(select(User).where(User.email == test_email)).first()

            if existing:
                print(f"ℹ️  Test user already exists: {test_email}")
                print(f"   User ID: {existing.id}")
                print(f"   Verified: {existing.is_verified}")
                return True, f"✅ Test user exists: {test_email}"

            # Create new test user
            user = User(
                id=str(uuid.uuid4()),
                email=test_email,
                password_hash=hash_password(test_password),
                name="Test User",
                is_verified=True,  # Bypass email verification
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            session.add(user)
            session.commit()
            session.refresh(user)

            print(f"✅ Created test user:")
            print(f"   Email: {test_email}")
            print(f"   Password: {test_password}")
            print(f"   User ID: {user.id}")

            return True, f"✅ Test user created: {test_email}"

    except Exception as e:
        return False, f"❌ Test user creation failed: {str(e)}"

def main():
    """Run all verification checks"""
    print("\n" + "="*60)
    print("PROPEQUITYLAB BACKEND VERIFICATION")
    print("="*60)
    print("\nThis script verifies your backend setup is correct.\n")

    results = []

    # 1. Environment Variables Check
    print("\n" + "="*60)
    print("ENVIRONMENT VARIABLES CHECK")
    print("="*60)

    env_vars = [
        ("DATABASE_URL", True),
        ("JWT_SECRET_KEY", True),
        ("CORS_ORIGINS", True),
        ("RESEND_API_KEY", False),
        ("REDIS_URL", False),
        ("ENABLE_EMAIL_VERIFICATION", False),
        ("ENABLE_RATE_LIMITING", False),
        ("FRONTEND_URL", False),
    ]

    all_env_ok = True
    for var_name, required in env_vars:
        ok, msg = check_env_var(var_name, required)
        print(msg)
        if not ok and required:
            all_env_ok = False

    results.append(("Environment Variables", all_env_ok))

    # 2. Dependencies Check
    ok, msg = check_dependencies()
    results.append(("Dependencies", ok))

    # 3. User Model Check
    ok, msg = check_user_model()
    results.append(("User Model", ok))
    print(msg)

    # 4. Database Connection Check
    ok, msg = check_database_connection()
    results.append(("Database Connection", ok))
    print(msg)

    # 5. Database Tables Check
    ok, msg = check_tables_exist()
    results.append(("Database Tables", ok))
    print(msg)

    # 6. Create Test User
    ok, msg = create_test_user()
    results.append(("Test User", ok))
    print(msg)

    # Summary
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)

    all_passed = True
    for check_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status:10s} - {check_name}")
        if not passed:
            all_passed = False

    print("\n" + "="*60)

    if all_passed:
        print("✅ ALL CHECKS PASSED!")
        print("\nYour backend is properly configured.")
        print("\nTest credentials:")
        print("  Email: test@propequitylab.com")
        print("  Password: TestPassword123!")
        print("\nYou can now test login from the frontend.")
        return 0
    else:
        print("❌ SOME CHECKS FAILED")
        print("\nPlease fix the issues above before deploying.")
        print("\nRefer to BACKEND_500_ERROR_DEBUG_GUIDE.md for help.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
