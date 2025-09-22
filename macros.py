"""Macros for MkDocs builds."""
from __future__ import annotations

import os
from typing import Any


DEFAULT_REPO_SLUG = "sre-toolbox-community/ideal-octo-engine"


def define_env(env: Any) -> None:
    """Register template variables available to Markdown pages."""
    repo_slug = os.environ.get("GITHUB_REPOSITORY", DEFAULT_REPO_SLUG)
    env.variables["repo_slug"] = repo_slug
    env.variables["repo_url"] = f"https://github.com/{repo_slug}"
    env.variables["raw_catalog_url"] = (
        f"https://raw.githubusercontent.com/{repo_slug}/main/catalog/toolkits.json"
    )
