"""
Shared utility for verifying user access to a property.
Used by loans.py and valuations.py to avoid duplication.
"""

from fastapi import HTTPException, status
from sqlmodel import Session, select

from models.property import Property


def verify_property_access(property_id: str, user_id: str, session: Session) -> Property:
    """Verify the user owns the given property and return it.

    Raises HTTP 404 (not 403) to avoid leaking whether the property exists.
    """
    property_obj = session.exec(
        select(Property).where(
            Property.id == property_id,
            Property.user_id == user_id,
        )
    ).first()

    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found or you don't have access",
        )

    return property_obj
