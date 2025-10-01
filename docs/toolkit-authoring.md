# Toolkit authoring checklist

Use this checklist whenever you create or update a community toolkit. Each item links back to the detailed guidance in
[`docs/toolkit-authoring/`](toolkit-authoring/overview.md).

## Plan & scaffold

- [ ] Confirm your slug follows the [requirements](toolkit-authoring/overview.md#slug-requirements): lowercase letters, numbers,
      hyphen (`-`), or underscore (`_`).
- [ ] Create the standard [directory layout](toolkit-authoring/overview.md#standard-directory-layout) under
      `toolkits/<slug>/`, deleting runtime directories you do not ship.
- [ ] Start a feature branch (`git checkout -b toolkit/<slug>-<change>`) before editing manifests or code.

## Implement runtime components

- [ ] Build the FastAPI surface described in the [backend guide](toolkit-authoring/backend-and-worker.md#fastapi-surface) and
      namespace routes under `/toolkits/<slug>/`.
- [ ] Register Celery tasks using the [`<slug>.<action>` naming pattern](toolkit-authoring/backend-and-worker.md#celery-workers)
      so operators can filter job telemetry.
- [ ] Implement the optional React bundle following the
      [frontend integration guide](toolkit-authoring/frontend.md), reusing shared runtime primitives.
- [ ] Update `toolkit.json` with backend, worker, frontend, and catalog metadata. Bump `version` and `updated_at` as described in
      the [versioning guide](toolkit-authoring/versioning.md).

## Documentation & testing

- [ ] Refresh `toolkits/<slug>/docs/README.md`, `RELEASE_NOTES.md`, `CHANGELOG.md`, and `TESTING.md` with the latest guidance.
- [ ] Capture operator procedures in the in-app documentation, linking to the new [multi-page surfaces](toolkit-authoring/frontend.md#runtime-context)
      when applicable.
- [ ] Run automated and manual checks from the [testing & release checklist](toolkit-authoring/testing-and-release.md) and keep
      console output for reviewers.

## Release preparation

- [ ] Run the required repository validations:
  ```bash
  python scripts/sync_toolkit_assets.py --slug <slug>
  python scripts/validate_catalog.py --strict --toolkit <slug>
  scripts/validate-toolkit.sh <slug>
  scripts/validate-repo.sh
  ```
- [ ] Start `toolkit_bundle_service.py` locally and verify `GET /toolkits/<slug>/bundle.zip` with `curl` and `unzip -t`.
- [ ] Update pull request notes with testing evidence and doc changes. Include highlights for operators in
      `docs/RELEASE_NOTES.md`.

Stay consistent with the [Toolkit Authoring Overview](toolkit-authoring/overview.md) so the dynamic bundler, App Shell, and
catalog ingest your toolkit without manual intervention.
