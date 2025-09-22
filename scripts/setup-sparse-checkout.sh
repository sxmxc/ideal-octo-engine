#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/setup-sparse-checkout.sh [options]

Prepare the current repository for sparse checkout and populate a curated set of
paths. By default the script keeps the docs, catalog, and scripts directories.

Options:
  -t, --toolkit <slug>    Include toolkits/<slug> in the sparse checkout (can be
                         specified multiple times).
  -n, --new-toolkit <slug>
                         Prepare an empty toolkits/<slug> directory for a brand
                         new toolkit (can be specified multiple times).
  -i, --include <path>    Include an additional path (file or directory) in the
                         sparse checkout (can be specified multiple times).
      --no-defaults       Do not automatically include docs, catalog, or scripts.
  -h, --help              Show this help message and exit.

Examples:
  # Initialize sparse checkout and include docs, catalog, scripts (default)
  scripts/setup-sparse-checkout.sh

  # Include the sample toolkit as well
  scripts/setup-sparse-checkout.sh --toolkit sample-toolkit

  # Only include docs and a custom path
  scripts/setup-sparse-checkout.sh --no-defaults --include docs --include README.md
USAGE
}

require_git_repo() {
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: this script must be run from within a Git repository." >&2
    exit 1
  fi
}

ensure_sparse_checkout() {
  local sparse_enabled
  sparse_enabled=$(git config --type=bool core.sparseCheckout 2>/dev/null || echo "false")
  local cone_enabled
  cone_enabled=$(git config --type=bool core.sparseCheckoutCone 2>/dev/null || echo "false")

  if [[ "$sparse_enabled" != "true" || "$cone_enabled" != "true" ]]; then
    git sparse-checkout init --cone
  fi
}

main() {
  local include_defaults=1
  declare -a extra_paths=()
  declare -a toolkit_slugs=()
  declare -a new_toolkit_slugs=()

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -t|--toolkit)
        if [[ $# -lt 2 ]]; then
          echo "Error: --toolkit requires a slug." >&2
          exit 1
        fi
        toolkit_slugs+=("$2")
        shift 2
        ;;
      -n|--new-toolkit)
        if [[ $# -lt 2 ]]; then
          echo "Error: --new-toolkit requires a slug." >&2
          exit 1
        fi
        new_toolkit_slugs+=("$2")
        shift 2
        ;;
      -i|--include)
        if [[ $# -lt 2 ]]; then
          echo "Error: --include requires a path." >&2
          exit 1
        fi
        extra_paths+=("$2")
        shift 2
        ;;
      --no-defaults)
        include_defaults=0
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Error: unrecognized argument '$1'." >&2
        echo >&2
        usage >&2
        exit 1
        ;;
    esac
  done

  require_git_repo
  ensure_sparse_checkout

  declare -a paths=()
  if [[ $include_defaults -eq 1 ]]; then
    paths+=("docs" "catalog" "scripts")
  fi

  for slug in "${toolkit_slugs[@]}"; do
    paths+=("toolkits/${slug}")
  done

  for path in "${extra_paths[@]}"; do
    paths+=("${path}")
  done

  for slug in "${new_toolkit_slugs[@]}"; do
    paths+=("toolkits/${slug}")
  done

  if [[ ${#paths[@]} -eq 0 ]]; then
    echo "Error: no paths selected for sparse checkout." >&2
    exit 1
  fi

  # Remove duplicate paths while preserving order.
  declare -A seen=()
  declare -a unique_paths=()
  for path in "${paths[@]}"; do
    if [[ -z "${seen[$path]+x}" ]]; then
      seen[$path]=1
      unique_paths+=("$path")
    fi
  done

  git sparse-checkout set "${unique_paths[@]}"

  echo "Sparse checkout configured for:"
  for path in "${unique_paths[@]}"; do
    printf '  %s\n' "$path"
  done

  if [[ ${#new_toolkit_slugs[@]} -gt 0 ]]; then
    mkdir -p toolkits
    echo "Preparing new toolkit directories:"
    for slug in "${new_toolkit_slugs[@]}"; do
      local dir="toolkits/${slug}"
      if [[ -e "$dir" ]]; then
        printf '  %s (already exists, skipped)\n' "$dir"
      else
        mkdir -p "$dir"
        printf '  %s\n' "$dir"
      fi
    done
  fi
}

main "$@"
