# Together AI Fine-Tuning Rules

## Core Principle

Always use the latest Together AI official documentation.

Never guess:

* API endpoints
* SDK methods
* Request payloads
* Response payloads
* Model names

Verify against official documentation first.

---

## Research First

Before implementation:

1. Read official Together AI documentation.
2. Verify SDK usage.
3. Verify fine-tuning parameters.
4. Verify model support.
5. Verify inference workflow.

Use web search for verification.

Never rely on memory.

---

## Unit Testing First

Before integration:

Create an isolated test.

Location:

unit/together/[filename].py

Examples:

unit/together/upload_dataset.py

unit/together/create_finetune.py

unit/together/check_status.py

unit/together/inference.py

Only integrate after tests pass.

---

## Installation

Use:

uv add together

Never use unofficial SDKs.

---

## Dataset Rules

Training data must be JSONL.

Validate dataset before upload.

Test upload independently.

Example file:

data/training.jsonl

---

## Upload Test

Create:

unit/together/upload_dataset.py

Example:

from together import Together

client = Together()

response = client.files.upload(
file="data/training.jsonl"
)

print(response)

Verify:

* upload success
* file id returned

Before proceeding.

---

## Fine-Tuning Test

Create:

unit/together/create_finetune.py

Example:

from together import Together

client = Together()

job = client.fine_tuning.create(
training_file="FILE_ID",
model="Qwen/Qwen3-8B",
lora=True
)

print(job)

Verify:

* job id
* output model name
* status

Before integration.

---

## Status Monitoring Test

Create:

unit/together/check_status.py

Example:

from together import Together

client = Together()

job = client.fine_tuning.retrieve(
"JOB_ID"
)

print(job)

Verify:

* queued
* running
* completed
* failed

States handled correctly.

---

## Inference Test

Create:

unit/together/inference.py

Example:

from together import Together

client = Together()

response = client.chat.completions.create(
model="YOUR_FINETUNED_MODEL",
messages=[
{
"role": "user",
"content": "Hello"
}
]
)

print(response)

Verify:

* response generated
* model deployed
* output valid

Before integration.

---

## Integration Structure

Service:

fastapi/app/api/v1/ai/service.py

Routes:

fastapi/app/api/v1/ai/route.py

Business logic belongs in service.py.

Routes remain thin.

---

## Error Handling

Handle:

* invalid api key
* upload failure
* invalid dataset
* failed training
* deployment failure
* inference failure
* timeout

Never assume success.

---

## Documentation Rules

Do not create:

README.md

docs/

guide.md

integration.md

architecture.md

Unless explicitly requested.

---

## AI Assistant Rules

Workflow:

1. Read official docs.
2. Create isolated unit test.
3. Verify upload.
4. Verify training.
5. Verify status.
6. Verify inference.
7. Integrate service.
8. Integrate route.

Never skip testing.

Never integrate first.

Test first.
Integrate second.
