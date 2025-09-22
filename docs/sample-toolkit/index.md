---
title: Sample Diagnostics Toolkit
---

# Sample Diagnostics Toolkit

The Sample Diagnostics Toolkit acts as a reference implementation for community contributors. It demonstrates the expected bundle layout and runtime entry points used by SRE Toolbox installations.

## Runtime components

- **Backend** – Exposes `/toolkits/sample/health` for smoke testing.
- **Worker** – Registers the `sample-toolkit.run_diagnostics` Celery task, which emits a static success payload.
- **Frontend** – Renders a minimal panel that confirms the bundle mounted correctly.

## Installation and packaging

1. Clone the repository and ensure Python 3.11+ is available.
2. Package the toolkit:
   ```bash
   scripts/package-toolkit.sh sample-toolkit
   ```
3. Upload the generated zip (`dist/sample-toolkit-<date>.zip`) through the Toolbox Admin → Toolkits UI.
4. Verify the `/toolkits/sample/health` endpoint returns HTTP 200 with status `ok`.

The toolkit manifest is available at [`toolkits/sample-toolkit/toolkit.json`]({{ repo_url }}/blob/main/toolkits/sample-toolkit/toolkit.json).

## Maintenance

The toolkit is maintained by the SRE Toolbox core team and should remain stable. Use it as a scaffold when authoring new toolkits and update documentation to reflect best practices.
