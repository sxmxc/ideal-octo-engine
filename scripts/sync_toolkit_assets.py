#!/usr/bin/env python3
"""Synchronize generated documentation for each toolkit.

This helper keeps the MkDocs documentation tree in sync with the source
toolkits stored under ``toolkits/``. Running the script ensures
``docs/<slug>/index.md`` mirrors ``toolkits/<slug>/README.md`` and that each
toolkit exposes a placeholder download page under ``docs/toolkits/<slug>/``.

The script is idempotent: files are only rewritten when their content changes
to avoid unnecessary churn in the git working tree.
"""
from __future__ import annotations

import argparse
import sys
import textwrap
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = REPO_ROOT / "docs"
TOOLKITS_ROOT = REPO_ROOT / "toolkits"


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


def _render_bundle_placeholder(slug: str) -> str:
    return textwrap.dedent(
        f"""\
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Download {slug} bundle</title>
          </head>
          <body>
            <h1>Download {slug} bundle</h1>
            <p>
              Bundles are generated on demand when requested from a running
              Toolbox instance. Access this bundle via
              <code>/toolkits/{slug}/bundle</code> on your deployment to
              receive the latest archive.
            </p>
            <p>
              This placeholder page remains in the documentation so historical
              links stay functional.
            </p>
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

    bundles_root = DOCS_ROOT / "toolkits" / slug / "bundle"
    bundles_root.mkdir(parents=True, exist_ok=True)
    placeholder_path = bundles_root / "index.html"
    _write_text_if_changed(placeholder_path, _render_bundle_placeholder(slug))


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
