# Testing the subnet calculator toolkit

Follow these steps after making changes to validate the toolkit end-to-end.

## Unit-style checks

1. Launch the FastAPI application used during development:
   ```bash
   uvicorn toolkits.subnet-cheatsheet.backend.app:create_app --factory
   ```
   The application exposes `/toolkits/subnet-cheatsheet/summary` and
   `/toolkits/subnet-cheatsheet/prefixes`.
2. Query the summary endpoint with a sample network:
   ```bash
   http "http://localhost:8000/toolkits/subnet-cheatsheet/summary" cidr==192.168.10.17/27
   ```
3. Request a subset of the prefix table to verify pagination logic:
   ```bash
   http "http://localhost:8000/toolkits/subnet-cheatsheet/prefixes" minimum==24 maximum==28
   ```

## Worker tasks

1. Start a Celery shell with the toolbox settings and register the toolkit tasks:
   ```bash
   celery -A toolbox.celery_app shell
   >>> from toolkits.subnet-cheatsheet.worker.tasks import register
   >>> register(app)
   >>> app.send_task("subnet-cheatsheet.summarize", kwargs={"cidr": "10.20.30.0/23"}).get()
   ```
2. Inspect the returned payload and confirm it matches the API response.

## Frontend smoke test

1. Load the toolkit panel inside the App Shell development environment.
2. Use the calculator form to look up at least two networks and confirm the
   prefix table renders the default `/8` through `/30` rows.
