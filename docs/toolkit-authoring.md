# Toolkit authoring checklist

Use this checklist whenever you create or update a community toolkit.

## Directory layout

```
toolkits/<slug>/
├── toolkit.json
├── backend/
│   └── app.py (or equivalent router entry point)
├── worker/
│   └── __init__.py (Celery task registration)
├── frontend/
│   └── index.tsx (or entry file referenced by toolkit.json)
└── docs/
    ├── README.md
    ├── RELEASE_NOTES.md
    ├── CHANGELOG.md
    └── TESTING.md
```

## Slug rules

- Lowercase only.
- Allowed characters: `a-z`, `0-9`, `-`, `_`.
- The slug must match the directory name, bundle path, and manifest `slug`.

## Author workflow

1. Checkout a feature branch: `git checkout -b toolkit/<slug>-<change>`.
2. Update or create `toolkits/<slug>/toolkit.json` with accurate metadata and
   optional `catalog` overrides.
3. Implement backend, worker, and frontend modules. Remove unused runtime
   directories to keep bundles lean.
4. Refresh documentation under `toolkits/<slug>/docs/`:
   - `README.md` – Operator overview with numbered steps.
   - `RELEASE_NOTES.md` – Summary per version.
   - `CHANGELOG.md` – Timestamped change history.
   - `TESTING.md` – Evidence checklist for reviewers.
5. Run validations:
   ```bash
   python scripts/sync_toolkit_assets.py --slug <slug>
   python scripts/validate_catalog.py --strict --toolkit <slug>
   scripts/validate-toolkit.sh <slug>
   ```
6. Start the bundler locally and confirm `GET /toolkits/<slug>/bundle.zip`
   returns a valid archive (see [dynamic bundler operations](bundler.md)).
7. Capture output from `TESTING.md` in your pull request description.
8. Request review and iterate based on feedback.

## Documentation expectations

- Use sentence case headings and numbered steps for procedures.
- Reference explicit file paths (e.g., `toolkits/<slug>/backend/app.py`).
- Include configuration details, known limitations, and rollback instructions.
- Link to upstream Toolbox documentation when necessary using relative links if
  the resource lives in this repository.

## Publishing a release

1. Update `toolkits/<slug>/toolkit.json` version and changelog files.
2. Regenerate docs and catalog metadata via `scripts/sync_toolkit_assets.py`.
3. Verify the dynamic bundler and catalog endpoints locally.
4. Commit changes and push for review.
