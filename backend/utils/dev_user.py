"""Dev Mode User Utility

Provides a hardcoded user ID for development mode.
All database operations use this ID to future-proof for authentication.
"""
from datetime import datetime, timezone
from utils.database import db

# Hardcoded dev user ID - used throughout the app in dev mode
DEV_USER_ID = "dev-user-01"

# Default dev user data
DEV_USER_DATA = {
    "id": DEV_USER_ID,
    "email": "dev@propequitylab.local",
    "name": "Dev User",
    "date_of_birth": "1990-01-15",
    "planning_type": "individual",
    "country": "Australia",
    "state": "NSW",
    "currency": "AUD",
    "partner_details": None,
    "onboarding_completed": False,
    "onboarding_step": 0,
    "subscription_tier": "pro",
    "created_at": datetime.now(timezone.utc).isoformat(),
    "updated_at": datetime.now(timezone.utc).isoformat()
}


async def get_or_create_dev_user():
    """Get the dev user, creating if it doesn't exist"""
    user = await db.users.find_one({"id": DEV_USER_ID}, {"_id": 0})
    
    if not user:
        await db.users.insert_one(DEV_USER_DATA.copy())
        user = DEV_USER_DATA.copy()
    
    return user


async def reset_dev_user():
    """Reset the dev user to default state"""
    await db.users.delete_one({"id": DEV_USER_ID})
    await db.users.insert_one(DEV_USER_DATA.copy())
    return DEV_USER_DATA.copy()
