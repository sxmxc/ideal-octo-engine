# Contributing to the SRE Toolbox community catalog

Thanks for helping maintain the community toolkit catalog.

## Ways to contribute

- **Author or update a toolkit** under `toolkits/<slug>/`.
- **Improve documentation** in `docs/` to clarify workflows and expectations.
- **Enhance automation** in `scripts/` and `toolkit_bundle_service.py`.

## Workflow overview

1. **Plan** – Discuss significant changes via an issue or discussion first.
2. **Branch** – Create a topic branch (`toolkit/<slug>-<change>` or
   `docs/<topic>`).
3. **Implement** – Update toolkit code, documentation, and automation as
   required. Keep changes focused and self-contained.
4. **Sync metadata** – Run `python scripts/sync_toolkit_assets.py --slug <slug>`
   to regenerate `docs/toolkits/<slug>/index.md` and update the catalog entry.
5. **Validate** – Execute the required checks:
   ```bash
   python scripts/validate_catalog.py --strict --toolkit <slug>
   scripts/validate-toolkit.sh <slug>
   scripts/validate-repo.sh
   mkdocs build --strict --clean --site-dir site
   ```
6. **Verify bundler output** – Start `uvicorn toolkit_bundle_service:application`
   and confirm `GET /toolkits/<slug>/bundle.zip` returns a valid archive.
7. **Submit** – Open a pull request using the supplied template and attach test
   evidence plus command output.
8. **Review** – Respond quickly to feedback; maintainers will double-check the
   manifest, docs, and bundler endpoint.

## Toolkit submission checklist

- [ ] Directory follows `toolkits/<slug>/` layout and includes
      backend/worker/frontend modules as needed.
- [ ] `toolkits/<slug>/toolkit.json` updated with version, slug, and catalog
      metadata.
- [ ] Documentation files (`README.md`, `RELEASE_NOTES.md`, `CHANGELOG.md`,
      `TESTING.md`) updated with numbered steps and explicit file paths.
- [ ] `scripts/sync_toolkit_assets.py --slug <slug>` executed and diff reviewed.
- [ ] Dynamic bundler endpoint verified locally with curl and unzip tests.
- [ ] `scripts/validate_catalog.py --strict` and `scripts/validate-toolkit.sh`
      outputs attached to the PR.
- [ ] MkDocs build passes without warnings (`mkdocs build --strict`).

## Coding expectations

- Follow upstream Toolbox conventions for logging, telemetry, and error
  handling.
- Include automated tests where feasible (backend: `pytest`, frontend: `vitest`).
- Avoid absolute paths, parent-directory references, or symlinks inside toolkit
  directories. Bundles should be self-contained.

## License

Unless noted otherwise, contributions are licensed under the Apache 2.0
License. Refer to `LICENSE` for details.
