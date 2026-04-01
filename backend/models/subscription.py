"""Subscription model — mirrors Stripe subscription state per account."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Subscription(SQLModel, table=True):
    __tablename__ = "subscriptions"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=50
    )
    account_id: str = Field(foreign_key="accounts.id", index=True, max_length=50)
    provider: str = Field(default="stripe", max_length=50)
    stripe_subscription_id: Optional[str] = Field(default=None, unique=True, max_length=255)
    stripe_customer_id: Optional[str] = Field(default=None, max_length=255)
    plan_key: str = Field(default="free", max_length=50)  # free, pro, enterprise
    status: str = Field(default="active", max_length=50)
    current_period_start: Optional[datetime] = Field(default=None)
    current_period_end: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SubscriptionCreate(SQLModel):
    account_id: str
    plan_key: str = "free"


class SubscriptionUpdate(SQLModel):
    plan_key: Optional[str] = None
    status: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None


class SubscriptionResponse(SQLModel):
    id: str
    account_id: str
    provider: str
    stripe_subscription_id: Optional[str]
    stripe_customer_id: Optional[str]
    plan_key: str
    status: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    created_at: datetime
    updated_at: datetime
