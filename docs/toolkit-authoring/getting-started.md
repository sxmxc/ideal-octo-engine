# Toolkit authoring – getting started

This guide helps you bootstrap a new toolkit for the SRE Toolbox community repository.

## Prerequisites

- Local checkout of this repository with Python 3.11+ and Node 18+ available.
- Access to a running Toolbox environment for manual validation.
- Familiarity with the platform architecture (`docs/runtime-architecture.md` in the main Toolbox repository).

## Clone only the directories you need

The community catalog grows quickly, so you do not need to populate every toolkit when you first clone the repository. Git's sparse checkout mode keeps your working tree lean and lets you opt in to specific toolkits on demand.

```bash
git clone --filter=blob:none --sparse <repo-url>
cd ideal-octo-engine
git sparse-checkout init --cone
git sparse-checkout set docs catalog scripts
```

When you are ready to work on a toolkit, materialize it with:

```bash
git sparse-checkout add toolkits/<slug>
```

Repeat the `add` command for any additional toolkits you need. To remove paths you no longer want locally, re-run `git sparse-checkout set` with the directories you wish to keep.

For a one-command setup, run `scripts/setup-sparse-checkout.sh`. It initializes sparse checkout (if necessary), keeps the default `docs`, `catalog`, and `scripts` directories, and accepts `--toolkit <slug>` for each toolkit you want to include:

```bash
scripts/setup-sparse-checkout.sh --toolkit sample-toolkit
```

Use `--include <path>` to keep additional files or directories, or `--no-defaults` if you prefer to specify every path yourself. Run `scripts/setup-sparse-checkout.sh --help` to see all options.

### Add a toolkit that already exists elsewhere

If you've already built a toolkit in another repository and just need to stage it here, you can keep the checkout minimal and create a fresh directory for your slug without downloading every existing community toolkit.

1. Clone the repository with sparse checkout limited to docs, catalog metadata, and helper scripts:

   ```bash
   git clone --filter=blob:none --sparse <repo-url>
   cd ideal-octo-engine
   git sparse-checkout init --cone
   git sparse-checkout set docs catalog scripts
   ```

2. Create the directory that will hold your toolkit and copy or move your existing files into it:

   ```bash
   mkdir -p toolkits/<slug>
   cp -R /path/to/your/toolkit/* toolkits/<slug>/
   ```

   The new folder is part of your working tree even though other toolkits remain excluded. When you run `git status`, your toolkit files appear as untracked changes ready for commit.

To automate the same flow, run `scripts/setup-sparse-checkout.sh --new-toolkit <slug>`. The script prepares sparse checkout with the default directories and ensures `toolkits/<slug>/` exists so you can immediately populate it with your implementation.

## Workflow overview

1. Clone this repository and create a new branch (`toolkit/<slug>-bootstrap`).
2. Copy `toolkits/sample-toolkit/` as a starting point (`cp -R sample-toolkit <your-slug>`).
3. Update `toolkit.json` with your toolkit slug, name, version, and entry points.
4. Implement backend, worker, and frontend modules as needed.
5. Document configuration, runbooks, and limitations under `toolkits/<slug>/docs/`. Keep `toolkits/<slug>/docs/README.md` current, define catalog metadata (categories, maintainers, and any overrides) in the optional `catalog` section of `toolkits/<slug>/toolkit.json`, and run `scripts/sync_toolkit_assets.py --slug <slug>` to regenerate the public overview at `docs/<slug>/index.md`, refresh the bundle assets under `docs/toolkits/<slug>/`, and sync `catalog/toolkits.json` so users can browse your toolkit without cloning the repository.
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
