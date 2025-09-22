"""Runtime helpers for the MkDocs macros plugin.

The documentation site relies on ``mkdocs-macros-plugin`` to expose a handful
of repository-specific variables to Markdown pages.  When the plugin is loaded
it imports this module and invokes :func:`define_env`.  Keeping the
implementation dependency free ensures the documentation site can be generated
in CI environments without any additional bootstrap steps.
"""
from __future__ import annotations

import os
from typing import Any, Mapping, MutableMapping


DEFAULT_REPO_SLUG = "sre-toolbox-community/ideal-octo-engine"

# The macros plugin only cares that ``define_env`` exists.  ``__all__`` is
# provided to make the exported surface explicit and aid static analysis.
__all__ = ["define_env"]


def _build_env_variables(repo_slug: str) -> Mapping[str, str]:
    """Return the template variables that should be exposed to MkDocs."""

    repo_url = f"https://github.com/{repo_slug}"
    return {
        "repo_slug": repo_slug,
        "repo_url": repo_url,
        "raw_catalog_url": (
            f"https://raw.githubusercontent.com/{repo_slug}/main/catalog/toolkits.json"
        ),
    }


def _set_variables(target: MutableMapping[str, str], values: Mapping[str, str]) -> None:
    """Update *target* with the computed ``values`` in a predictable order."""

    for key in sorted(values):
        target[key] = values[key]


def define_env(env: Any) -> None:
    """Register template variables available to Markdown pages.

    The plugin passes a lightweight ``env`` object that behaves similar to a
    namespace.  We only rely on the ``variables`` attribute which exposes a
    mutable mapping.
    """

    repo_slug = os.environ.get("GITHUB_REPOSITORY", DEFAULT_REPO_SLUG)
    variables = _build_env_variables(repo_slug)
    _set_variables(env.variables, variables)
