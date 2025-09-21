# Community contribution process

This repository maintains the public catalog of SRE Toolbox toolkits. The process below ensures submissions meet quality, security, and documentation expectations.

## Roles

- **Contributor** – Authors toolkit changes and submits pull requests.
- **Maintainer** – Reviews submissions, enforces governance, and publishes catalog updates.
- **Security reviewer** – Performs targeted security assessments for new toolkits or significant updates.

## Lifecycle

1. **Proposal** – Contributor opens an issue or discussion describing the toolkit, target use cases, and dependencies.
2. **Implementation** – Contributor develops the toolkit in a fork, following `docs/toolkit-authoring/` guidance and adding documentation.
3. **Validation** – Contributor runs `scripts/validate-toolkit.sh <slug>` and shares results, along with manual test notes.
4. **Pull request** – Contributor submits a PR using `.github/PULL_REQUEST_TEMPLATE.md`, attaches the packaged bundle, and includes the security questionnaire.
5. **Review** – Maintainers perform code review, run validation scripts, and request adjustments as needed. Security reviewer signs off when required.
6. **Catalog update** – Once approved, maintainers merge the PR, regenerate catalog metadata if necessary, and publish the bundle to GitHub Releases.
7. **Announcement** – Maintainers update `docs/changelog.md` and share availability through community channels.

## Service-level expectations

- Maintainers respond to new toolkit proposals within 5 business days.
- Critical security issues are acknowledged within 24 hours and tracked until resolution.
- Toolkits that fail validation or become unmaintained may be deprecated following a 30-day notice period.

## Decision log

Major governance decisions should be recorded in `docs/governance/decision-log.md` to keep future maintainers informed.
