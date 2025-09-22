"""Runtime helpers for the MkDocs macros plugin.

The deploy workflow invokes ``mkdocs build`` with the `mkdocs-macros` plugin
enabled.  The plugin imports this module and looks for a ``define_env``
function.  If the function is missing, the build fails with the same error that
triggered the current task.  Keeping this implementation small and dependency
free helps ensure the documentation site can be generated inside the CI
environment without additional bootstrap steps.
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
