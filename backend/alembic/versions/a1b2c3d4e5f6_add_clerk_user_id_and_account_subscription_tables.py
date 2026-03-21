"""add_clerk_user_id_and_account_subscription_tables

Revision ID: a1b2c3d4e5f6
Revises: 3dae219f0164
Create Date: 2026-03-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '3dae219f0164'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Schema migrations ---

    # Add clerk_user_id to users table (Clerk integration field)
    op.add_column(
        'users',
        sa.Column('clerk_user_id', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True)
    )
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)

    # Create accounts table (billable workspace per user/household)
    op.create_table(
        'accounts',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('owner_user_id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_accounts_owner_user_id'), 'accounts', ['owner_user_id'], unique=False)

    # Create account_memberships table (user-to-account with roles)
    op.create_table(
        'account_memberships',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('account_id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_account_memberships_account_id'), 'account_memberships', ['account_id'], unique=False)
    op.create_index(op.f('ix_account_memberships_user_id'), 'account_memberships', ['user_id'], unique=False)

    # Create subscriptions table (mirrors Stripe subscription state per account)
    op.create_table(
        'subscriptions',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('account_id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('provider', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('stripe_subscription_id', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('stripe_customer_id', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('plan_key', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('current_period_start', sa.DateTime(), nullable=True),
        sa.Column('current_period_end', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stripe_subscription_id'),
    )
    op.create_index(op.f('ix_subscriptions_account_id'), 'subscriptions', ['account_id'], unique=False)

    # Create webhook_events table (idempotency log for Clerk and Stripe webhooks)
    op.create_table(
        'webhook_events',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('provider', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('provider_event_id', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('event_type', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=True),
        sa.Column('processed', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_webhook_events_provider_event_id'), 'webhook_events', ['provider_event_id'], unique=True)

    # --- Data migration: backfill accounts for all existing users ---

    # Create one Account per existing user (named "<user name>'s Account")
    op.execute("""
        INSERT INTO accounts (id, name, owner_user_id, created_at, updated_at)
        SELECT
            gen_random_uuid()::text,
            name || '''s Account',
            id,
            NOW(),
            NOW()
        FROM users
        WHERE id NOT IN (SELECT owner_user_id FROM accounts)
    """)

    # Create owner AccountMembership for each newly created account
    op.execute("""
        INSERT INTO account_memberships (id, account_id, user_id, role, status, created_at, updated_at)
        SELECT
            gen_random_uuid()::text,
            a.id,
            u.id,
            'owner',
            'active',
            NOW(),
            NOW()
        FROM users u
        JOIN accounts a ON a.owner_user_id = u.id
        WHERE u.id NOT IN (SELECT user_id FROM account_memberships)
    """)

    # Create one Subscription per account, seeded from the user's existing subscription_tier
    op.execute("""
        INSERT INTO subscriptions (id, account_id, provider, plan_key, status, created_at, updated_at)
        SELECT
            gen_random_uuid()::text,
            a.id,
            'stripe',
            u.subscription_tier,
            'active',
            NOW(),
            NOW()
        FROM users u
        JOIN accounts a ON a.owner_user_id = u.id
        WHERE a.id NOT IN (SELECT account_id FROM subscriptions)
    """)


def downgrade() -> None:
    # Drop data first (cascade removes rows from dependent tables)
    op.execute("DELETE FROM subscriptions")
    op.execute("DELETE FROM account_memberships")
    op.execute("DELETE FROM accounts")

    # Drop tables in reverse dependency order
    op.drop_index(op.f('ix_webhook_events_provider_event_id'), table_name='webhook_events')
    op.drop_table('webhook_events')

    op.drop_index(op.f('ix_subscriptions_account_id'), table_name='subscriptions')
    op.drop_table('subscriptions')

    op.drop_index(op.f('ix_account_memberships_user_id'), table_name='account_memberships')
    op.drop_index(op.f('ix_account_memberships_account_id'), table_name='account_memberships')
    op.drop_table('account_memberships')

    op.drop_index(op.f('ix_accounts_owner_user_id'), table_name='accounts')
    op.drop_table('accounts')

    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_column('users', 'clerk_user_id')
