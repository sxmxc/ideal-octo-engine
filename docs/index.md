# SRE Toolbox community catalog

This repository hosts community-maintained toolkits for the SRE Toolbox
platform. Operators download bundles from the dynamic bundler exposed at
`/toolkits/<slug>/bundle.zip`, while contributors rely on the documentation and
automation in this catalog to publish updates safely.

Operators can explore available bundles through the interactive
[toolkit browser](toolkit-browser.md), which supports search and filtering by
category and tags before jumping into specific documentation.

## Quick start for contributors

1. Read [architecture](architecture.md) for a refresher on the Toolbox control
   plane, worker, App Shell, and the dynamic bundler.
2. Follow the author checklist in [toolkit authoring](toolkit-authoring.md) and
   the test plan in [testing](testing.md).
3. Keep the manifest rules in [catalog maintenance](catalog.md) handy when
   updating `catalog/toolkits.json`.
4. Use [dynamic bundler operations](bundler.md) to run or verify the on-demand
   packaging service locally.
5. New maintainers can follow [onboarding](onboarding.md) to configure a lean
   workspace quickly.

## Required validations

Run these commands from the repository root before submitting a pull request or
publishing documentation:

```bash
scripts/sync_toolkit_assets.py
scripts/validate_catalog.py --strict
scripts/validate-repo.sh
mkdocs build --strict --clean --site-dir site
```

## Submission checklist

- [ ] Toolkit directory follows `toolkits/<slug>/` layout with backend, worker,
      frontend, and docs assets as required.
- [ ] `toolkits/<slug>/docs/README.md`, `RELEASE_NOTES.md`, `TESTING.md`, and
      `CHANGELOG.md` are current and referenced in the manifest.
- [ ] `catalog/toolkits.json` entry updated with the correct `bundle_url`
      (`toolkits/<slug>/bundle.zip`) and `docs_url` (`toolkits/<slug>/`).
- [ ] Dynamic bundler verified with `curl` or `httpie` against the local
      `toolkit_bundle_service.py` instance.
- [ ] Evidence from [testing](testing.md) attached to the pull request.

Refer to the [task backlog](TODO.yml) for outstanding tasks and future
automation ideas.
