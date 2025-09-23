# Latency Sleuth toolkit

Latency Sleuth provisions synthetic HTTP probes so SREs can model latency
expectations, rehearse incident response, and tune SLAs before rollout. The
bundle ships FastAPI routes for managing probe templates, Celery tasks for
scheduled executions, and a React dashboard that highlights trends.

## Validate before publishing

1. Review metadata in `toolkits/latency_sleuth/toolkit.json` (version,
   timestamps, dashboard details) and bump them as part of the release.
2. Rebuild the frontend bundle as documented in `docs/BUILDING.md` so
   `frontend/dist/index.js` is current.
3. Run automated tests listed in `docs/TESTING.md` to confirm backend, worker,
   and dashboard components behave as expected.
4. Start the dynamic bundler and download
   `GET /toolkits/latency_sleuth/bundle.zip`; verify the archive with
   `unzip -t`.
5. Capture notable changes in `docs/RELEASE_NOTES.md` before requesting
   publication to the community catalog.

## Runtime expectations

- Probe templates expose CRUD endpoints and live scheduling metadata via the
  FastAPI router in `backend/app.py`.
- Celery tasks defined in `worker/tasks.py` queue probe runs, stream logs, and
  refresh cached telemetry snapshots.
- Dashboard context from `backend/dashboard.py` powers the React UI so operators
  can visualise breach streaks and SLA adherence.
- Bundled assets mount under `/toolkits/latency-sleuth` within the Toolbox App
  Shell once the toolkit installs successfully.

## Operator checklist

1. Upload the packaged bundle through **Administration → Toolkits** or automate
   installation via `/toolkits/install`.
2. Create a probe template with the desired target URL, SLA, interval, and
   notification policy.
3. Monitor the **Job Logs** panel to confirm scheduled runs emit progress and
   results.
4. Review the **Latency heatmap** dashboard to spot performance drift or chronic
   breaches.
5. Update rollback instructions and alert routing whenever SLAs change.
