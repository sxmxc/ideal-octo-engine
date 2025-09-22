#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <toolkit-slug>" >&2
  exit 1
fi

slug="$1"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
python "$repo_root/scripts/sync_toolkit_assets.py" --slug "$slug"
python "$repo_root/scripts/validate_catalog.py" --toolkit "$slug" --strict
