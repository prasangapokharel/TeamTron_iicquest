# FastAPI Backend Development Rules (Strict)

## Core Principles

* Follow the existing project structure exactly.
* Do not create additional folders, files, patterns, abstractions, or architecture unless explicitly requested.
* Keep code minimal, clean, modular, and production-ready.
* Avoid duplicate code, duplicate comments, duplicate examples, and unnecessary explanations.
* Never generate `.md` files unless explicitly requested.
* Never generate files that were not requested.
* Prefer consistency over creativity.

---

## Dependencies

Always use the latest stable Pydantic version.

Installation:

uv add pydantic

For email validation:

uv add 'pydantic[email]'

For email and timezone support:

uv add 'pydantic[email,timezone]'

Always use Pydantic v2 syntax and APIs.

---

## API-First Architecture

Every feature must start from the API layer.

Example:

fastapi/
└── app/
└── api/
└── v1/
└── auth/
├── route.py
└── service.py

Rules:

* route.py contains API endpoints only.
* service.py contains business logic only.
* Keep routes thin.
* Move logic to services.

---

## CRUD Rules

Always use shared CRUD helpers.

Import style:

from crude import create, read, update, delete

Do not rewrite CRUD operations if helpers already exist.

Use CRUD helpers inside services only.

Example:

fastapi/app/api/v1/users/service.py

from crude import create, read, update, delete

---

## Database Structure

Always use the following locations.

Models:

fastapi/db/models

Schemas:

fastapi/db/schemas

Migrations:

fastapi/db/migration

Do not place models, schemas, or migrations elsewhere.

---

## Migration Rules

Always use Alembic migrations.

Migration location:

fastapi/db/migration

Requirements:

* Generate clean migrations.
* One migration per change.
* No manual SQL unless requested.
* Keep migrations reversible.

---

## Pydantic Rules

Use Pydantic v2.

Preferred features:

* BaseModel
* EmailStr
* Field
* field_validator
* model_validator
* computed_field

Use strict validation where appropriate.

Keep schemas minimal.

Do not add fields that were not requested.

---

## Service Rules

Business logic belongs in:

fastapi/app/api/v1/<module>/service.py

Examples:

fastapi/app/api/v1/auth/service.py

fastapi/app/api/v1/users/service.py

Services should:

* Call CRUD helpers.
* Contain validation/business logic.
* Avoid HTTP-specific code.

---

## Route Rules

Routes belong in:

fastapi/app/api/v1/<module>/route.py

Routes should:

* Receive requests.
* Validate input.
* Call services.
* Return responses.

Do not place business logic inside routes.

---

## Code Style

Requirements:

* Minimal code.
* No unnecessary comments.
* No large docstrings.
* No placeholder code.
* No excessive examples.
* No over-engineering.
* No unused imports.
* No dead code.

Return only the requested implementation.

Do not explain architecture unless requested.

Do not generate additional files unless requested.

Maintain consistency with the existing codebase at all times.
