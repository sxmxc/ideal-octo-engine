# SRE Toolbox community catalog

This repository publishes community-maintained toolkits for the SRE Toolbox
runtime. It hosts the public catalog (`catalog/toolkits.json`), the toolkit
source directories under `toolkits/`, and the documentation that guides
contributors through authoring, testing, and publishing.

## Repository layout

```
.
├── catalog/toolkits.json   # Manifest downloaded by Toolbox instances
├── docs/                   # Architecture, catalog, authoring, testing guides
├── scripts/                # Validation helpers and docs/catalog sync script
├── toolkit_bundle_service.py # WSGI app that serves bundles on demand
└── toolkits/<slug>/        # Source assets for each community toolkit
```

## Dynamic bundler contract

- Bundles are generated on demand at `GET /toolkits/<slug>/bundle.zip`.
- Archives stream directly from memory and enforce the `TOOLKIT_UPLOAD_MAX_BYTES`
  limit (50 MiB by default).
- The bundler also serves `GET /catalog/toolkits.json` so GitHub Pages or any
  static host can proxy requests without storing ZIP files in the repository.

## Contributing

1. Review the guides in `docs/`—start with
   [`docs/toolkit-authoring.md`](docs/toolkit-authoring.md) and
   [`docs/testing.md`](docs/testing.md).
2. Implement or update your toolkit under `toolkits/<slug>/` and maintain the
   documentation in `docs/README.md`, `RELEASE_NOTES.md`, `TESTING.md`, and
   `CHANGELOG.md`.
3. Run the required validations prior to submitting a pull request:
   ```bash
   python scripts/sync_toolkit_assets.py --slug <slug>
   python scripts/validate_catalog.py --strict --toolkit <slug>
   scripts/validate-repo.sh
   mkdocs build --strict --clean --site-dir site
   ```
4. Launch the bundler locally (`uvicorn toolkit_bundle_service:application`) and
   verify your bundle downloads successfully.
5. Include test evidence and command output in your pull request description.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full submission workflow.

## Support

- Code of conduct: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- Backlog and open questions: [`docs/TODO.yml`](docs/TODO.yml)

For help, open a discussion or issue using the templates in `.github/`.
