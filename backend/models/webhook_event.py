"""WebhookEvent model — idempotency log for Clerk and Stripe webhooks."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class WebhookEvent(SQLModel, table=True):
    __tablename__ = "webhook_events"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=50
    )
    provider: str = Field(max_length=50)  # "clerk" or "stripe"
    provider_event_id: str = Field(unique=True, index=True, max_length=255)
    event_type: str = Field(max_length=255)
    payload: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    processed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WebhookEventResponse(SQLModel):
    id: str
    provider: str
    provider_event_id: str
    event_type: str
    processed: bool
    created_at: datetime
