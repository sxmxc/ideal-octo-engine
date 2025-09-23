# Testing checklist – API Checker

1. Build the frontend bundle using `pnpm exec esbuild` or your preferred tool so
   `frontend/dist/index.js` exists (see `docs/BUILDING.md`).
2. Run backend tests:
   ```bash
   pytest toolkits/api_checker/tests
   ```
3. Start the dynamic bundler and download the archive:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   curl -fLo /tmp/api-checker.zip http://localhost:8002/toolkits/api_checker/bundle.zip
   unzip -t /tmp/api-checker.zip
   ```
4. Upload `/tmp/api-checker.zip` through the Toolbox admin UI.
5. Issue a sample request via the UI or POST `/toolkits/api-checker/requests`
   with the payload from `backend/app.py` to confirm a `200 OK` response.
6. Inspect the worker/job logs to ensure long-running requests append progress
   entries when using queued jobs.
