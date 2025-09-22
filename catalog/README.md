# Toolkit catalog

The catalog is a machine-readable index consumed by Toolbox instances and automation.

- Maintain per-toolkit metadata in the `catalog` block of `toolkits/<slug>/toolkit.json` and run `scripts/sync_toolkit_assets.py` to regenerate `toolkits.json` when publishing, updating, or deprecating a toolkit.
- The sync script keeps entries sorted alphabetically by slug.
- Store generated artifacts (e.g., HTML catalog) under `docs/` or GitHub Pages, not in this directory.
