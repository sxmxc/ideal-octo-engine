# SRE Toolbox Community Repository

Welcome to the community-driven catalog of SRE Toolbox toolkits. This repository collects vetted toolkits, documentation, and automation to help operators extend the SRE Toolbox platform quickly and safely.

## Repository goals

- **Discoverability** – Provide a browsable catalog (`catalog/`) that Toolbox instances can sync or mirror.
- **Quality** – Document contribution, review, and security expectations so submissions stay trustworthy.
- **Codex ready** – Ship automation prompts and state files so Codex agents can assist maintainers when requested.

## Getting started

1. Read `docs/structure.md` for a tour of the repository layout.
2. Review `docs/toolkit-authoring/getting-started.md` and `docs/toolkit-authoring/packaging.md` before proposing a new toolkit.
3. Follow the contribution checklist in `.github/PULL_REQUEST_TEMPLATE.md` when opening a PR.
4. Use the scripts in `scripts/` to validate and package toolkits.

## Toolkit catalog

Published toolkits live under `toolkits/`. Each toolkit directory mirrors the installable bundle layout (`toolkit.json`, optional `backend/`, `worker/`, `frontend/`, `docs/`). Catalog metadata is generated from `catalog/toolkits.json` and surfaced through GitHub Pages.

## Support & Governance

- Governance policies: `docs/governance/`
- Contribution guidelines: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`

For questions, open a discussion or file an issue using the templates in `.github/ISSUE_TEMPLATE/`.
