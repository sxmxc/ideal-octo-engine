# Testing checklist

Run these tests for every toolkit update. Attach logs and screenshots to the
pull request so reviewers can verify outcomes quickly.

## Control plane

1. Start the Toolbox FastAPI control plane locally.
2. Install the bundle produced by the dynamic bundler.
3. Exercise every documented endpoint and confirm `2xx` responses.
4. Inspect control plane logs for errors or warnings.

## Worker

1. Start the Celery worker with the same configuration used in production.
2. Trigger each task defined in `toolkits/<slug>/worker/`.
3. Confirm progress events reach the control plane and that long-running tasks
   respect cancellation requests.

## Frontend

1. Launch the React App Shell locally.
2. Verify toolkit routes mount successfully and handle invalid input.
3. Confirm localization strings and accessibility semantics render correctly.

## Bundler validation

1. Start the bundler (`uvicorn toolkit_bundle_service:application --port 8002`).
2. Download the archive for your slug and run `unzip -t` to validate the ZIP.
3. Optionally compute a checksum:
   ```bash
   shasum -a 256 /tmp/<slug>.zip
   ```

## Documentation

1. Ensure `toolkits/<slug>/docs/README.md` and supporting docs are accurate.
2. Run `python scripts/sync_toolkit_assets.py --slug <slug>` to regenerate the
   MkDocs page and catalog entry.
3. Review the rendered page locally via `mkdocs serve` to catch formatting
   issues before submission.
