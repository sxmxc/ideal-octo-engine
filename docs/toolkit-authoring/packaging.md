# Toolkit packaging guide

Once your toolkit implementation is ready, follow the steps below to bundle it for review and publication.

## 1. Update metadata

- Ensure `toolkits/<slug>/toolkit.json` is complete and versioned.
- Add or update the corresponding entry in `catalog/toolkits.json` (keep entries sorted alphabetically by slug). Include `docs_url` (for example, `"<slug>/"`), a `bundle_url` pointing to `toolkits/<slug>/bundle/`, and at least one `categories` value so the browse experience can surface your toolkit.
- Provide changelog context in `docs/changelog.md` when releasing updates.

## 2. Validate locally

Run the provided helper to cross-check manifests and catalog metadata:

```bash
scripts/validate-toolkit.sh <slug>
```

Resolve any reported issues before continuing. For stricter checks (manifest schema, documentation coverage), Codex maintainers can extend `scripts/validate_catalog.py`.

## 3. Package the bundle

Use the packaging script to create a versioned zip archive under `dist/`:

```bash
scripts/package-toolkit.sh <slug>
```

Attach the resulting zip to your pull request. Reviewers will attempt installation inside a Toolbox environment.

## 4. Document the release

- Keep `toolkits/<slug>/README.md` current and run `scripts/sync_toolkit_assets.py --slug <slug>`; the helper mirrors it to `docs/<slug>/index.md` and refreshes the bundle placeholder under `docs/toolkits/<slug>/` so the documentation site stays fresh.
- Provide operator-focused documentation under `toolkits/<slug>/docs/` (runbook, troubleshooting, FAQ).
- Complete the security review questionnaire (`docs/governance/security-review.md`) and attach it to the PR.

## 5. Submit for review

Open a pull request and include the following in the description:

- Summary of the change and motivation.
- Validation output from steps 2 and 3.
- Links to related issues or discussions.
- Any known limitations or follow-up work.

Maintainers will verify the bundle, run security checks, and merge once the toolkit meets quality, documentation, and governance requirements.
