#!/usr/bin/env python3
from __future__ import annotations
import argparse
import io
import json
import os
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


def _resolve_toolkit_paths(slug: str) -> Path:
    toolkit_dir = REPO_ROOT / "toolkits" / slug
    if not toolkit_dir.exists():
        raise FileNotFoundError(f"toolkits/{slug} does not exist")

    manifest_path = toolkit_dir / "toolkit.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"toolkits/{slug}/toolkit.json is required")

    return toolkit_dir


def _iter_toolkit_files(toolkit_dir: Path, *, slug: str):
    for path in sorted(toolkit_dir.rglob("*")):
        if path.is_dir():
            continue
        relative = path.relative_to(toolkit_dir)
        arcname = os.path.join(slug, relative.as_posix())
        yield path, arcname


def build_bundle_bytes(slug: str) -> bytes:
    """Return a zip archive for *slug* as an in-memory byte string."""

    toolkit_dir = _resolve_toolkit_paths(slug)
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for source, arcname in _iter_toolkit_files(toolkit_dir, slug=slug):
            bundle.write(source, arcname=arcname)
    return buffer.getvalue()


def bundle_toolkit(slug: str, output: Path, *, quiet: bool = False) -> None:
    data = build_bundle_bytes(slug)
    output.write_bytes(data)
    if not quiet:
        print(f"Wrote {output.name} ({output.stat().st_size} bytes)")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Package a toolkit directory into a zip bundle")
    parser.add_argument("--slug", required=True, help="Toolkit slug to bundle")
    parser.add_argument("--output", required=True, help="Target zip path")
    args = parser.parse_args(argv)

    output_path = Path(args.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Confirms manifest validity before packaging to prevent broken bundles.
    manifest_text = (REPO_ROOT / "toolkits" / args.slug / "toolkit.json").read_text(encoding="utf-8")
    json.loads(manifest_text)

    bundle_toolkit(args.slug, output_path)
    return 0


if __name__ == "__main__":
    import sys

    raise SystemExit(main(sys.argv[1:]))
