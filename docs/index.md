---
title: SRE Toolbox Catalog
---

# SRE Toolbox Community Catalog

Welcome to the public landing page for the SRE Toolbox community repository. This site highlights vetted toolkits and collects documentation for authors, reviewers, and operators who rely on the platform.

## Explore the catalog

- [Sample Diagnostics Toolkit](sample-toolkit/)
- [Download the machine-readable catalog]({{ raw_catalog_url }})
- [Browse the repository on GitHub]({{ repo_url }})

## Documentation for contributors

- [Repository structure](structure.md)
- [Toolkit authoring – getting started](toolkit-authoring/getting-started.md)
- [Packaging checklist](toolkit-authoring/packaging.md)
- [Contribution process](governance/contribution-process.md)
- [Security review guidelines](governance/security-review.md)

## Automation helpers

Package and validate toolkits with the scripts included in this repository:

```bash
scripts/validate-repo.sh
scripts/package-toolkit.sh <slug>
```

See the [scripts directory]({{ repo_url }}/tree/main/scripts) for additional helpers and usage details.
