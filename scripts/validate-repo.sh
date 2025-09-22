#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

cd "$repo_root"

# Ensure generated documentation and catalog metadata are current.
python scripts/sync_toolkit_assets.py

# Ensure toolkit metadata stays in sync with directory contents.
python scripts/validate_catalog.py

# Run lightweight linting for documentation and scripts if tools are available.
if command -v markdownlint >/dev/null 2>&1; then
  markdownlint "docs" "README.md"
fi

if command -v shellcheck >/dev/null 2>&1; then
  shellcheck scripts/*.sh
fi
