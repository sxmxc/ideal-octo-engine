# Dynamic bundler operations

The bundler exposed by `toolkit_bundle_service.py` replaces legacy packaging
scripts. It streams ZIP archives on demand without writing temporary files to
disk.

## Endpoints

- `GET /catalog/toolkits.json` – Serves the published manifest.
- `GET /toolkits/<slug>/bundle.zip` – Streams the toolkit as a ZIP archive.
- `HEAD` is supported for both endpoints to enable health checks.

## Safeguards

- Slug validation restricts requests to lowercase identifiers containing
  letters, numbers, hyphens, or underscores.
- Bundled output is prefixed with `<slug>/` to prevent path traversal.
- Set `TOOLKIT_UPLOAD_MAX_BYTES` to enforce a maximum archive size (defaults to
  50 MiB). Requests exceeding this limit return `413 Payload Too Large`.

## Running locally

```bash
uvicorn toolkit_bundle_service:application --port 8002
```

Request a bundle:

```bash
curl -o /tmp/<slug>.zip http://localhost:8002/toolkits/<slug>/bundle.zip
unzip -t /tmp/<slug>.zip
```

## Troubleshooting

- `404 Not Found` – Toolkit directory or manifest is missing; verify
  `toolkits/<slug>/toolkit.json`.
- `405 Method Not Allowed` – Only `GET` and `HEAD` are supported.
- `413 Payload Too Large` – Reduce the size of the toolkit assets or increase
  `TOOLKIT_UPLOAD_MAX_BYTES` for local testing.

## Automation hooks

Integrate these commands into CI to confirm the bundler behaves as expected:

```bash
curl -sS -D - http://localhost:8002/toolkits/<slug>/bundle.zip -o /tmp/<slug>.zip
unzip -t /tmp/<slug>.zip
rm /tmp/<slug>.zip
```

See [catalog maintenance](catalog.md) for validating bundle URLs in the manifest.
