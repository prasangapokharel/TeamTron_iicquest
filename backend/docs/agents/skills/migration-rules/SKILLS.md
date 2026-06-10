# Migration Rules

## Migration Location

Always create migration files inside:

fastapi/db/migration

Never create migrations in any other directory.

Invalid:

alembic/versions

migrations/

database/migrations

Valid:

fastapi/db/migration

---

## File Structure

Each migration must be a separate file.

Example:

fastapi/db/migration/
├── 001_create_users_table.py
├── 002_add_phone_to_users.py
├── 003_create_roles_table.py

Do not combine multiple unrelated changes into one migration.

One database change = one migration file.

---

## Naming Convention

Use sequential and descriptive names.

Examples:

001_create_users_table.py

002_add_email_verified_to_users.py

003_create_products_table.py

004_add_index_to_users_email.py

Avoid generic names:

migration.py

update.py

fix.py

temp.py

---

## Migration Rules

Always generate clean migrations.

Requirements:

* Upgrade must work independently.
* Downgrade must work independently.
* Keep migrations reversible.
* Keep migrations minimal.
* Keep migrations focused on one change.

---

## Allowed Changes

* Create table
* Drop table
* Add column
* Remove column
* Rename column
* Add index
* Remove index
* Add constraint
* Remove constraint
* Create foreign key
* Remove foreign key

---

## Model Synchronization

Whenever a model changes:

1. Update model in:

fastapi/db/models

2. Create schema if needed in:

fastapi/db/schemas

3. Create migration in:

fastapi/db/migration

Never update models without creating the corresponding migration.

---

## Alembic Rules

Always use Alembic.

Generate migrations from model changes whenever possible.

Keep migration files clean.

Avoid manual SQL unless explicitly requested.

Prefer Alembic operations over raw SQL.

---

## AI Assistant Rules

When creating or modifying database structures:

Always check:

fastapi/db/models

Always create migration in:

fastapi/db/migration

Never place migration files elsewhere.

Never skip migration creation after model changes.

Never create additional migration directories.

Always follow:

Model → Schema → Migration

Order:

1. fastapi/db/models
2. fastapi/db/schemas
3. fastapi/db/migration

Maintain this structure consistently across the entire project.
