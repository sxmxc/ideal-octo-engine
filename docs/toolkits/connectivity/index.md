---
title: Connectivity toolkit
---

<!-- This file is auto-generated from toolkits/connectivity/docs/README.md. -->

# Connectivity toolkit

The Bulk Connectivity Checker manages groups of hosts and probes them on demand
or via queued jobs. It packages FastAPI endpoints for CRUD operations, Celery
handlers for scheduled probes, and a React dashboard for reviewing reachability
trends.

## Validate before publishing

1. Review `toolkits/connectivity/toolkit.json` for accurate metadata and
   dashboard card copy.
2. Rebuild the frontend artefact as outlined in `docs/BUILDING.md` so
   `frontend/dist/index.js` reflects the latest UI.
3. Run linting and tests if present, then execute targeted smoke checks listed
   in `docs/TESTING.md`.
4. Start the dynamic bundler and download
   `GET /toolkits/connectivity/bundle.zip`, ensuring the archive validates with
   `unzip -t`.
5. Summarise notable behaviour in `docs/RELEASE_NOTES.md` prior to
   publication.

## Runtime expectations

- Targets live in the embedded SQLite store defined in `backend/storage.py` and
  expose CRUD routes under `/toolkits/connectivity/targets`.
- Ad-hoc probes simulate TCP reachability, returning latency and status data.
- Long-running checks enqueue `connectivity.bulk_probe` jobs so operators can
  monitor progress from the Toolbox job console.
- Dashboard context in `backend/dashboard.py` powers the overview cards inside
  the React UI shipped with the bundle.

## Operator checklist

1. Install the bundle via the admin UI or the `/toolkits/install` endpoint.
2. Define a connectivity target with at least one host/port pair.
3. Run a preview check and confirm summary statistics render in the UI.
4. Launch a queued check and verify logs stream as each host completes.
5. Review historical results to ensure dashboards display the expected rollups.
