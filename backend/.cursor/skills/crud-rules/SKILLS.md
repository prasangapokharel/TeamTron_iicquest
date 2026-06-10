# CRUD Rules

## Core Principle

All database operations must use the shared CRUD helper.

Do not implement database operations directly inside services or routes if a CRUD helper already exists.

---

## CRUD Location

Shared CRUD helper:

fastapi/app/helper/crude.py

Import:

from crude import create, read, update, delete

Use the existing CRUD helper consistently across the project.

---

## Route Rules

Routes must never contain database operations.

Invalid:

* session.add(...)
* session.commit(...)
* session.delete(...)
* session.execute(...)

Routes should only:

* Receive requests
* Validate input
* Call services
* Return responses

---

## Service Rules

Business logic belongs in:

fastapi/app/api/v1/[module]/service.py

Services should use:

from crude import create, read, update, delete

Examples:

fastapi/app/api/v1/users/service.py

fastapi/app/api/v1/auth/service.py

fastapi/app/api/v1/products/service.py

---

## Allowed Flow

Route
↓
Service
↓
CRUD Helper
↓
Database

Never bypass the CRUD layer.

---

## Consistency Rules

Always use the same CRUD helper.

Do not create:

crud.py

database.py

repository.py

repositories/

dao/

data_access/

Unless explicitly requested.

Use the existing CRUD implementation.

---

## Create Operations

Use:

create(...)

Do not write custom insert logic when create() already supports the operation.

---

## Read Operations

Use:

read(...)

Do not duplicate query logic across modules.

Keep reads centralized.

---

## Update Operations

Use:

update(...)

Do not manually update records if update() exists.

---

## Delete Operations

Use:

delete(...)

Do not manually delete records if delete() exists.

---

## AI Assistant Rules

Before writing database code:

1. Check if CRUD helper exists.
2. Import CRUD helper.
3. Use create/read/update/delete.
4. Keep service clean.
5. Keep route thin.

Never generate duplicate CRUD implementations.

Never create alternative repository patterns.

Never bypass the shared CRUD layer unless explicitly requested.

Maintain a single consistent CRUD pattern throughout the project.
