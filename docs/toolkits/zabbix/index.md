---
title: Zabbix toolkit
---

<!-- This file is auto-generated from toolkits/zabbix/docs/README.md. -->

# Zabbix toolkit

The Zabbix toolkit streamlines Zabbix API automation inside Toolbox. It ships
FastAPI routers for instance management, catalog-backed job templates, Celery
workers for bulk operations, and a React dashboard for queue monitoring.

## Validate before publishing

1. Confirm `toolkits/zabbix/toolkit.json` metadata (slug, description, dashboard
   card) matches the release.
2. Rebuild the frontend bundle following `docs/BUILDING.md` so
   `frontend/dist/index.js` is current.
3. Execute workflow checks in `docs/TESTING.md`, including API smoke tests and
   worker job validation.
4. Start the dynamic bundler and download
   `GET /toolkits/zabbix/bundle.zip`; verify the archive with `unzip -t`.
5. Summarise notable changes in `docs/RELEASE_NOTES.md` prior to catalog
   publication.

## Runtime expectations

- Instance CRUD and action endpoints live under `/toolkits/zabbix` and map to
  the storage and client helpers in `backend/`.
- Celery registration in `worker/tasks.py` handles bulk host imports, exports,
  and database scripts while streaming progress to operators.
- Catalog metadata under `backend/catalog.py` drives dropdowns and guardrails in
  the React UI.
- Installation surfaces a dashboard card linking to `/toolkits/zabbix` inside
  the Toolbox App Shell.

## Operator checklist

1. Install the packaged bundle through the admin UI or `/toolkits/install` API.
2. Register a Zabbix instance and validate credentials via the "Test connection"
   action.
3. Run a bulk host dry run to verify catalog data and validation messages.
4. Queue a bulk export job and monitor job logs until completion.
5. Capture operational notes and update release evidence as needed.
