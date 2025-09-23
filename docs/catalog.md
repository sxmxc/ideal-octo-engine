# Catalog maintenance

The catalog manifest at `catalog/toolkits.json` is the contract that Toolbox
instances download before resolving individual bundle URLs. Keep it consistent
and predictable.

## Schema overview

- `version` (integer) – Schema version for the manifest file.
- `generated_at` (RFC3339 timestamp) – Set automatically by
  `scripts/sync_toolkit_assets.py` when entries change.
- `toolkits` (array) – Each element is an object with the following fields:
  - `slug` (string, lowercase, `a-z0-9-_`) – Toolkit identifier and directory.
  - `name` (string) – Display name in the catalog UI.
  - `description` (string) – Short public blurb.
  - `version` (string) – Semantic version of the toolkit.
  - `bundle_url` (string) – Relative path to the dynamic bundler endpoint.
    Must equal `toolkits/<slug>/bundle.zip`.
  - `docs_url` (string) – Relative MkDocs path for toolkit documentation.
    Must equal `toolkits/<slug>/`.
  - `categories` (array of strings) – Used for filtering in the catalog browser.
  - `tags` (array of strings) – Free-form keywords.
  - `maintainers` (array of strings, optional) – Contact emails or groups.
  - `homepage` (string, optional) – External docs for the toolkit vendor.
  - `source` (string, optional) – Source directory for the bundle.
  - `tags`, `categories`, and `maintainers` accept overrides via the
    `catalog` block inside `toolkit.json`.

## Update workflow

1. Edit `toolkits/<slug>/toolkit.json` and include a `catalog` block if you need
   to override the public description, categories, or tags.
2. Run `python scripts/sync_toolkit_assets.py --slug <slug>` to regenerate the
   MkDocs page at `docs/toolkits/<slug>/index.md`, update
   `catalog/toolkits.json`, and refresh the static bundle at
   `docs/toolkits/<slug>/bundle.zip`. The archive is produced on demand for
   static hosting and is not checked into Git.
3. Inspect the JSON diff and ensure `bundle_url` uses the `.zip` suffix.
4. Validate the schema:
   ```bash
   python scripts/validate_catalog.py --strict --toolkit <slug>
   ```
5. Commit the manifest change together with the toolkit updates.

## Verifying hosted assets

1. Serve the repository locally to simulate GitHub Pages:
   ```bash
   python -m http.server 8001
   ```
2. Start the bundler in another shell:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   ```
3. Download the catalog and bundle and confirm successful responses from both
   the static site and dynamic bundler:
   ```bash
   curl -I http://localhost:8001/catalog/toolkits.json
   curl -I http://localhost:8001/toolkits/<slug>/bundle.zip
   curl -I http://localhost:8002/toolkits/<slug>/bundle.zip
   curl http://localhost:8002/toolkits/<slug>/bundle.zip -o /tmp/<slug>.zip
   unzip -t /tmp/<slug>.zip
   ```
4. Compare checksums if mirroring through a CDN:
   ```bash
   shasum -a 256 /tmp/<slug>.zip
   ```

## Review and sign-off

- Every pull request must attach the command output from
  `scripts/validate_catalog.py --strict`.
- Ensure documentation updates have been generated via
  `scripts/sync_toolkit_assets.py`.
- Confirm the dynamic bundle endpoint streams a ZIP archive without creating
  temporary files on disk.
- Keep the catalog sorted alphabetically by slug.
