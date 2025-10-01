# Context – Community toolkit repository

1. Catalog metadata lives in `catalog/toolkits.json` and is derived from each toolkit's `catalog` block inside `toolkits/<slug>/toolkit.json`; sync or validate it with `scripts/sync_toolkit_assets.py` and `scripts/validate_catalog.py`.
2. Run `scripts/sync_toolkit_assets.py` (or `scripts/validate-repo.sh`) after editing `toolkits/<slug>/docs/README.md`; it rebuilds `docs/<slug>/index.md`, refreshes bundle redirects under `docs/toolkits/<slug>/`, and regenerates the catalog manifest in one step.
3. Toolkits mirror the runtime contract described in the main SRE Toolbox repository (`toolkit.json`, optional backend/worker/frontend modules, docs). Include `__init__.py` files so Python packages resolve correctly when bundles are extracted.
4. Governance policies under `docs/governance/` drive contribution review, security assessments, and publishing standards.
5. Codex sessions must update `docs/TODO.yaml`, `ai/state/progress.json`, and `ai/state/journal.md` when tasks change.
6. Bundles downloaded from `<site>/toolkits/<slug>/bundle` are produced from `toolkits/<slug>/` by the sync script; `scripts/package-toolkit.sh` wraps the same logic for local packaging.
7. Changes to the documentation site (MkDocs content, navigation, macros) must be reflected in `docs/changelog.md`; toolkit-specific
   release notes remain inside `toolkits/<slug>/docs/`.
