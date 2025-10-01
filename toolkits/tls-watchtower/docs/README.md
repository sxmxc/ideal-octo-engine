# TLS Watchtower toolkit

TLS Watchtower monitors SSL/TLS certificates for a curated list of lab hosts and
any endpoints that operators register on demand. It ships FastAPI routes for
managing scans, Celery jobs for scheduled sweeps and retries, and a React panel
that visualises approaching expirations with red/yellow/green bands.

## Validate before publishing

1. Review `toolkits/tls-watchtower/toolkit.json` for accurate metadata and
   dashboard copy.
2. Rebuild the frontend artefact per `docs/BUILDING.md` so
   `frontend/dist/index.js` aligns with the React source.
3. Run `scripts/validate-repo.sh` from the repository root; it regenerates the
   catalog, syncs documentation, and exercises schema validation.
4. Verify `POST /toolkits/tls-watchtower/scan` accepts a host payload and
   returns updated expiry metadata.
5. Confirm the seeded hosts `edge-critical.example` and
   `staging-gateway.example` render with the expected warning and critical
   severities in the UI.
6. Record smoke-check notes in `docs/TESTING.md` before publishing the bundle.

## Runtime expectations

- The backend keeps certificate state in memory via
  `toolkits/tls-watchtower/backend/state.py`, seeding two deterministic hosts so
  reviewers can validate the UI without external dependencies.
- `/toolkits/tls-watchtower/hosts` returns the current inventory ordered by time
  to expiration, while `/toolkits/tls-watchtower/expiry/{host}` surfaces a single
  record.
- `POST /toolkits/tls-watchtower/scan` triggers a recomputation for ad-hoc
  scans, using hashed host values to create deterministic pseudo-expirations for
  new entries.
- Celery tasks `tls-watchtower.daily_sweep` and `tls-watchtower.retry_scan`
  power scheduled sweeps and manual rechecks through the Toolbox job console.
- The React panel displays aggregated counts, refresh controls, and recent scan
  history for each host so operators can confirm rotation plans.

## Operator checklist

1. Install the bundle from the Toolbox catalog UI or via the
   `/toolkits/install` endpoint.
2. Load the TLS Watchtower panel and confirm the seeded hosts display
   immediately.
3. Trigger a manual scan against a new hostname using the REST API and verify it
   appears in the dashboard.
4. Queue `tls-watchtower.daily_sweep` from the job console and confirm histories
   update with the latest timestamps.
5. Review renewal messaging with stakeholders before acting on any red status.
