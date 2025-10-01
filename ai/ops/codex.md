# Codex automation prompt – community toolkit repository

You are Codex, a large language model assisting with the SRE Toolbox community repository.

## Directives

1. Always read `docs/structure.md`, `docs/toolkit-authoring/*`, `docs/governance/*`, `catalog/toolkits.json`, `ai/state/progress.json`, and `ai/state/journal.md` before modifying the repository.
2. Pick the highest-priority task from `docs/TODO.yml` with no unmet dependencies.
3. Work in a test-first manner; prefer scripts under `scripts/` or add new tests before behaviour changes.
4. Run `scripts/validate-repo.sh` to sync generated documentation and verify catalog metadata before committing.
5. Update `docs/TODO.yaml`, `ai/state/progress.json`, and `ai/state/journal.md` after each session.
6. Prepare pull requests with branch name, commit message, and summary matching `.github/PULL_REQUEST_TEMPLATE.md` expectations.
7. Bump the `version` field in each affected `toolkits/<slug>/toolkit.json` whenever toolkit behavior or assets change so downstream notifications stay accurate.
8. Document repository-site updates in `docs/changelog.md`; toolkit-specific release notes continue to live beside each toolkit.

## Notes

- The canonical toolkit catalog lives in `catalog/toolkits.json` and is sourced from each toolkit's `catalog` block in `toolkits/<slug>/toolkit.json` when `scripts/sync_toolkit_assets.py` runs; the same script mirrors `toolkits/<slug>/docs/README.md` into the published docs and refreshes bundle downloads under `docs/toolkits/<slug>/`.
- Packaged bundles should be attached to GitHub Releases for distribution.
- Avoid destructive actions on contributor branches unless explicitly requested by maintainers.

## Community toolkit primer

Use this checklist when documenting or curating toolkits for the public community repository.

- **Manifest (`toolkit.json`)** – every bundle ships a manifest with the slug, display metadata, and runtime wiring. See `toolkits/bundled/regex/toolkit.json` for a minimal example that registers backend routers and a built frontend entry.
- **Runtime modules** – backend routers live under the manifest's `backend.module`, worker registrations under `worker.module`, and frontends under `frontend.entry`. When a component is omitted the installer simply skips it, so bundles may be API-only, UI-only, or full-stack.
- **Base path hygiene** – `base_path` must match the router mount point and stay unique across toolkits. Frontends should link to routes beneath that base so the App Shell can scope navigation correctly.
- **Packaging** – bundle zips mirror the repository layout: manifest at the root, optional `backend/`, `worker/`, and built `frontend/dist/` assets alongside docs (e.g. `BUILDING.md`). CI uses `toolkits/scripts/package_all_toolkits.py` to apply the same validation curators run locally.
- **Catalog metadata** – the community catalog (`catalog/toolkits.json` in the public repo) points at GitHub Pages bundles like `https://<org>.github.io/<repo>/toolkits/<slug>/bundle.zip`. Keep changelog entries next to the manifest so curators can surface version history in the Toolbox UI.

