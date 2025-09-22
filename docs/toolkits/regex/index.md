---
title: Regex toolkit
---

<!-- This file is auto-generated from toolkits/regex/docs/README.md. -->

# Regex toolkit

This bundle exposes the regex playground runtime for Toolbox operators. It
ships FastAPI routes, Celery registration hooks, and optional React UI assets in
the `frontend/` directory. Use it as an integration reference when validating
pattern-driven diagnostics inside your Toolbox instance.

## Validate before publishing

1. Confirm the manifest fields in `toolkits/regex/toolkit.json` are up to date
   (version, description, catalog metadata).
2. Run the dynamic bundler locally and request `GET /toolkits/regex/bundle.zip`
   to ensure a `200 OK` response with a valid ZIP payload:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   curl -i http://localhost:8002/toolkits/regex/bundle.zip -o /tmp/regex.zip
   unzip -l /tmp/regex.zip | grep regex/frontend
   ```
3. Execute the smoke tests documented in `toolkits/regex/docs/TESTING.md`.
4. Record release notes in `toolkits/regex/docs/RELEASE_NOTES.md` before
   requesting catalog publication.

## Runtime expectations

- FastAPI router is mounted under `/toolkits/regex` and accepts evaluation
  requests via POST; see `backend/app.py`.
- Celery worker integration ensures long-running evaluations emit progress
  updates.
- React UI in `frontend/` renders the interactive playground when deployed to
  the Toolbox shell.

## Operator checklist

1. Install or update the toolkit through the Toolbox admin UI.
2. Open the playground panel and verify client-side evaluation executes.
3. Monitor worker logs for streaming progress events while testing complex
   expressions.
4. Update the catalog entry by running `python scripts/sync_toolkit_assets.py
   --slug regex` before publishing.
