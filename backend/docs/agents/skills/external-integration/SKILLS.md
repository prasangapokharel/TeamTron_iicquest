# External Integration Rules

## Core Principle

Never integrate an external service directly into the application first.

Always follow:

Research → Unit Test → Verify → Integrate

Integration is only allowed after the unit test passes.

---

## Documentation Source

Always use official documentation.

Priority order:

1. Official documentation
2. Official SDK documentation
3. Official API reference

Avoid:

* Blog posts
* Medium articles
* Random tutorials
* Outdated examples
* Community snippets unless requested

Always verify implementation against the latest official documentation.

---

## Research Process

Before implementation:

* Review official API documentation.
* Review authentication requirements.
* Review rate limits.
* Review request formats.
* Review response formats.
* Review error handling.

Use web search when documentation verification is required.

Do not assume API behavior.

---

## Testing First

Before integrating:

Create an isolated unit test.

Location:

unit/[module_name]/[file_name].py

Examples:

unit/stripe/create_payment.py

unit/openai/chat_completion.py

unit/sendgrid/send_email.py

unit/github/create_repository.py

The test must verify:

* Authentication
* Request payload
* Response payload
* Error handling
* Success handling

---

## Integration Requirement

Only integrate after:

* Unit test passes.
* API behavior is confirmed.
* Response structure is verified.

Never write production integration code first.

Never guess request or response formats.

---

## Integration Structure

Business logic:

fastapi/app/api/v1/[module]/service.py

Routes:

fastapi/app/api/v1/[module]/route.py

External clients:

Use existing project structure.

Do not create unnecessary wrappers or abstractions.

Keep integrations minimal.

---

## Documentation Files

Do not create:

README.md

docs/

documentation/

integration.md

api.md

architecture.md

Any other markdown files

Unless explicitly requested.

---

## Code Style

Requirements:

* Minimal code
* Production-ready code
* No placeholders
* No mock implementations in production code
* No unnecessary comments
* No unnecessary abstractions

---

## Validation Process

Before completing integration:

Checklist:

* Official documentation reviewed
* Authentication verified
* Unit test created
* Unit test passed
* Error cases tested
* Response verified
* Service integrated
* Route integrated

If any step fails:

Do not proceed with production integration.

Fix the isolated unit test first.

---

## AI Assistant Rules

Whenever integrating:

1. Search official documentation.
2. Verify latest API behavior.
3. Create isolated test in:

unit/[module_name]/[file_name].py

4. Confirm test success.
5. Integrate into service.py.
6. Connect route.py if required.

Never skip the testing phase.

Never integrate directly without validation.

Test first. Integrate second.
