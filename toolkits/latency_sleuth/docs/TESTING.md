# Testing checklist – Latency Sleuth

1. Rebuild the frontend bundle (see `docs/BUILDING.md`) so
   `frontend/dist/index.js` is fresh.
2. Run backend and worker tests:
   ```bash
   pytest toolkits/latency_sleuth/tests
   ```
3. Start the dynamic bundler and download the archive:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   curl -fLo /tmp/latency-sleuth.zip http://localhost:8002/toolkits/latency_sleuth/bundle.zip
   unzip -t /tmp/latency-sleuth.zip
   ```
4. Install the bundle through the Toolbox admin UI.
5. Create a probe template and trigger a manual execution; confirm the
   FastAPI endpoint responds with a `200 OK` and the job appears in the worker
   log stream.
6. Verify the dashboard heatmap and SLA summary cards refresh after the run.
7. Record notable results and attach evidence to the release ticket.
