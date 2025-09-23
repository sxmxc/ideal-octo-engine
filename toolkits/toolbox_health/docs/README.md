# Toolbox Health toolkit

Toolbox Health collects liveness, readiness, and dependency telemetry for the
core Toolbox services. It bundles FastAPI endpoints for on-demand snapshots,
Celery tasks that refresh cached data, and a React dashboard that surfaces
component status.

## Validate before publishing

1. Review `toolkits/toolbox_health/toolkit.json` to confirm metadata and
   dashboard copy reflect the release.
2. Rebuild the frontend artefact as described in `docs/BUILDING.md` so
   `frontend/dist/index.js` is current.
3. Run the checks in `docs/TESTING.md` to verify API responses, worker refresh
   tasks, and UI components.
4. Start the dynamic bundler and retrieve
   `GET /toolkits/toolbox_health/bundle.zip`; inspect the archive with
   `unzip -t`.
5. Document noteworthy updates in `docs/RELEASE_NOTES.md` before requesting
   catalog publication.

## Runtime expectations

- FastAPI routes under `/toolkits/toolbox-health/health` serve component and
  summary payloads sourced from `backend/health.py`.
- Celery registration in `worker/tasks.py` schedules periodic refresh jobs to
  keep cached snapshots warm.
- Dashboard context defined in `backend/dashboard.py` powers the React widgets
  bundled in `frontend/`.
- Installation adds a dashboard card linking to `/toolkits/toolbox-health` in
  the Toolbox UI.

## Operator checklist

1. Install the bundle via the admin UI or `/toolkits/install` API.
2. Confirm the dashboard card renders and displays component status.
3. Call `/toolkits/toolbox-health/health/summary?force_refresh=true` to validate
  backend refresh logic.
4. Review Celery worker logs for refresh job execution and ensure metrics align
  with expectations.
5. Capture findings and roll them into operational runbooks as needed.
