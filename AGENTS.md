# Agent Guidelines

**Source of Truth**  
- Master agent prompt: `ai/ops/codex.md`  
- Architecture reference: `docs/toolbox-architecture.md` (pair with `docs/runtime-architecture.md`)  
- Schema reference: `docs/toolbox-schema.md`  
- Task list: `docs/TODO.yaml`  
- Machine state: `ai/state/progress.json`  
- Journal: `ai/state/journal.md`

**Agents**
- **codex (work orchestrator):** Reads context, uses context7 mcp, selects next task from `docs/TODO.yml`, updates state + journal each session.

**Run Loop (every session)**
1. Read: `docs/architecture.md`, `docs/architecture.md`, `docs/assets/README`,`docs/toolkits/sample-toolkit/index.md`,`docs/bundler.md`, `ai/context/context.md`, `docs/TODO.yml`, `ai/state/progress.json`, `ai/state/journal.md`.  
2. Pick highest-priority task with no unmet deps. If tasks are blank, generate basic structure and populate with discovered tasks.
3. Plan ≤500-line PR, test-first.  
4. Implement.
5. Update `docs/TODO.yml`, `ai/state/progress.json`, `ai/state/journal.md`; open PR.
6. Provide branch name. Commit message. And the PR details following contribution and pr standards. Provide PR details in copyable MD form.

Welcome! Please follow these conventions whenever you modify files in this repository.

## Repository-wide expectations
- Prefer small, focused commits with descriptive messages.
- Keep documentation in Markdown unless a build step requires HTML output.
- When touching automation under `.github/workflows/`, preserve existing job names and required permissions.

## Required checks
Before opening a pull request or concluding work in this environment, run the following commands from the repository root and ensure they succeed:

```bash
scripts/validate-repo.sh
mkdocs build --strict --clean --site-dir site
```

These checks keep the catalog metadata synchronized and confirm the documentation site builds without warnings. If you add new automated checks, update this list accordingly.

## Documentation style
- Organize new documentation under `docs/` and include it in the MkDocs navigation (`mkdocs.yml`) when appropriate.
- Use relative links between documentation pages; avoid hard-coding absolute GitHub URLs unless necessary.
- Favor sentence case for headings and keep introductory paragraphs short and action-oriented.

Thanks for helping maintain the SRE Toolbox community catalog!

> Canonical content lives in `ai/ops/codex.md`. Update that file only; this page is a directory.
