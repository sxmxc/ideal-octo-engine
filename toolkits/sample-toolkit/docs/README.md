# Sample diagnostics toolkit

This sample showcases the required directory layout, manifest metadata, and
documentation expected for community submissions.

## What ships in the bundle

- FastAPI router mounted at `/toolkits/sample/health`.
- Celery task `sample_toolkit.run_diagnostics` returning a mocked payload.
- Minimal React panel proving frontend assets can mount successfully.

## Validate the bundle

1. Ensure `toolkits/sample-toolkit/toolkit.json` reflects the version you want
   to publish and references each runtime entry point.
2. Launch the bundler locally and request the archive on demand:
   ```bash
   uvicorn toolkit_bundle_service:application --port 8002
   curl -I http://localhost:8002/toolkits/sample-toolkit/bundle.zip
   curl http://localhost:8002/toolkits/sample-toolkit/bundle.zip -o /tmp/sample-toolkit.zip
   unzip -t /tmp/sample-toolkit.zip
   ```
3. Walk through the tests listed in `toolkits/sample-toolkit/docs/TESTING.md`.
4. Capture notes in `toolkits/sample-toolkit/docs/RELEASE_NOTES.md` before
   requesting publication.

## Operator runbook

1. Download the bundle from the community catalog or your internal mirror.
2. Upload it in the Toolbox admin UI.
3. Call `/toolkits/sample/health` to confirm installation.
4. Review dashboard output in the App Shell to confirm frontend components render.
