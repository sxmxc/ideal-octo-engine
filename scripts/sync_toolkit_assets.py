#!/usr/bin/env python3
"""Synchronize toolkit documentation and catalog metadata.

This helper keeps the MkDocs sources under ``docs/toolkits/<slug>/index.md``
in sync with ``toolkits/<slug>/docs/README.md`` and refreshes
``catalog/toolkits.json``. It also materializes ``bundle.zip`` archives under
``docs/toolkits/<slug>/`` so static hosts (for example GitHub Pages) can serve
toolkit downloads without the dynamic bundler.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]

if __package__ is None or __package__ == "":  # pragma: no cover - module side effect
    sys.path.insert(0, str(REPO_ROOT))

from scripts.build_toolkit_bundle import build_bundle_bytes

DOCS_ROOT = REPO_ROOT / "docs"
TOOLKITS_ROOT = REPO_ROOT / "toolkits"
CATALOG_PATH = REPO_ROOT / "catalog" / "toolkits.json"
DOCS_TOOLKITS_ROOT = DOCS_ROOT / "toolkits"


def _first_heading(markdown: str) -> str | None:
    for line in markdown.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return None


def _write_text_if_changed(path: Path, content: str) -> bool:
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def _write_json_if_changed(path: Path, payload: dict[str, Any]) -> bool:
    content = json.dumps(payload, indent=2, ensure_ascii=False)
    if path.exists() and path.read_text(encoding="utf-8") == f"{content}\n":
        return False
    path.write_text(f"{content}\n", encoding="utf-8")
    return True


def _write_bytes_if_changed(path: Path, payload: bytes) -> bool:
    if path.exists() and path.read_bytes() == payload:
        return False
    path.write_bytes(payload)
    return True


def _normalize_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        items = [value]
    elif isinstance(value, (list, tuple, set)):
        items = list(value)
    else:
        return []
    normalized: list[str] = []
    for item in items:
        if isinstance(item, str):
            stripped = item.strip()
            if stripped:
                normalized.append(stripped)
    return normalized


def _choose_list(*candidates: Any) -> list[str]:
    for candidate in candidates:
        if candidate is None:
            continue
        normalized = _normalize_list(candidate)
        if isinstance(candidate, (list, tuple, set)):
            return normalized
        if isinstance(candidate, str):
            if normalized:
                return normalized
        elif normalized:
            return normalized
    return []


def _ordered_entry(entry: dict[str, Any]) -> "OrderedDict[str, Any]":
    preferred_keys = [
        "slug",
        "name",
        "version",
        "description",
        "tags",
        "maintainers",
        "source",
        "docs_url",
        "bundle_url",
        "categories",
    ]
    ordered: "OrderedDict[str, Any]" = OrderedDict()
    for key in preferred_keys:
        if key in entry:
            ordered[key] = entry[key]
    for key, value in entry.items():
        if key not in ordered:
            ordered[key] = value
    return ordered


def _load_catalog() -> dict[str, Any]:
    if CATALOG_PATH.exists():
        return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    return {"version": 1, "generated_at": None, "toolkits": []}


def _sync_catalog(slug: str) -> None:
    manifest_path = TOOLKITS_ROOT / slug / "toolkit.json"
    if not manifest_path.exists():
        raise SystemExit(f"toolkits/{slug}/toolkit.json is required to sync catalog metadata")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    catalog_overrides = manifest.get("catalog", {}) if isinstance(manifest.get("catalog"), dict) else {}

    catalog = _load_catalog()
    entries: list[dict[str, Any]] = list(catalog.get("toolkits", []))
    existing_index = next((idx for idx, item in enumerate(entries) if item.get("slug") == slug), None)
    existing_entry = entries[existing_index] if existing_index is not None else {}

    description = (
        catalog_overrides.get("description")
        or manifest.get("description")
        or existing_entry.get("description")
    )
    tags = _choose_list(
        catalog_overrides.get("tags"),
        manifest.get("tags"),
        existing_entry.get("tags"),
    )
    maintainers = _choose_list(
        catalog_overrides.get("maintainers"),
        existing_entry.get("maintainers"),
    )
    categories = _choose_list(
        catalog_overrides.get("categories"),
        manifest.get("categories"),
        manifest.get("category"),
        existing_entry.get("categories"),
    )

    existing_docs_url = existing_entry.get("docs_url")
    if isinstance(existing_docs_url, str) and not existing_docs_url.startswith("toolkits/"):
        existing_docs_url = None
    docs_url = (
        catalog_overrides.get("docs_url")
        or existing_docs_url
        or f"toolkits/{slug}/"
    )

    existing_bundle_url = existing_entry.get("bundle_url")
    if isinstance(existing_bundle_url, str) and not existing_bundle_url.endswith(".zip"):
        existing_bundle_url = None
    bundle_url = catalog_overrides.get("bundle_url") or existing_bundle_url or f"toolkits/{slug}/bundle.zip"
    source = catalog_overrides.get("source") or existing_entry.get("source") or f"toolkits/{slug}"

    entry: dict[str, Any] = dict(existing_entry)
    entry.update(
        {
            "slug": slug,
            "name": manifest.get("name", existing_entry.get("name", slug.replace("-", " ").title())),
            "version": manifest.get("version", existing_entry.get("version", "0.0.0")),
            "description": description or "",
            "tags": tags,
            "maintainers": maintainers,
            "source": source,
            "docs_url": docs_url,
            "bundle_url": bundle_url,
            "categories": categories,
        }
    )

    ordered_entry = _ordered_entry(entry)

    if existing_index is None or entries[existing_index] != ordered_entry:
        if existing_index is None:
            entries.append(ordered_entry)
        else:
            entries[existing_index] = ordered_entry
        entries.sort(key=lambda item: item.get("slug", ""))
        catalog["toolkits"] = entries
        catalog["generated_at"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
        _write_json_if_changed(CATALOG_PATH, catalog)


def _toolkit_readme(slug: str) -> tuple[Path, str] | None:
    """Return the canonical README path and contents for *slug*.

    Preference order:
    1. toolkits/<slug>/docs/README.md
    2. toolkits/<slug>/README.md (legacy fallback)
    """

    candidates = [
        TOOLKITS_ROOT / slug / "docs" / "README.md",
        TOOLKITS_ROOT / slug / "README.md",
    ]
    for path in candidates:
        if path.exists():
            return path, path.read_text(encoding="utf-8").strip()
    return None


def sync_toolkit(slug: str) -> None:
    toolkit_dir = TOOLKITS_ROOT / slug
    if not toolkit_dir.exists():
        raise SystemExit(f"toolkits/{slug} does not exist")

    readme_data = _toolkit_readme(slug)
    if readme_data is not None:
        readme_path, markdown = readme_data
        title = _first_heading(markdown) or slug.replace("-", " ").title()
        relative_readme = readme_path.relative_to(REPO_ROOT)
        header_lines = [
            "---",
            f"title: {title}",
            "---",
            "",
            f"<!-- This file is auto-generated from {relative_readme.as_posix()}. -->",
            "",
        ]
        document = "\n".join(header_lines + [markdown])
        if not document.endswith("\n"):
            document += "\n"

        docs_dir = DOCS_TOOLKITS_ROOT / slug
        docs_dir.mkdir(parents=True, exist_ok=True)
        _write_text_if_changed(docs_dir / "index.md", document)

    _sync_catalog(slug)

    bundle_path = DOCS_TOOLKITS_ROOT / slug / "bundle.zip"
    bundle_bytes = build_bundle_bytes(slug)
    bundle_path.parent.mkdir(parents=True, exist_ok=True)
    _write_bytes_if_changed(bundle_path, bundle_bytes)


def discover_toolkits() -> list[str]:
    return sorted(path.name for path in TOOLKITS_ROOT.iterdir() if path.is_dir())


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Sync toolkit documentation (docs/toolkits/<slug>) and catalog metadata"
    )
    parser.add_argument("--slug", help="Only sync a specific toolkit slug")
    args = parser.parse_args(argv)

    slugs = [args.slug] if args.slug else discover_toolkits()
    for slug in slugs:
        sync_toolkit(slug)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
