# Testing checklist – Toolbox Health

1. Rebuild the frontend bundle (see `docs/BUILDING.md`) so
   `frontend/dist/index.js` is current.
2. Package the toolkit and retrieve the bundle from the dynamic bundler:
   ```bash
   scripts/package-toolkit.sh toolbox_health
   curl -fLo /tmp/toolbox-health.zip http://localhost:8002/toolkits/toolbox_health/bundle.zip
   unzip -t /tmp/toolbox-health.zip
   ```
3. Install the archive via the admin UI and open the Toolbox Health dashboard.
4. Call the summary endpoint with a forced refresh:
   ```bash
   curl "http://localhost:8000/toolkits/toolbox-health/health/summary?force_refresh=true"
   ```
   Confirm the response includes component entries with `status` and
   `latency_ms` fields.
5. Inspect Celery worker logs to ensure the scheduled refresh task executes and
   logs success.
6. Capture screenshots or terminal output and attach them to the release
   evidence.
