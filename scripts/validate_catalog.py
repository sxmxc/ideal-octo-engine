#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = REPO_ROOT / "catalog" / "toolkits.json"


def load_catalog() -> dict:
    if not CATALOG_PATH.exists():
        raise SystemExit("catalog/toolkits.json is missing")
    with CATALOG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_entry(slug: str, entry: dict, *, strict: bool) -> list[str]:
    issues: list[str] = []
    toolkit_dir = REPO_ROOT / "toolkits" / slug
    if not toolkit_dir.exists():
        issues.append(f"Toolkit directory missing: toolkits/{slug}")
    manifest = toolkit_dir / "toolkit.json"
    if not manifest.exists():
        issues.append(f"Missing toolkit.json for {slug}")
    elif strict:
        try:
            manifest_data = json.loads(manifest.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            issues.append(f"toolkits/{slug}/toolkit.json is not valid JSON: {exc}")
        else:
            if manifest_data.get("slug") != slug:
                issues.append(f"Manifest slug mismatch for {slug}")
    required_fields = {"name", "version", "description", "tags", "docs_url", "categories"}
    missing = required_fields - entry.keys()
    if missing:
        issues.append(f"Catalog entry for {slug} missing keys: {sorted(missing)}")
    else:
        if not isinstance(entry.get("docs_url"), str) or not entry["docs_url"].strip():
            issues.append(f"Catalog entry for {slug} has an empty docs_url")
        categories = entry.get("categories", [])
        if not isinstance(categories, list) or not all(isinstance(item, str) and item.strip() for item in categories):
            issues.append(
                f"Catalog entry for {slug} must define categories as a list of non-empty strings"
            )

    doc_page = REPO_ROOT / "docs" / slug / "index.md"
    if not doc_page.exists():
        issues.append(f"Documentation page missing: docs/{slug}/index.md")
    return issues


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Validate toolkit catalog metadata")
    parser.add_argument("--toolkit", help="Validate a single toolkit slug")
    parser.add_argument("--strict", action="store_true", help="Perform extra manifest checks")
    args = parser.parse_args(argv)

    catalog = load_catalog()
    entries = catalog.get("toolkits", [])
    entry_map = {item["slug"]: item for item in entries if "slug" in item}

    if args.toolkit and args.toolkit not in entry_map:
        print(f"Toolkit '{args.toolkit}' missing from catalog/toolkits.json", file=sys.stderr)
        return 1

    slugs = [args.toolkit] if args.toolkit else sorted(entry_map)
    failures = 0
    for slug in slugs:
        entry = entry_map[slug]
        issues = validate_entry(slug, entry, strict=args.strict)
        if issues:
            failures += 1
            print(f"[FAIL] {slug}")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print(f"[OK] {slug}")

    if not args.toolkit:
        known_dirs = {path.name for path in (REPO_ROOT / "toolkits").iterdir() if path.is_dir()}
        missing_in_catalog = sorted(known_dirs - set(entry_map))
        if missing_in_catalog:
            failures += len(missing_in_catalog)
            print("Toolkits missing from catalog/toolkits.json:")
            for slug in missing_in_catalog:
                print(f"  - {slug}")

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
