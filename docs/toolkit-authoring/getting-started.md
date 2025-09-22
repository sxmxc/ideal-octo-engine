# Toolkit authoring – getting started

This guide helps you bootstrap a new toolkit for the SRE Toolbox community repository.

## Prerequisites

- Local checkout of this repository with Python 3.11+ and Node 18+ available.
- Access to a running Toolbox environment for manual validation.
- Familiarity with the platform architecture (`docs/runtime-architecture.md` in the main Toolbox repository).

## Workflow overview

1. Clone this repository and create a new branch (`toolkit/<slug>-bootstrap`).
2. Copy `toolkits/sample-toolkit/` as a starting point (`cp -R sample-toolkit <your-slug>`).
3. Update `toolkit.json` with your toolkit slug, name, version, and entry points.
4. Implement backend, worker, and frontend modules as needed.
5. Document configuration, runbooks, and limitations under `toolkits/<slug>/docs/`, and draft the public overview page at `docs/<slug>/index.md` so users can browse your toolkit without cloning the repository.
6. Run `scripts/validate-toolkit.sh <slug>` and address any findings.
7. Run integration tests within a Toolbox environment.
8. Submit a PR with the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.

## Directory layout

```
toolkits/<slug>/
├── toolkit.json      # Manifest consumed by the Toolbox loader
├── backend/          # FastAPI routers, dependencies, and services (optional)
├── worker/           # Celery task registration and helpers (optional)
├── frontend/         # React components and routes (optional)
└── docs/             # Toolkit-specific documentation
```

Keep unused runtime directories absent to reduce bundle size.

## Coding guidelines

- Follow the conventions in the main Toolbox repository for logging, telemetry, and API design.
- Provide defensive input validation for any operator-supplied data.
- Surface clear progress updates through Celery/Redis so operators receive live feedback.
- Include automated tests where feasible (pytest for backend/worker, vitest for frontend).

## Next steps

Continue with `docs/toolkit-authoring/packaging.md` to prepare the installable bundle and update the public catalog.
