---
title: Browse toolkits
---

# Browse community toolkits

Use the interactive catalog below to search, filter, and discover published
SRE Toolbox toolkits. Results come directly from the
[`catalog/toolkits.json`]({{ repo_url }}/blob/main/catalog/toolkits.json)
metadata file, so updates are reflected as soon as a pull request is merged.

- **Search** by name, description, tags, or maintainer.
- **Filter** by category to narrow the list to similar toolkits.
- **Open** the documentation or source repository with a single click.

<style>
.toolkit-browser {
  display: grid;
  gap: 1.5rem;
}

.toolkit-browser__controls {
  display: grid;
  gap: 0.5rem;
  max-width: 32rem;
}

.toolkit-browser__controls input[type="search"] {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

.toolkit-browser__category-group {
  border: 1px solid var(--md-default-fg-color--lightest, #ccc);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  align-items: center;
}

.toolkit-browser__category {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.toolkit-browser__clear {
  margin-left: auto;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--md-accent-fg-color, #3f51b5);
  border-radius: 9999px;
  background: transparent;
  color: var(--md-accent-fg-color, #3f51b5);
  cursor: pointer;
}

.toolkit-browser__results {
  display: grid;
  gap: 1rem;
}

.toolkit-browser__card {
  border: 1px solid var(--md-default-fg-color--lightest, #ccc);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.toolkit-browser__card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.toolkit-browser__meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 0.75rem;
  margin: 0.75rem 0;
}

.toolkit-browser__meta dt {
  font-weight: 600;
}

.toolkit-browser__meta dd {
  margin: 0;
}

.toolkit-browser__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0.75rem 0;
}

.toolkit-browser__tags li {
  background: var(--md-default-fg-color--lightest, #e8e8e8);
  border-radius: 9999px;
  padding: 0.2rem 0.75rem;
  font-size: 0.85rem;
}

.toolkit-browser__links {
  margin: 0.75rem 0 0;
}

.toolkit-browser__status {
  margin: 0;
  font-weight: 600;
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (min-width: 48rem) {
  .toolkit-browser__results {
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }
}
</style>

<div class="toolkit-browser" data-role="toolkit-browser">
  <form class="toolkit-browser__controls" aria-label="Toolkit filters">
    <label for="toolkit-search">Search the catalog</label>
    <input
      type="search"
      id="toolkit-search"
      name="toolkit-search"
      placeholder="Search by name, description, maintainer, or tag"
      autocomplete="off"
      data-role="toolkit-search"
    />
  </form>
  <section class="toolkit-browser__categories" aria-live="polite">
    <h2 class="visually-hidden">Categories</h2>
    <div data-role="toolkit-categories"></div>
  </section>
  <p class="toolkit-browser__status" data-role="toolkit-status" aria-live="polite"></p>
  <div class="toolkit-browser__results" data-role="toolkit-results" role="list"></div>
</div>

<noscript>
  JavaScript is required to render the interactive catalog. You can still
  download the <a href="{{ raw_catalog_url }}">machine-readable index</a> or
  browse the repository on <a href="{{ repo_url }}">GitHub</a>.
</noscript>

<script>
(() => {
  'use strict';

  const DATA_URL = '{{ raw_catalog_url }}';
  const REPO_URL = '{{ repo_url }}';

  const SITE_ROOT = (() => {
    const marker = '/catalog/';
    const path = window.location.pathname || '/';
    if (path.includes(marker)) {
      const prefix = path.split(marker)[0];
      if (!prefix || prefix === '/') {
        return '/';
      }
      return prefix.endsWith('/') ? prefix : `${prefix}/`;
    }
    if (path.endsWith('/')) {
      return path;
    }
    const segments = path.split('/');
    segments.pop();
    return `${segments.join('/')}/`;
  })();

  function resolveDocsUrl(value) {
    if (!value) {
      return new URL(SITE_ROOT, window.location.origin).toString();
    }
    if (/^https?:/i.test(value)) {
      return value;
    }
    if (value.startsWith('./') || value.startsWith('../')) {
      return new URL(value, window.location.href).toString();
    }
    const cleaned = value.replace(/^\/+/g, '');
    return new URL(cleaned, `${window.location.origin}${SITE_ROOT}`).toString();
  }

  function resolveSourceUrl(value) {
    if (!value) {
      return '';
    }
    if (/^https?:/i.test(value)) {
      return value;
    }
    const cleaned = value.replace(/^\/+/g, '');
    return `${REPO_URL}/tree/main/${cleaned}`;
  }

  const browserRoot = document.querySelector('[data-role="toolkit-browser"]');
  if (!browserRoot) {
    return;
  }

  const searchInput = browserRoot.querySelector('[data-role="toolkit-search"]');
  const categoryContainer = browserRoot.querySelector('[data-role="toolkit-categories"]');
  const statusRegion = browserRoot.querySelector('[data-role="toolkit-status"]');
  const resultsRegion = browserRoot.querySelector('[data-role="toolkit-results"]');

  const state = {
    toolkits: [],
    categories: new Map(),
    activeCategories: new Set(),
    query: ''
  };

  function normalise(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function buildCategories(toolkits) {
    state.categories.clear();
    toolkits.forEach((toolkit) => {
      const rawCategories = Array.isArray(toolkit.categories) && toolkit.categories.length
        ? toolkit.categories
        : toolkit.tags || [];
      rawCategories.forEach((label) => {
        const key = normalise(label);
        if (!key) {
          return;
        }
        if (!state.categories.has(key)) {
          state.categories.set(key, label);
        }
      });
    });
  }

  function renderCategories() {
    if (!categoryContainer) {
      return;
    }
    categoryContainer.innerHTML = '';
    const categories = Array.from(state.categories.entries())
      .sort((a, b) => a[1].localeCompare(b[1]));
    if (!categories.length) {
      return;
    }

    const list = document.createElement('fieldset');
    list.className = 'toolkit-browser__category-group';
    const legend = document.createElement('legend');
    legend.textContent = 'Filter by category';
    list.appendChild(legend);

    categories.forEach(([key, label]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'toolkit-browser__category';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = key;
      checkbox.checked = state.activeCategories.has(key);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.activeCategories.add(key);
        } else {
          state.activeCategories.delete(key);
        }
        renderResults();
      });

      const span = document.createElement('span');
      span.textContent = label;
      wrapper.appendChild(checkbox);
      wrapper.appendChild(span);
      list.appendChild(wrapper);
    });

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'toolkit-browser__clear';
    clearButton.textContent = 'Clear categories';
    clearButton.addEventListener('click', () => {
      state.activeCategories.clear();
      renderCategories();
      renderResults();
    });
    list.appendChild(clearButton);

    categoryContainer.appendChild(list);
  }

  function matchesQuery(toolkit, query) {
    if (!query) {
      return true;
    }
    const haystack = [
      toolkit.name,
      toolkit.description,
      (toolkit.tags || []).join(' '),
      (toolkit.maintainers || []).join(' ')
    ].map(normalise).join(' ');
    return haystack.includes(query);
  }

  function matchesCategory(toolkit) {
    if (!state.activeCategories.size) {
      return true;
    }
    const values = new Set(
      ((toolkit.categories && toolkit.categories.length ? toolkit.categories : toolkit.tags) || [])
        .map(normalise)
    );
    for (const key of state.activeCategories) {
      if (values.has(key)) {
        return true;
      }
    }
    return false;
  }

  function buildToolkitCard(toolkit) {
    const article = document.createElement('article');
    article.className = 'toolkit-browser__card';
    article.setAttribute('role', 'listitem');

    const heading = document.createElement('h3');
    const docsLink = document.createElement('a');
    docsLink.href = toolkit.docs_url;
    docsLink.textContent = toolkit.name;
    heading.appendChild(docsLink);
    article.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = toolkit.description;
    article.appendChild(description);

    const metaList = document.createElement('dl');
    metaList.className = 'toolkit-browser__meta';

    const versionTerm = document.createElement('dt');
    versionTerm.textContent = 'Version';
    const versionValue = document.createElement('dd');
    versionValue.textContent = toolkit.version;
    metaList.appendChild(versionTerm);
    metaList.appendChild(versionValue);

    if (toolkit.maintainers && toolkit.maintainers.length) {
      const maintainerTerm = document.createElement('dt');
      maintainerTerm.textContent = 'Maintainers';
      const maintainerValue = document.createElement('dd');
      maintainerValue.textContent = toolkit.maintainers.join(', ');
      metaList.appendChild(maintainerTerm);
      metaList.appendChild(maintainerValue);
    }

    article.appendChild(metaList);

    if (toolkit.tags && toolkit.tags.length) {
      const tagList = document.createElement('ul');
      tagList.className = 'toolkit-browser__tags';
      toolkit.tags.forEach((tag) => {
        const item = document.createElement('li');
        item.textContent = tag;
        tagList.appendChild(item);
      });
      article.appendChild(tagList);
    }

    const links = document.createElement('p');
    links.className = 'toolkit-browser__links';

    const docsAnchor = document.createElement('a');
    docsAnchor.href = toolkit.docs_url;
    docsAnchor.textContent = 'View documentation';
    links.appendChild(docsAnchor);

    if (toolkit.source_url) {
      links.appendChild(document.createTextNode(' · '));
      const sourceAnchor = document.createElement('a');
      sourceAnchor.href = toolkit.source_url;
      sourceAnchor.textContent = 'View source';
      links.appendChild(sourceAnchor);
    }

    article.appendChild(links);
    return article;
  }

  function renderResults() {
    if (!resultsRegion) {
      return;
    }
    const query = normalise(state.query);
    const filtered = state.toolkits
      .filter((toolkit) => matchesQuery(toolkit, query))
      .filter((toolkit) => matchesCategory(toolkit));

    resultsRegion.innerHTML = '';
    if (statusRegion) {
      statusRegion.textContent = filtered.length
        ? `${filtered.length} toolkit${filtered.length === 1 ? '' : 's'} found`
        : 'No toolkits match the current filters.';
    }

    if (!filtered.length) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'Try adjusting your search terms or clearing filters to see more toolkits.';
      resultsRegion.appendChild(emptyMessage);
      return;
    }

    filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((toolkit) => {
        resultsRegion.appendChild(buildToolkitCard(toolkit));
      });
  }

  function prepareToolkit(rawToolkit) {
    const docsUrl = rawToolkit.docs_url || `${rawToolkit.slug || ''}/`;
    const source = rawToolkit.source_url
      ? resolveSourceUrl(rawToolkit.source_url)
      : resolveSourceUrl(rawToolkit.source);

    return {
      ...rawToolkit,
      docs_url: resolveDocsUrl(docsUrl),
      source_url: source
    };
  }

  function handleSearch(event) {
    state.query = event.target.value;
    renderResults();
  }

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load catalog: ${response.status}`);
      }
      return response.json();
    })
    .then((payload) => {
      const toolkits = Array.isArray(payload.toolkits) ? payload.toolkits : [];
      state.toolkits = toolkits.map(prepareToolkit);
      buildCategories(state.toolkits);
      renderCategories();
      renderResults();
    })
    .catch((error) => {
      if (statusRegion) {
        statusRegion.textContent = 'Unable to load the toolkit catalog. Please try again later or download the catalog JSON.';
      }
      if (resultsRegion) {
        const fallback = document.createElement('p');
        fallback.textContent = error.message;
        resultsRegion.appendChild(fallback);
      }
    });
})();
</script>

## Add your toolkit to the browser

Each toolkit entry is sourced from `catalog/toolkits.json`. To ensure your
submission appears here:

1. Maintain accurate `name`, `description`, `version`, and `tags` in
   `toolkits/<slug>/toolkit.json`. Use the optional `catalog` block in the
   manifest to tailor public-facing details such as additional tags,
   human-friendly descriptions, `maintainers`, and a `categories` array for the
   filter UI.
2. Run `scripts/sync_toolkit_assets.py --slug <slug>` to mirror the README into
   `docs/<slug>/index.md`, regenerate the bundle placeholder, and sync
   `catalog/toolkits.json` (including `docs_url`, `bundle_url`, and `source`) so
   the browser can surface your submission without manual JSON edits.

Refer to the [packaging guide](../toolkit-authoring/packaging.md) for a complete
walkthrough of the catalog update workflow.
