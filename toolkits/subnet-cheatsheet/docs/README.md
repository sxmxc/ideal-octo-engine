# Subnet Calculator toolkit

The subnet calculator toolkit gives operators a quick way to inspect IPv4
subnets and share an accompanying prefix cheat sheet. Use the built-in API to
calculate ranges for ad-hoc troubleshooting or schedule the bundled Celery tasks
when you want fresh data in dashboards.

## What ships in the bundle

- FastAPI router mounted at `/toolkits/subnet-cheatsheet` with endpoints for
  ad-hoc subnet summaries and prefix tables.
- Celery helpers that expose the same calculations for asynchronous workflows.
- Lightweight React panel that renders a lookup form together with a
  ready-to-share prefix table.

## Validate the bundle

1. Ensure `toolkits/subnet-cheatsheet/toolkit.json` has the version you intend
   to release and references each runtime entry point.
2. Launch the bundler locally and download the generated archive:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   curl -I http://localhost:8002/toolkits/subnet-cheatsheet/bundle.zip
   curl http://localhost:8002/toolkits/subnet-cheatsheet/bundle.zip -o /tmp/subnet-cheatsheet.zip
   unzip -t /tmp/subnet-cheatsheet.zip
   ```
3. Walk through the tests listed in `toolkits/subnet-cheatsheet/docs/TESTING.md`.
4. Document operator-facing changes in
   `toolkits/subnet-cheatsheet/docs/RELEASE_NOTES.md` before requesting a
   catalog update.

## Operator runbook

1. Download the bundle from the community catalog or your preferred mirror.
2. Upload it through the Toolbox admin UI.
3. Call `/toolkits/subnet-cheatsheet/summary?cidr=192.168.1.0/24` to confirm the
   API responds with the expected subnet details.
4. Visit the App Shell dashboard card to confirm the calculator panel renders.
