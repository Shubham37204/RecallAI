"""add_users_table_and_fk

Revision ID: a1b2c3d4e5f6
Revises: 680bc773a04b
Create Date: 2026-06-16

Two steps:
    1. Create users table
    2. Backfill users from existing bookmarks (safe — idempotent)
    3. Add FK constraint bookmarks.user_id → users.id
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "680bc773a04b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create users table ─────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # ── 2. Backfill users from existing bookmarks ─────────────────────────────
    # Insert one user row per distinct user_id already in bookmarks.
    # on conflict do nothing = safe to run multiple times.
    op.execute("""
        INSERT INTO users (id)
        SELECT DISTINCT user_id FROM bookmarks
        ON CONFLICT (id) DO NOTHING
    """)

    # ── 3. Add FK constraint ──────────────────────────────────────────────────
    op.create_foreign_key(
        constraint_name="fk_bookmarks_user_id",
        source_table="bookmarks",
        referent_table="users",
        local_cols=["user_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    # Drop FK first, then table
    op.drop_constraint("fk_bookmarks_user_id", "bookmarks", type_="foreignkey")
    op.drop_table("users")
    