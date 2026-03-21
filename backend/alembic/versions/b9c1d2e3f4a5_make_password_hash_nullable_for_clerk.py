"""make_password_hash_nullable_for_clerk

Revision ID: b9c1d2e3f4a5
Revises: a1b2c3d4e5f6
Create Date: 2026-03-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'b9c1d2e3f4a5'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make password_hash nullable to support Clerk-authenticated users
    # who have no local password.
    op.alter_column(
        'users',
        'password_hash',
        existing_type=sqlmodel.sql.sqltypes.AutoString(length=255),
        nullable=True,
    )

    # Change is_verified server default to TRUE — Clerk verifies emails,
    # so new Clerk users are verified from the moment they are created.
    op.alter_column(
        'users',
        'is_verified',
        existing_type=sa.Boolean(),
        server_default=sa.text('true'),
        existing_nullable=False,
    )


def downgrade() -> None:
    # Revert is_verified server default to FALSE (original behaviour)
    op.alter_column(
        'users',
        'is_verified',
        existing_type=sa.Boolean(),
        server_default=sa.text('false'),
        existing_nullable=False,
    )

    # Revert password_hash to NOT NULL.
    # WARNING: this will fail if any rows have NULL password_hash.
    # Backfill with a placeholder before running downgrade if needed.
    op.alter_column(
        'users',
        'password_hash',
        existing_type=sqlmodel.sql.sqltypes.AutoString(length=255),
        nullable=False,
    )
