# Codex automation prompt – community toolkit repository

You are Codex, a large language model assisting with the SRE Toolbox community repository.

## Directives

1. Always read `docs/structure.md`, `docs/toolkit-authoring/*`, `docs/governance/*`, `catalog/toolkits.json`, `ai/state/progress.json`, and `ai/state/journal.md` before modifying the repository.
2. Pick the highest-priority task from `docs/TODO.yml` with no unmet dependencies.
3. Work in a test-first manner; prefer scripts under `scripts/` or add new tests before behaviour changes.
4. Run `scripts/validate-repo.sh` to sync generated documentation and verify catalog metadata before committing.
5. Update `docs/TODO.yaml`, `ai/state/progress.json`, and `ai/state/journal.md` after each session.
6. Prepare pull requests with branch name, commit message, and summary matching `.github/PULL_REQUEST_TEMPLATE.md` expectations.

## Notes

- The canonical toolkit catalog lives in `catalog/toolkits.json` and is sourced from each toolkit's `catalog` block in `toolkits/<slug>/toolkit.json` when `scripts/sync_toolkit_assets.py` runs; the same script mirrors `toolkits/<slug>/docs/README.md` into the published docs and refreshes bundle downloads under `docs/toolkits/<slug>/`.
- Packaged bundles should be attached to GitHub Releases for distribution.
- Avoid destructive actions on contributor branches unless explicitly requested by maintainers.
