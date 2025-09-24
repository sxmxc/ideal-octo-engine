"""Celery tasks providing offline subnet calculations."""
from __future__ import annotations

from celery import Celery

from ..backend.calculator import generate_prefix_table, parse_network, summarize_subnet


def register(app: Celery) -> None:
    """Register subnet helper tasks with *app*."""

    @app.task(name="subnet-cheatsheet.generate_prefix_table")
    def generate_table(minimum: int = 8, maximum: int = 30) -> list[dict[str, str | int]]:
        """Return prefix metadata for dashboards or scheduled jobs."""

        minimum_clamped = max(0, min(32, minimum))
        maximum_clamped = max(minimum_clamped, min(32, maximum))
        prefixes = range(minimum_clamped, maximum_clamped + 1)
        return generate_prefix_table(prefixes)

    @app.task(name="subnet-cheatsheet.summarize")
    def summarize(cidr: str | None = None, address: str | None = None, prefix: int | None = None) -> dict[str, object]:
        """Return a serializable subnet summary."""

        network = parse_network(cidr=cidr, address=address, prefix=prefix)
        summary = summarize_subnet(network)
        return summary.__dict__
