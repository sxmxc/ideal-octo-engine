"""WSGI application serving toolkit bundles on demand."""
from __future__ import annotations

from typing import Callable, Iterable

from scripts.build_toolkit_bundle import build_bundle_bytes

StartResponse = Callable[[str, list[tuple[str, str]]], None]
Environ = dict[str, str]


def _parse_slug(path: str) -> str | None:
    if not path.startswith("/toolkits/"):
        return None
    remainder = path[len("/toolkits/") :]
    parts = [segment for segment in remainder.split("/") if segment]
    if len(parts) != 2:
        return None
    slug, endpoint = parts
    if endpoint != "bundle" or not slug:
        return None
    return slug


def _not_found(start_response: StartResponse) -> Iterable[bytes]:
    body = b"Toolkit not found"
    start_response(
        "404 Not Found",
        [("Content-Type", "text/plain; charset=utf-8"), ("Content-Length", str(len(body)))],
    )
    return [body]


def _method_not_allowed(start_response: StartResponse) -> Iterable[bytes]:
    body = b"Method not allowed"
    start_response(
        "405 Method Not Allowed",
        [
            ("Content-Type", "text/plain; charset=utf-8"),
            ("Content-Length", str(len(body))),
            ("Allow", "GET, HEAD"),
        ],
    )
    return [body]


def application(environ: Environ, start_response: StartResponse) -> Iterable[bytes]:
    """WSGI entrypoint returning toolkit bundles as zip archives."""

    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET").upper()

    if method not in {"GET", "HEAD"}:
        return _method_not_allowed(start_response)

    slug = _parse_slug(path)
    if not slug:
        return _not_found(start_response)

    try:
        bundle = build_bundle_bytes(slug)
    except FileNotFoundError:
        return _not_found(start_response)

    headers = [
        ("Content-Type", "application/zip"),
        ("Content-Disposition", f'attachment; filename="{slug}.zip"'),
        ("Cache-Control", "no-store"),
        ("Content-Length", str(len(bundle))),
    ]
    start_response("200 OK", headers)

    if method == "HEAD":
        return [b""]
    return [bundle]


__all__ = ["application"]
