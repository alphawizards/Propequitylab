"""
Clerk webhook handler.

Processes user lifecycle events from Clerk to keep the local database in sync.
Idempotency is enforced via the WebhookEvent table.

Required env vars:
    CLERK_WEBHOOK_SECRET: Signing secret from Clerk Dashboard -> Webhooks
"""

import logging
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from models.user import User
from models.webhook_event import WebhookEvent
from utils.database_sql import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks/clerk", tags=["webhooks"])

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")


def _verify_clerk_webhook(
    request_body: bytes,
    svix_id: str,
    svix_timestamp: str,
    svix_signature: str,
) -> bool:
    """
    Verify Clerk webhook signature using svix.

    Returns True if signature is valid. Raises HTTPException on invalid signature.
    """
    try:
        from svix.webhooks import Webhook, WebhookVerificationError

        wh = Webhook(CLERK_WEBHOOK_SECRET)
        wh.verify(
            request_body,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
        return True
    except WebhookVerificationError:
        logger.warning("Clerk webhook signature verification failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )


@router.post("/")
async def handle_clerk_webhook(
    request: Request,
    session: Session = Depends(get_session),
):
    """
    Handle incoming Clerk webhook events.

    Supported events:
    - user.created: Sync new user to local DB (usually already created by
      get_current_user on first sign-in)
    - user.updated: Sync email/name changes
    - user.deleted: Soft-delete local user
    """
    # Read raw body for signature verification
    body = await request.body()

    # Verify signature - required, not optional
    if not CLERK_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Webhook service unavailable: signing secret not configured",
        )
    svix_id = request.headers.get("svix-id", "")
    svix_timestamp = request.headers.get("svix-timestamp", "")
    svix_signature = request.headers.get("svix-signature", "")
    _verify_clerk_webhook(body, svix_id, svix_timestamp, svix_signature)

    payload = await request.json()
    event_type: str = payload.get("type", "")
    event_id: str = payload.get("id", "")

    if not event_id or not event_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing event id or type",
        )

    # Idempotency check
    existing = session.exec(
        select(WebhookEvent).where(WebhookEvent.provider_event_id == event_id)
    ).first()
    if existing and existing.processed:
        logger.info("Duplicate Clerk webhook event %s — skipping", event_id)
        return {"status": "already_processed"}

    # Record event
    webhook_event = existing or WebhookEvent(
        provider="clerk",
        provider_event_id=event_id,
        event_type=event_type,
        payload=payload,
    )
    session.add(webhook_event)
    session.commit()

    # Process event
    data = payload.get("data", {})
    clerk_user_id: str = data.get("id", "")

    if event_type == "user.created":
        _handle_user_created(session, clerk_user_id, data)

    elif event_type == "user.updated":
        _handle_user_updated(session, clerk_user_id, data)

    elif event_type == "user.deleted":
        _handle_user_deleted(session, clerk_user_id)

    # Mark as processed
    webhook_event.processed = True
    session.add(webhook_event)
    session.commit()

    return {"status": "ok", "event_type": event_type}


def _handle_user_created(session: Session, clerk_user_id: str, data: dict) -> None:
    """Ensure local user record exists for a newly created Clerk user."""
    if not clerk_user_id:
        return

    existing = session.exec(
        select(User).where(User.clerk_user_id == clerk_user_id)
    ).first()
    if existing:
        return  # Already provisioned (e.g., by get_current_user on first sign-in)

    # Get primary email
    email_addresses = data.get("email_addresses", [])
    primary_email_id = data.get("primary_email_address_id")
    email = ""
    for ea in email_addresses:
        if ea.get("id") == primary_email_id:
            email = ea.get("email_address", "")
            break

    first_name = data.get("first_name") or ""
    last_name = data.get("last_name") or ""
    name = f"{first_name} {last_name}".strip() or email.split("@")[0]

    # Try to link existing user by email first (soft migration)
    user: Optional[User] = (
        session.exec(select(User).where(User.email == email)).first() if email else None
    )
    if user:
        from datetime import datetime, timezone

        user.clerk_user_id = clerk_user_id
        user.updated_at = datetime.now(timezone.utc)
        session.add(user)
        session.commit()
        logger.info(
            "Linked existing user %s to Clerk ID %s via webhook", user.id, clerk_user_id
        )
    else:
        # Provision new user
        from utils.clerk_auth import _provision_user

        _provision_user(session, clerk_user_id, email, name)


def _handle_user_updated(session: Session, clerk_user_id: str, data: dict) -> None:
    """Sync email and name changes from Clerk to local user record."""
    if not clerk_user_id:
        return

    user = session.exec(
        select(User).where(User.clerk_user_id == clerk_user_id)
    ).first()
    if not user:
        return

    from datetime import datetime, timezone

    # Sync primary email
    email_addresses = data.get("email_addresses", [])
    primary_email_id = data.get("primary_email_address_id")
    for ea in email_addresses:
        if ea.get("id") == primary_email_id:
            new_email = ea.get("email_address", "")
            if new_email and new_email != user.email:
                user.email = new_email

    # Sync name
    first_name = data.get("first_name") or ""
    last_name = data.get("last_name") or ""
    new_name = f"{first_name} {last_name}".strip()
    if new_name and new_name != user.name:
        user.name = new_name

    user.updated_at = datetime.now(timezone.utc)
    session.add(user)
    session.commit()
    logger.info("Synced user %s from Clerk update webhook", user.id)


def _handle_user_deleted(session: Session, clerk_user_id: str) -> None:
    """Soft-delete local user when Clerk user is deleted."""
    if not clerk_user_id:
        return

    user = session.exec(
        select(User).where(User.clerk_user_id == clerk_user_id)
    ).first()
    if not user:
        return

    from datetime import datetime, timezone

    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    session.add(user)
    session.commit()
    logger.info("Soft-deleted user %s via Clerk delete webhook", user.id)
