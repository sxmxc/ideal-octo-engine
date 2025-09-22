#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <toolkit-slug>" >&2
  exit 1
fi

slug="$1"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
toolkit_dir="$repo_root/toolkits/$slug"
output_dir="$repo_root/dist"

if [[ ! -d "$toolkit_dir" ]]; then
  echo "Toolkit directory '$slug' not found under toolkits/." >&2
  exit 1
fi

mkdir -p "$output_dir"
package_name="${slug}-$(date +%Y%m%d).zip"

# Regenerate generated documentation and bundle assets before validation so
# validate_catalog.py sees the latest bundle artifacts even if they are
# gitignored.
python "$repo_root/scripts/sync_toolkit_assets.py" --slug "$slug"

python "$repo_root/scripts/validate_catalog.py" --toolkit "$slug"
python "$repo_root/scripts/build_toolkit_bundle.py" --slug "$slug" --output "$output_dir/$package_name"

echo "Toolkit packaged at dist/$package_name"
