# Contributing to the SRE Toolbox Community Repository

Thanks for your interest in contributing! This guide describes how to propose toolkits, documentation updates, or automation improvements.

## Ways to contribute

- **Publish a toolkit** – Follow `docs/toolkit-authoring/packaging.md` to prepare a bundle and submit it under `toolkits/`.
- **Improve documentation** – Update files under `docs/` to clarify toolkit authoring, governance, or onboarding workflows.
- **Enhance automation** – Refine scripts, CI workflows, or Codex automation prompts.

## Contribution workflow

1. **Discuss** – For significant changes, open a discussion or issue to gather feedback first.
2. **Fork & branch** – Create a topic branch in your fork (`toolkit/<slug>-<change>`).
3. **Develop test-first** – Add or update tests and validation scripts before making behavioural changes.
4. **Validate** – Run `scripts/validate-toolkit.sh` (or the relevant automation) and capture output in your PR description.
5. **Document** – Update README files, changelogs, and catalog metadata as needed.
   - Keep `toolkits/<slug>/README.md` current; reviewers treat it as the
     canonical install guide. Define public listing details (categories,
     maintainers, alternate descriptions) in the optional `catalog` section of
     `toolkits/<slug>/toolkit.json` and run `scripts/sync_toolkit_assets.py --slug
     <slug>` to mirror updates to `docs/<slug>/index.md`, refresh the bundle
     placeholder, and sync `catalog/toolkits.json` for the browse experience.
6. **Submit** – Open a PR using the template in `.github/PULL_REQUEST_TEMPLATE.md`.
7. **Review** – Address reviewer feedback promptly. Maintainers will verify packaging, security expectations, and documentation coverage.

## Toolkit submission checklist

- [ ] Toolkit directory follows `toolkits/<slug>/` layout with `toolkit.json` and optional runtime modules.
- [ ] Bundle builds with `scripts/package-toolkit.sh <slug>`.
- [ ] `toolkits/<slug>/toolkit.json` includes any required `catalog`
      overrides (categories, maintainers, public tags, description tweaks).
- [ ] `scripts/sync_toolkit_assets.py --slug <slug>` has been run so
      `catalog/toolkits.json` reflects the toolkit with accurate version,
      `docs_url`, `bundle_url`, tags, and categories.
- [ ] Documentation under `toolkits/<slug>/docs/` covers installation, configuration, and known limitations.
- [ ] Public docs exist at `docs/<slug>/index.md` (regenerate with
      `scripts/sync_toolkit_assets.py --slug <slug>`) and are linked from the
      MkDocs navigation.
- [ ] Security review questionnaire (`docs/governance/security-review.md`) is attached to the PR.

## Coding standards

- Backend Python code uses `ruff` and `pytest` for linting/tests.
- Frontend TypeScript/React code uses `eslint` and `vitest`.
- Worker tasks should include integration or smoke tests where feasible.
- Follow the existing project conventions for logging, configuration, and telemetry.

## License

Unless stated otherwise, contributions are licensed under the Apache 2.0 License. See `LICENSE` for details.
