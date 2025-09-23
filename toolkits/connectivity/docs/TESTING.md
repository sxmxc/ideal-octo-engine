# Testing checklist – Connectivity toolkit

1. Rebuild the frontend bundle (see `docs/BUILDING.md`) so
   `frontend/dist/index.js` is current.
2. Package the toolkit and download the bundle via the dynamic bundler:
   ```bash
   scripts/package-toolkit.sh connectivity
   curl -fLo /tmp/connectivity.zip http://localhost:8002/toolkits/connectivity/bundle.zip
   unzip -t /tmp/connectivity.zip
   ```
3. Install the archive through the admin UI and confirm the dashboard card
   links to `/toolkits/connectivity`.
4. Create a target through the API:
   ```bash
   curl -X POST http://localhost:8000/toolkits/connectivity/targets \
     -H 'Content-Type: application/json' \
     -d '{"name":"smoke-test","description":"demo","endpoints":[{"host":"example.com","port":443,"protocol":"tcp"}]}'
   ```
5. Request a preview check and verify the response contains latency summaries:
   ```bash
   curl -X POST \
     http://localhost:8000/toolkits/connectivity/targets/<target_id>/actions/check/preview \
     -H 'Content-Type: application/json' \
     -d '{"repetitions":2}'
   ```
6. Queue a bulk probe job, then monitor job logs from the Toolbox UI or via the
   `/toolkits/jobs/<job_id>` API until it reports `succeeded`.
