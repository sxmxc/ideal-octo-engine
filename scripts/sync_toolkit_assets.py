#!/usr/bin/env python3
"""Synchronize generated documentation and bundles for each toolkit.

This helper keeps the MkDocs documentation tree and downloadable bundles in
sync with the source toolkits stored under ``toolkits/``.  Running the script
ensures ``docs/<slug>/index.md`` mirrors ``toolkits/<slug>/README.md`` and that
``docs/toolkits/<slug>/bundle.zip`` is freshly packaged.

The script is idempotent: files are only rewritten when their content changes
to avoid unnecessary churn in the git working tree.
"""
from __future__ import annotations

import argparse
import filecmp
import sys
import tempfile
import textwrap
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = REPO_ROOT / "docs"
TOOLKITS_ROOT = REPO_ROOT / "toolkits"


def _import_bundle_toolkit():  # pragma: no cover - thin wrapper for clarity
    """Return the ``bundle_toolkit`` helper without creating a package."""

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    try:
        from build_toolkit_bundle import bundle_toolkit  # type: ignore
    finally:
        sys.path.pop(0)
    return bundle_toolkit


bundle_toolkit = _import_bundle_toolkit()


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


def _write_binary_if_changed(source: Path, target: Path) -> bool:
    if target.exists() and filecmp.cmp(source, target, shallow=False):
        return False
    target.write_bytes(source.read_bytes())
    return True


def _render_redirect_html(slug: str) -> str:
    download_href = "../bundle.zip"
    return textwrap.dedent(
        f"""\
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta http-equiv="refresh" content="0; url={download_href}">
            <title>Downloading {slug} bundle</title>
          </head>
          <body>
            <p>If you are not redirected automatically, <a href="{download_href}">download the bundle</a>.</p>
          </body>
        </html>
        """
    )


def sync_toolkit(slug: str) -> None:
    toolkit_dir = TOOLKITS_ROOT / slug
    if not toolkit_dir.exists():
        raise SystemExit(f"toolkits/{slug} does not exist")

    readme_path = toolkit_dir / "README.md"
    if readme_path.exists():
        markdown = readme_path.read_text(encoding="utf-8").strip()
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

        docs_dir = DOCS_ROOT / slug
        docs_dir.mkdir(parents=True, exist_ok=True)
        _write_text_if_changed(docs_dir / "index.md", document)

    bundles_root = DOCS_ROOT / "toolkits" / slug
    bundles_root.mkdir(parents=True, exist_ok=True)
    bundle_zip = bundles_root / "bundle.zip"

    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        bundle_toolkit(slug, tmp_path, quiet=True)
        _write_binary_if_changed(tmp_path, bundle_zip)
    finally:
        tmp_path.unlink(missing_ok=True)

    redirect_dir = bundles_root / "bundle"
    redirect_dir.mkdir(parents=True, exist_ok=True)
    redirect_path = redirect_dir / "index.html"
    _write_text_if_changed(redirect_path, _render_redirect_html(slug))


def discover_toolkits() -> list[str]:
    return sorted(path.name for path in TOOLKITS_ROOT.iterdir() if path.is_dir())


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Sync generated docs and bundles for toolkits")
    parser.add_argument("--slug", help="Only sync a specific toolkit slug")
    args = parser.parse_args(argv)

    slugs = [args.slug] if args.slug else discover_toolkits()
    for slug in slugs:
        sync_toolkit(slug)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
