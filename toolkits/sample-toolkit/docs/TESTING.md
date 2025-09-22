# Testing checklist – sample diagnostics toolkit

1. Start the Toolbox control plane, worker, and App Shell locally.
2. Request the dynamic bundle and store it for installation:
   ```bash
   curl -o /tmp/sample-toolkit.zip http://localhost:8002/toolkits/sample-toolkit/bundle.zip
   ```
3. Upload the archive via the Toolbox admin UI and wait for installation to complete.
4. Call `GET /toolkits/sample/health` and confirm a `200 OK` response with the expected JSON payload.
5. Trigger the Celery task `sample_toolkit.run_diagnostics` and inspect worker logs for status updates.
6. Load the React panel in the App Shell and verify it renders the diagnostic summary.
7. Document results and attach evidence (logs, screenshots) to the submission pull request.
