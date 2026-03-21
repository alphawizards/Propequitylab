"""AccountMembership model — links users to accounts with roles."""

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class MemberRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class AccountMembership(SQLModel, table=True):
    __tablename__ = "account_memberships"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=50
    )
    account_id: str = Field(foreign_key="accounts.id", index=True, max_length=50)
    user_id: str = Field(foreign_key="users.id", index=True, max_length=50)
    role: str = Field(default="owner", max_length=50)
    status: str = Field(default="active", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AccountMembershipCreate(SQLModel):
    account_id: str
    user_id: str
    role: str = "owner"


class AccountMembershipUpdate(SQLModel):
    role: Optional[str] = None
    status: Optional[str] = None


class AccountMembershipResponse(SQLModel):
    id: str
    account_id: str
    user_id: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime
