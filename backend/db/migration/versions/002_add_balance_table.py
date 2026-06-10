"""002_add_balance_table

Revision ID: a1b2c3d4e5f6
Revises: 43400c7f8071
Create Date: 2026-06-10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "a1b2c3d4e5f6"
down_revision = "43400c7f8071"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "balance",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), unique=True, nullable=False),
        sa.Column("balance", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("balance")
