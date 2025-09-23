"""Minimal stub of the :mod:`requests` package used during documentation builds."""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any


class RequestException(Exception):
    """Fallback exception compatible with :mod:`requests`."""


class Response:
    """Lightweight response object exposing ``status_code``."""

    def __init__(self, status_code: int = 404, **_: Any) -> None:
        self.status_code = status_code


exceptions = SimpleNamespace(RequestException=RequestException)


def get(url: str, *_, **__) -> Response:  # noqa: D401
    """Return a dummy :class:`Response` with ``status_code`` set to ``404``."""

    return Response(status_code=404)


__all__ = ["RequestException", "Response", "exceptions", "get"]
