# Context – Community toolkit repository

1. Catalog metadata lives in `catalog/toolkits.json` and is derived from each toolkit's `catalog` block inside `toolkits/<slug>/toolkit.json`; sync or validate it with `scripts/sync_toolkit_assets.py` and `scripts/validate_catalog.py`.
2. Generated documentation mirrors toolkit READMEs via `scripts/sync_toolkit_assets.py`; run it (or `scripts/validate-repo.sh`) after documentation changes to refresh `docs/<slug>/`, bundle placeholders, and catalog entries in one step.
3. Toolkits mirror the runtime contract described in the main SRE Toolbox repository (`toolkit.json`, optional backend/worker/frontend modules, docs).
4. Governance policies under `docs/governance/` drive contribution review, security assessments, and publishing standards.
5. Codex sessions must update `docs/TODO.yaml`, `ai/state/progress.json`, and `ai/state/journal.md` when tasks change.
6. Packaged bundles created by `scripts/package-toolkit.sh` should be attached to releases for distribution.
