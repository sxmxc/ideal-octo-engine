# Toolkit security review questionnaire

Complete this questionnaire for every new toolkit and attach the answers to your pull request. Maintainers use it to assess risk, dependency posture, and operational impact.

1. **Overview**
   - Toolkit slug and version:
   - Primary function:
   - External dependencies or services:

2. **Data handling**
   - What sensitive data does the toolkit access or transmit?
   - Where is data stored, and for how long?
   - Are credentials retrieved from Vault or injected via configuration?

3. **Authentication & authorization**
   - Which roles can invoke the toolkit?
   - Does the toolkit enforce additional access controls?

4. **Execution environment**
   - Does the toolkit execute user-provided code or commands?
   - What safeguards are in place to prevent privilege escalation?

5. **External calls**
   - List outbound network calls and their protocols.
   - Are certificates or TLS configurations validated?

6. **Logging & telemetry**
   - What events are logged, and do logs contain sensitive data?
   - How are errors surfaced to operators?

7. **Testing & validation**
   - Describe automated tests (unit, integration, smoke).
   - Outline manual test scenarios performed before submission.

8. **Maintenance**
   - Identify maintainers responsible for future updates.
   - Outline the release/versioning strategy.

Sign-off:

- Contributor:
- Security reviewer:
- Date:
