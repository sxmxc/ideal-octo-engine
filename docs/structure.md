# Repository structure

```
.
├── .github/               # Issue templates, pull request template, and CI workflows
├── ai/                    # Codex automation context and state files
├── catalog/               # Machine-readable index of published toolkits
├── docs/                  # Documentation for authors, maintainers, and governance
├── scripts/               # Validation and packaging helpers
├── toolkits/              # Source directories for each community toolkit
```

## Key files

- `catalog/toolkits.json` – Canonical metadata for all published toolkits. This is the manifest of all available toolkits.
- `docs/catalog/` – Interactive catalog browser backed by the metadata file.
- `docs/<slug>/index.md` – Auto-generated toolkit overview sourced from `toolkits/<slug>/docs/README.md`.
- `docs/toolkits/<slug>/bundle/` – Redirect helper that serves the generated `bundle.zip` for GitHub Pages deployments.
- `docs/toolkit-authoring/` – Guides for building, testing, and shipping toolkits.
- `docs/governance/` – Contribution workflow, review process, and security expectations.
- `toolkits/<slug>/toolkit.json` – Toolkit manifest plus optional `catalog` metadata mirrored into `catalog/toolkits.json`.
- `ai/ops/codex.md` – Maintainer automation prompt used by Codex agents.

Refer to `docs/toolkit-authoring/packaging.md` for packaging expectations and `docs/governance/contribution-process.md` for the submission lifecycle.
