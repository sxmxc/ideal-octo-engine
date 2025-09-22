# Agent Guidelines

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
