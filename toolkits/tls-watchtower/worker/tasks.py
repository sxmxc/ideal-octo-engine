"""Celery task registration for TLS Watchtower."""
from __future__ import annotations

from celery import Celery

from ..backend.state import store


def register(app: Celery) -> None:
    """Register TLS Watchtower tasks with *app*."""

    @app.task(name="tls-watchtower.daily_sweep")
    def daily_sweep() -> list[dict[str, object]]:
        """Re-scan all monitored hosts and return snapshots."""

        hosts = [record.host for record in store.list_records()]
        records = store.bulk_scan(hosts)
        return [record.snapshot().model_dump() for record in records]

    @app.task(name="tls-watchtower.retry_scan")
    def retry_scan(host: str, port: int = 443) -> dict[str, object]:
        """Trigger a targeted retry for *host* and return its snapshot."""

        record = store.scan(host, port, source="retry")
        return record.snapshot().model_dump()
