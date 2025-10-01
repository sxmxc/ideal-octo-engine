# TLS Watchtower changelog

## [0.1.0] - 2025-10-01

- Initial release with seeded lab hosts, deterministic expiry simulator, and
  React dashboard.
- Added FastAPI routes for listing, fetching, and scanning certificates.
- Registered Celery tasks for daily sweeps and manual retries.
