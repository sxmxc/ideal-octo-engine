# Contributor onboarding

Follow these steps when you join the SRE Toolbox community catalog project.

## Environment setup

1. Install Python 3.11+, Node 18+, and mkdocs-material (optional for previews).
2. Clone the repository with sparse checkout:
   ```bash
   git clone --filter=blob:none --sparse <repo-url>
   cd ideal-octo-engine
   git sparse-checkout init --cone
   git sparse-checkout set docs catalog scripts toolkit_bundle_service.py
   ```
3. Add specific toolkits as needed:
   ```bash
   git sparse-checkout add toolkits/<slug>
   ```

## Local services

1. Start the Toolbox runtime components (control plane, worker, App Shell) from
   the main Toolbox repository.
2. Run the dynamic bundler from this repo:
   ```bash
   uvicorn toolkit_bundle_service:application --reload --port 8002
   ```

## Daily workflow

1. Sync toolkit docs and metadata before committing:
   ```bash
   python scripts/sync_toolkit_assets.py --slug <slug>
   ```
2. Execute validation scripts:
   ```bash
   python scripts/validate_catalog.py --strict --toolkit <slug>
   scripts/validate-toolkit.sh <slug>
   scripts/validate-repo.sh
   ```
3. Build the documentation site locally:
   ```bash
   mkdocs serve --strict
   ```
4. Capture test evidence and link it in the pull request template.

## Communication channels

- Use GitHub issues for questions and feature requests.
- Document decisions in `docs/backlog.md` so future sessions understand current
  priorities.
