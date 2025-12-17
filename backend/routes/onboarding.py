from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from models.user import User, UserUpdate
from utils.database import db
from utils.dev_user import DEV_USER_ID, get_or_create_dev_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class OnboardingStatus(BaseModel):
    completed: bool
    current_step: int
    total_steps: int = 8
    user: Optional[Dict[str, Any]] = None


class OnboardingStepData(BaseModel):
    step: int
    data: Dict[str, Any]


@router.get("/status", response_model=OnboardingStatus)
async def get_onboarding_status():
    """Get the current onboarding status"""
    user = await get_or_create_dev_user()
    
    return OnboardingStatus(
        completed=user.get('onboarding_completed', False),
        current_step=user.get('onboarding_step', 0),
        user=user
    )


@router.put("/step/{step}")
async def save_onboarding_step(step: int, data: OnboardingStepData):
    """Save data for a specific onboarding step"""
    user = await db.users.find_one({"id": DEV_USER_ID})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Map step to user fields
    update_fields = {}
    
    if step == 1:  # About You
        if 'name' in data.data:
            update_fields['name'] = data.data['name']
        if 'date_of_birth' in data.data:
            update_fields['date_of_birth'] = data.data['date_of_birth']
        if 'planning_type' in data.data:
            update_fields['planning_type'] = data.data['planning_type']
        if 'country' in data.data:
            update_fields['country'] = data.data['country']
        if 'state' in data.data:
            update_fields['state'] = data.data['state']
        if 'partner_details' in data.data:
            update_fields['partner_details'] = data.data['partner_details']
    
    # Update step progress
    update_fields['onboarding_step'] = max(step, user.get('onboarding_step', 0))
    update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": DEV_USER_ID},
        {"$set": update_fields}
    )
    
    return {"message": f"Step {step} saved successfully", "data": update_fields}


@router.post("/complete")
async def complete_onboarding():
    """Mark onboarding as completed"""
    result = await db.users.update_one(
        {"id": DEV_USER_ID},
        {"$set": {
            "onboarding_completed": True,
            "onboarding_step": 8,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Onboarding completed successfully"}


@router.post("/skip")
async def skip_onboarding():
    """Skip onboarding and go directly to dashboard"""
    result = await db.users.update_one(
        {"id": DEV_USER_ID},
        {"$set": {
            "onboarding_completed": True,
            "onboarding_step": -1,  # -1 indicates skipped
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Onboarding skipped"}


@router.post("/reset")
async def reset_onboarding():
    """Reset onboarding to start fresh"""
    await db.users.update_one(
        {"id": DEV_USER_ID},
        {"$set": {
            "onboarding_completed": False,
            "onboarding_step": 0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Onboarding reset successfully"}
