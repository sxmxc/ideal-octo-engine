# Testing TLS Watchtower

Use this checklist to capture manual validation notes each time the bundle is
updated.

## Smoke checks

- [ ] `POST /toolkits/tls-watchtower/scan` with `{ "host": "edge-critical.example" }`
      returns a critical status and updates the timestamp.
- [ ] `POST /toolkits/tls-watchtower/scan` with a new hostname returns a
      deterministic expiry and adds the host to `/hosts` responses.
- [ ] Trigger `tls-watchtower.daily_sweep` and confirm the seeded hosts keep
      their expected severity bands.
- [ ] Load the React panel and verify the critical/warning counters and history
      list update after a manual scan.

## Observability

- Document log excerpts or screenshots that demonstrate certificate sweeps when
  running the toolkit against a live Toolbox environment.
- Capture any follow-up tickets in this file if expiry parsing fails or requires
  integration with external certificate stores.
