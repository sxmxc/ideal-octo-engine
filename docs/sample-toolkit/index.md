---
title: Sample Diagnostics Toolkit
---

<!-- This file is auto-generated from toolkits/sample-toolkit/docs/README.md. -->

# Sample Diagnostics Toolkit

This toolkit demonstrates repository conventions for backend, worker, and frontend integration.

## Features

- FastAPI route at `/toolkits/sample/health` for installation smoke tests.
- Celery task `sample-toolkit.run_diagnostics` returning a static diagnostic payload.
- Minimal React panel confirming frontend mounting.

## Installation

1. Package the toolkit:
   ```bash
   scripts/package-toolkit.sh sample-toolkit
   ```
2. Upload the generated zip (`dist/sample-toolkit-<date>.zip`) through the Toolbox Admin → Toolkits UI.
3. Verify the `/toolkits/sample/health` endpoint returns a 200 status.

## Configuration

No runtime configuration is required. Use this toolkit as a scaffold when authoring your own bundles.
