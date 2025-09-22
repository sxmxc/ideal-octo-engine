"""WSGI application serving toolkit bundles on demand."""
from __future__ import annotations

from pathlib import Path
from typing import Callable, Iterable
import os
import re

from scripts.build_toolkit_bundle import build_bundle_bytes

StartResponse = Callable[[str, list[tuple[str, str]]], None]
Environ = dict[str, str]

REPO_ROOT = Path(__file__).resolve().parent
CATALOG_MANIFEST_PATH = REPO_ROOT / "catalog" / "toolkits.json"
DEFAULT_MAX_BYTES = 50 * 1024 * 1024
SLUG_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_-]*$")


def _parse_slug(path: str) -> str | None:
    if not path.startswith("/toolkits/"):
        return None
    remainder = path[len("/toolkits/") :]
    parts = [segment for segment in remainder.split("/") if segment]
    if len(parts) != 2:
        return None
    slug, endpoint = parts
    if endpoint != "bundle.zip" or not slug or not SLUG_PATTERN.match(slug):
        return None
    return slug


def _not_found(start_response: StartResponse) -> Iterable[bytes]:
    body = b"Toolkit not found"
    start_response(
        "404 Not Found",
        [("Content-Type", "text/plain; charset=utf-8"), ("Content-Length", str(len(body)))],
    )
    return [body]


def _serve_catalog_manifest(method: str, start_response: StartResponse) -> Iterable[bytes]:
    try:
        payload = CATALOG_MANIFEST_PATH.read_bytes()
    except FileNotFoundError:
        return _not_found(start_response)

    headers = [
        ("Content-Type", "application/json; charset=utf-8"),
        ("Cache-Control", "no-store"),
        ("Content-Length", str(len(payload))),
    ]
    start_response("200 OK", headers)
    if method == "HEAD":
        return [b""]
    return [payload]


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


def _payload_too_large(start_response: StartResponse) -> Iterable[bytes]:
    body = b"Bundle exceeds configured limit"
    start_response(
        "413 Payload Too Large",
        [
            ("Content-Type", "text/plain; charset=utf-8"),
            ("Content-Length", str(len(body))),
            ("Retry-After", "120"),
        ],
    )
    return [body]


def application(environ: Environ, start_response: StartResponse) -> Iterable[bytes]:
    """WSGI entrypoint returning toolkit bundles as zip archives."""

    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET").upper()

    if method not in {"GET", "HEAD"}:
        return _method_not_allowed(start_response)

    if path == "/catalog/toolkits.json":
        return _serve_catalog_manifest(method, start_response)

    slug = _parse_slug(path)
    if not slug:
        return _not_found(start_response)

    try:
        bundle = build_bundle_bytes(slug)
    except FileNotFoundError:
        return _not_found(start_response)

    max_bytes_env = os.getenv("TOOLKIT_UPLOAD_MAX_BYTES")
    if max_bytes_env:
        try:
            max_bytes = int(max_bytes_env)
        except ValueError:
            max_bytes = DEFAULT_MAX_BYTES
    else:
        max_bytes = DEFAULT_MAX_BYTES

    if len(bundle) > max_bytes:
        return _payload_too_large(start_response)

    headers = [
        ("Content-Type", "application/zip"),
        ("Content-Disposition", f'attachment; filename="{slug}_toolkit.zip"'),
        ("Cache-Control", "no-store"),
        ("Content-Length", str(len(bundle))),
    ]
    start_response("200 OK", headers)

    if method == "HEAD":
        return [b""]
    return [bundle]


__all__ = ["application"]
