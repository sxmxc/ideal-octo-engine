# Context – Community toolkit repository

1. Catalog metadata lives in `catalog/toolkits.json`; validate with `scripts/validate_catalog.py`.
2. Toolkits mirror the runtime contract described in the main SRE Toolbox repository (`toolkit.json`, optional backend/worker/frontend modules, docs).
3. Governance policies under `docs/governance/` drive contribution review, security assessments, and publishing standards.
4. Codex sessions must update `docs/TODO.yaml`, `ai/state/progress.json`, and `ai/state/journal.md` when tasks change.
5. Packaged bundles created by `scripts/package-toolkit.sh` should be attached to releases for distribution.
