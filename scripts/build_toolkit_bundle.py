#!/usr/bin/env python3
import argparse
import json
import os
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]


def bundle_toolkit(slug: str, output: Path) -> None:
    toolkit_dir = REPO_ROOT / "toolkits" / slug
    if not toolkit_dir.exists():
        raise FileNotFoundError(f"toolkits/{slug} does not exist")

    manifest_path = toolkit_dir / "toolkit.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"toolkits/{slug}/toolkit.json is required")

    # Preserve relative paths inside the archive.
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for path in toolkit_dir.rglob("*"):
            if path.is_dir():
                continue
            relative = path.relative_to(toolkit_dir)
            bundle.write(path, arcname=os.path.join(slug, relative.as_posix()))

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
