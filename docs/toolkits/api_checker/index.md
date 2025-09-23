---
title: API Checker toolkit
---

<!-- This file is auto-generated from toolkits/api_checker/docs/README.md. -->

# API Checker toolkit

API Checker lets operators craft HTTP requests, attach auth headers, and inspect
responses without leaving Toolbox. The bundle ships FastAPI routes under
`/toolkits/api_checker`, a Celery-friendly job helper, and a React UI panel for
interactive exploration.

## Validate before publishing

1. Confirm metadata in `toolkits/api_checker/toolkit.json` reflects the release
   you are preparing (slug, description, and dashboard card copy).
2. Build the frontend bundle as described in `docs/BUILDING.md` so
   `frontend/dist/index.js` is up to date.
3. Run the backend tests: `pytest toolkits/api_checker/tests`.
4. Start the dynamic bundler and request
   `GET /toolkits/api_checker/bundle.zip` to ensure a valid archive is served.
5. Capture test evidence in `docs/TESTING.md` and document highlights in
   `docs/RELEASE_NOTES.md` before requesting publication.

## Runtime expectations

- FastAPI router exposes `/requests` for executing HTTP calls and normalising
  headers, authentication, and payloads.
- Response bodies larger than 64 KiB are truncated; the JSON preview and raw
  payload are included when applicable.
- Jobs can be enqueued through `toolkit_runtime.enqueue_job` for long-running
  probes; the UI streams progress from the backend utilities in `backend/app.py`.
- The React panel renders under `/toolkits/api_checker` inside the Toolbox shell
  once the bundle is installed.

## Operator checklist

1. Upload the bundle through **Administration → Toolkits** or call the
   `/toolkits/install` API.
2. Use the "New request" workflow to issue a sample request against a
   staging endpoint.
3. Verify redirects, bearer tokens, and custom headers behave as expected.
4. Share captured responses or logs with teammates and record any findings in
   your change tracking system.
