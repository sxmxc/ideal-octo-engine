# Testing checklist – Zabbix toolkit

1. Rebuild the frontend bundle (see `docs/BUILDING.md`) ensuring
   `frontend/dist/index.js` is fresh.
2. Package the toolkit and verify the archive from the dynamic bundler:
   ```bash
   scripts/package-toolkit.sh zabbix
   curl -fLo /tmp/zabbix.zip http://localhost:8002/toolkits/zabbix/bundle.zip
   unzip -t /tmp/zabbix.zip
   ```
3. Install the bundle via the admin UI and confirm the dashboard card links to
   `/toolkits/zabbix`.
4. Create a Zabbix instance and run the connection test endpoint:
   ```bash
   curl -X POST \
     http://localhost:8000/toolkits/zabbix/instances/<instance_id>/test \
     -H 'Content-Type: application/json' \
     -d '{"token":"<api_token>"}'
   ```
5. Execute a bulk add dry run and ensure the response summarises pending hosts.
6. Queue a bulk export job and monitor `/toolkits/jobs/<job_id>` (or UI
   equivalent) until it reports `succeeded`.
7. Capture logs/screenshots and attach them to the release record.
