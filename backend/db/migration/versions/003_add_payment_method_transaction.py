"""003_add_payment_method_transaction

Revision ID: b2c3d4e5f6a1
Revises: a1b2c3d4e5f6
Create Date: 2026-06-11
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "b2c3d4e5f6a1"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "payment_method",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(), unique=True, nullable=False),
    )
    op.create_table(
        "transaction",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("payment_method_id", sa.Integer(), sa.ForeignKey("payment_method.id"), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("txid", sa.String(), unique=True, nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("transaction")
    op.drop_table("payment_method")
