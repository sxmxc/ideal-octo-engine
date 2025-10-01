# Subnet Calculator toolkit

The Subnet Calculator helps operators inspect IPv4 ranges and publish a reusable prefix cheat sheet. The bundle ships API
endpoints, Celery helpers, and a React interface with dedicated pages for the calculator workflow and the static reference table.

## Bundle contents

- FastAPI router mounted at `/toolkits/subnet-cheatsheet` with endpoints for ad-hoc subnet summaries and prefix tables.
- Celery helpers that expose the same calculations for asynchronous workflows.
- Lightweight React interface with navigation between the calculator form and the ready-to-share prefix table.
- In-app documentation links that jump directly to the calculator and prefix reference guides published under
  `docs/toolkits/subnet-cheatsheet/`.

## Validation checklist

1. Confirm `toolkits/subnet-cheatsheet/toolkit.json` references the backend router, worker registration, and frontend entry point.
2. Run repository validations:
   ```bash
   python scripts/sync_toolkit_assets.py --slug subnet-cheatsheet
   python scripts/validate_catalog.py --strict --toolkit subnet-cheatsheet
   scripts/validate-toolkit.sh subnet-cheatsheet
   scripts/validate-repo.sh
   ```
3. Launch the bundler locally and verify the generated archive:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   curl -I http://localhost:8002/toolkits/subnet-cheatsheet/bundle.zip
   curl http://localhost:8002/toolkits/subnet-cheatsheet/bundle.zip -o /tmp/subnet-cheatsheet.zip
   unzip -t /tmp/subnet-cheatsheet.zip
   ```
4. Walk through the scenarios in `toolkits/subnet-cheatsheet/docs/TESTING.md`.
5. Document operator-facing changes in `toolkits/subnet-cheatsheet/docs/RELEASE_NOTES.md` before requesting a catalog update.

## Operator runbook

1. Download the bundle from the community catalog or your preferred mirror.
2. Upload it through the Toolbox admin UI.
3. Call `/toolkits/subnet-cheatsheet/summary?cidr=192.168.1.0/24` to confirm the API responds with the expected subnet details.
4. Visit `/toolkits/subnet-cheatsheet` and validate both UI surfaces:
   - Calculator page – run CIDR queries, export JSON, and inspect job links.
   - Prefix cheat sheet – share the pre-generated table with localised copy.
5. Review documentation links in the dashboard card to ensure they open the calculator and prefix reference articles bundled on
   the documentation site.
