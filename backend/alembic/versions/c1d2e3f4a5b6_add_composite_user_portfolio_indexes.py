"""add composite user_id portfolio_id indexes

Revision ID: c1d2e3f4a5b6
Revises: b9c1d2e3f4a5
Create Date: 2026-04-01

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, None] = 'b9c1d2e3f4a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_TABLES = [
    'assets',
    'expenses',
    'income_sources',
    'liabilities',
    'net_worth_snapshots',
    'plans',
    'properties',
]


def upgrade() -> None:
    for table in _TABLES:
        op.create_index(
            f'ix_{table}_user_portfolio',
            table,
            ['user_id', 'portfolio_id'],
        )


def downgrade() -> None:
    for table in reversed(_TABLES):
        op.drop_index(
            f'ix_{table}_user_portfolio',
            table_name=table,
        )
