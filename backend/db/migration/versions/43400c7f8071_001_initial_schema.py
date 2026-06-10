"""001_initial_schema

Revision ID: 43400c7f8071
Revises:
Create Date: 2026-06-10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "43400c7f8071"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "company",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("logo", sa.String(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("active", "inactive", name="companystatus"),
            nullable=False,
            server_default="active",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "auth",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("password", sa.String(), nullable=False),
    )

    op.create_table(
        "category",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
    )

    op.create_table(
        "category_enroll",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("category.id"), nullable=False),
    )

    op.create_table(
        "criteria",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("data", JSONB(), nullable=False, unique=True),
    )

    op.create_table(
        "criteria_enroll",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("criteria_id", UUID(as_uuid=True), sa.ForeignKey("criteria.id"), nullable=False),
        sa.Column("severity", sa.String(), nullable=True),
        sa.Column("message", sa.String(), nullable=True),
        sa.Column("is_critical", sa.Boolean(), nullable=False, server_default="false"),
    )

    op.create_table(
        "document",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("multipaths", JSONB(), nullable=False),
    )

    op.create_table(
        "document_enroll",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("document_id", UUID(as_uuid=True), sa.ForeignKey("document.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "review", "failed", "verified", name="documentstatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("result", JSONB(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "signature",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "document_enroll_id",
            UUID(as_uuid=True),
            sa.ForeignKey("document_enroll.id"),
            nullable=False,
        ),
        sa.Column("hash", sa.String(), nullable=False),
        sa.Column("txid", sa.String(), nullable=False),
        sa.Column("to_address", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "apikey",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("apikey", sa.String(), nullable=False, unique=True),
        sa.Column(
            "status",
            sa.Enum("active", "revoke", name="apikeystatus"),
            nullable=False,
            server_default="active",
        ),
    )

    op.create_table(
        "plan",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("per_user", sa.Integer(), nullable=False, server_default="100"),
    )

    op.create_table(
        "payment",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("company.id"), nullable=False),
        sa.Column("plan_id", UUID(as_uuid=True), sa.ForeignKey("plan.id"), nullable=False),
        sa.Column("transaction_id", sa.String(8), nullable=False, unique=True),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("payment")
    op.drop_table("plan")
    op.drop_table("apikey")
    op.drop_table("signature")
    op.drop_table("document_enroll")
    op.drop_table("document")
    op.drop_table("criteria_enroll")
    op.drop_table("criteria")
    op.drop_table("category_enroll")
    op.drop_table("category")
    op.drop_table("auth")
    op.drop_table("company")
    op.execute("DROP TYPE IF EXISTS documentstatus")
    op.execute("DROP TYPE IF EXISTS companystatus")
    op.execute("DROP TYPE IF EXISTS apikeystatus")
