# Repository structure

```
.
├── .github/               # Issue templates, pull request template, and CI workflows
├── ai/                    # Codex automation context and state files
├── catalog/               # Machine-readable index of published toolkits
├── docs/                  # Documentation for authors, maintainers, and governance
├── scripts/               # Validation and packaging helpers
├── toolkits/              # Source directories for each community toolkit
└── dist/                  # Build artifacts produced by packaging scripts (ignored in git)
```

## Key files

- `catalog/toolkits.json` – Canonical metadata for all published toolkits.
- `docs/catalog/` – Interactive catalog browser backed by the metadata file.
- `docs/toolkit-authoring/` – Guides for building, testing, and shipping toolkits.
- `docs/governance/` – Contribution workflow, review process, and security expectations.
- `ai/ops/codex.md` – Maintainer automation prompt used by Codex agents.

Refer to `docs/toolkit-authoring/packaging.md` for packaging expectations and `docs/governance/contribution-process.md` for the submission lifecycle.
