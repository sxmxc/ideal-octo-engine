"""Register Celery tasks for the sample toolkit."""
from celery import Celery


def register(app: Celery) -> None:
    """Register the sample diagnostics task."""

    @app.task(name="sample-toolkit.run_diagnostics")
    def run_diagnostics() -> dict[str, str]:
        return {"status": "ok", "details": "Diagnostics completed."}
