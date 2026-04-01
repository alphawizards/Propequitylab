"""Account model — represents a billable workspace/household."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Account(SQLModel, table=True):
    __tablename__ = "accounts"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=50
    )
    name: str = Field(max_length=255)
    owner_user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AccountCreate(SQLModel):
    name: str


class AccountUpdate(SQLModel):
    name: Optional[str] = None


class AccountResponse(SQLModel):
    id: str
    name: str
    owner_user_id: str
    created_at: datetime
    updated_at: datetime
