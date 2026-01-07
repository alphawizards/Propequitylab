"""
Onboarding Routes - SQL-Based with Authentication & Data Isolation
⚠️ CRITICAL: All queries include .where(User.id == current_user.id) for data isolation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from models.user import User
from utils.database_sql import get_session
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


class OnboardingStatus(BaseModel):
    completed: bool
    current_step: int
    total_steps: int = 8
    user: Optional[Dict[str, Any]] = None


class OnboardingStepData(BaseModel):
    step: int
    data: Dict[str, Any]


@router.get("/status", response_model=OnboardingStatus)
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the current onboarding status
    
    ⚠️ Data Isolation: Returns status for the authenticated user only
    """
    # User is already authenticated via get_current_user
    # Convert user to dict for response
    user_dict = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "onboarding_completed": current_user.onboarding_completed if hasattr(current_user, 'onboarding_completed') else False,
        "onboarding_step": current_user.onboarding_step if hasattr(current_user, 'onboarding_step') else 0
    }
    
    return OnboardingStatus(
        completed=user_dict.get('onboarding_completed', False),
        current_step=user_dict.get('onboarding_step', 0),
        user=user_dict
    )


@router.put("/step/{step}")
async def save_onboarding_step(
    step: int,
    data: OnboardingStepData,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Save data for a specific onboarding step
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Map step to user fields
    update_fields = {}
    
    if step == 1:  # About You
        if 'name' in data.data:
            user.name = data.data['name']
            update_fields['name'] = data.data['name']
        if 'date_of_birth' in data.data and hasattr(user, 'date_of_birth'):
            user.date_of_birth = data.data['date_of_birth']
            update_fields['date_of_birth'] = data.data['date_of_birth']
        if 'planning_type' in data.data and hasattr(user, 'planning_type'):
            user.planning_type = data.data['planning_type']
            update_fields['planning_type'] = data.data['planning_type']
        if 'country' in data.data and hasattr(user, 'country'):
            user.country = data.data['country']
            update_fields['country'] = data.data['country']
        if 'state' in data.data and hasattr(user, 'state'):
            user.state = data.data['state']
            update_fields['state'] = data.data['state']
        if 'partner_details' in data.data and hasattr(user, 'partner_details'):
            user.partner_details = data.data['partner_details']
            update_fields['partner_details'] = data.data['partner_details']
    
    # Update step progress
    current_step = getattr(user, 'onboarding_step', 0) or 0
    new_step = max(step, current_step)
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = new_step
    update_fields['onboarding_step'] = new_step
    
    user.updated_at = datetime.utcnow()
    
    # CORRECT WRITE FLOW: add -> commit -> refresh
    session.add(user)
    session.commit()
    session.refresh(user)
    
    logger.info(f"Onboarding step {step} saved for user: {current_user.id}")
    return {"message": f"Step {step} saved successfully", "data": update_fields}


@router.post("/complete")
async def complete_onboarding(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark onboarding as completed
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = True
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = 8
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    logger.info(f"Onboarding completed for user: {current_user.id}")
    return {"message": "Onboarding completed successfully"}


@router.post("/skip")
async def skip_onboarding(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Skip onboarding and go directly to dashboard
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = True
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = -1  # -1 indicates skipped
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info(f"Onboarding skipped for user: {current_user.id}")
    return {"message": "Onboarding skipped"}


@router.post("/reset")
async def reset_onboarding(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Reset onboarding to start fresh
    
    ⚠️ Data Isolation: Only updates the authenticated user's record
    """
    # Get fresh user from session
    statement = select(User).where(User.id == current_user.id)
    user = session.exec(statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if hasattr(user, 'onboarding_completed'):
        user.onboarding_completed = False
    if hasattr(user, 'onboarding_step'):
        user.onboarding_step = 0
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info(f"Onboarding reset for user: {current_user.id}")
    return {"message": "Onboarding reset successfully"}
