# Toolkit browser

The toolkit browser makes it easier to explore the catalog without scanning
`catalog/toolkits.json` manually. Use the search field or the category and tag
filters to narrow the list. Each entry includes quick links to the toolkit
documentation and the dynamic bundle download so operators can validate content
immediately.

<noscript>
  <div class="toolkit-browser__noscript">
    JavaScript is required to use the interactive catalog browser.
  </div>
</noscript>

<div id="toolkit-browser-app" class="toolkit-browser" data-raw-catalog-url="{{ raw_catalog_url }}">
  <div class="toolkit-browser__loading" role="status">Loading catalog…</div>
</div>

<style>
  .toolkit-browser {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .toolkit-browser__loading,
  .toolkit-browser__error {
    padding: 1rem;
    border-radius: 0.5rem;
    background: var(--md-default-fg-color--lightest, #f2f2f2);
    color: var(--md-default-fg-color, #222);
  }

  .toolkit-browser__error {
    border-left: 0.25rem solid var(--md-primary-fg-color, #2f67e4);
  }

  .toolkit-browser__controls {
    display: grid;
    gap: 1.25rem;
  }

  .toolkit-browser__filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 960px) {
    .toolkit-browser__controls {
      grid-template-columns: minmax(280px, 1fr) minmax(240px, 1fr);
      align-items: start;
    }
  }

  .toolkit-browser__search {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toolkit-browser__search input[type="search"] {
    padding: 0.75rem 0.9rem;
    font: inherit;
    border: 1px solid var(--md-default-fg-color--light, #ccc);
    border-radius: 0.4rem;
  }

  .toolkit-browser__filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--md-default-fg-color--light, #ccc);
    border-radius: 0.5rem;
    background: var(--md-default-bg-color, #fff);
  }

  .toolkit-browser__filter-options {
    display: grid;
    gap: 0.35rem 0.75rem;
  }

  .toolkit-browser__filter-option {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .toolkit-browser__summary {
    font-weight: 600;
  }

  .toolkit-browser__results {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .toolkit-browser__results {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
  }

  .toolkit-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid var(--md-default-fg-color--light, #d7d7d7);
    border-radius: 0.65rem;
    padding: 1.1rem 1.1rem 1rem;
    gap: 0.75rem;
    background: var(--md-default-bg-color, #fff);
    box-shadow: 0 10px 30px -25px rgba(15, 23, 42, 0.6);
  }

  .toolkit-card__header {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .toolkit-card__title {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.65rem;
    align-items: baseline;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .toolkit-card__version {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--md-default-fg-color--light, #666);
  }

  .toolkit-card__description {
    margin: 0;
    color: var(--md-default-fg-color, #222);
    line-height: 1.5;
  }

  .toolkit-card__meta,
  .toolkit-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .toolkit-card__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .toolkit-card__chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    font-size: 0.75rem;
    background: var(--md-accent-fg-color--transparent, rgba(47, 103, 228, 0.12));
    color: var(--md-accent-fg-color, #2f67e4);
  }

  .toolkit-card__chip--tag {
    background: var(--md-default-fg-color--lightest, #f1f1f1);
    color: var(--md-default-fg-color, #333);
  }

  .toolkit-card__actions a {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 0.85rem;
    border-radius: 0.45rem;
    border: 1px solid var(--md-primary-fg-color--light, #6f8be8);
    color: var(--md-primary-fg-color, #2f67e4);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
  }

  .toolkit-card__actions a:hover,
  .toolkit-card__actions a:focus {
    background: var(--md-primary-fg-color--lightest, rgba(47, 103, 228, 0.08));
  }

  .toolkit-browser__empty {
    padding: 1rem;
    border: 1px dashed var(--md-default-fg-color--light, #ccc);
    border-radius: 0.5rem;
    text-align: center;
    color: var(--md-default-fg-color--lighter, #555);
  }

  .toolkit-browser__footnote {
    font-size: 0.85rem;
    color: var(--md-default-fg-color--lighter, #555);
  }
</style>

<script>
  (function () {
    const root = document.getElementById("toolkit-browser-app");
    if (!root) {
      return;
    }

    const state = {
      toolkits: [],
      categories: [],
      tags: [],
      selectedCategories: new Set(),
      selectedTags: new Set(),
      search: "",
      source: null,
    };

    const collator = new Intl.Collator(undefined, { sensitivity: "base" });

    const computeSiteRoot = () => {
      let path = window.location.pathname || "/";
      if (!path.endsWith("/")) {
        path = path.slice(0, path.lastIndexOf("/") + 1);
      }
      const trimmed = path.replace(/[^/]+\/$/, "");
      return trimmed || "/";
    };

    const siteRoot = computeSiteRoot();

    const makeAbsoluteUrl = (value) => {
      if (!value) {
        return null;
      }
      if (/^https?:\/\//i.test(value)) {
        return value;
      }
      const normalised = value.replace(/^\/+/, "");
      return `${siteRoot}${normalised}`;
    };

    const loadCatalog = async () => {
      const rawUrl = root.dataset.rawCatalogUrl;
      const candidateUrls = [`${siteRoot}catalog/toolkits.json`];
      if (rawUrl) {
        candidateUrls.push(rawUrl);
      }

      const errors = [];
      for (const url of candidateUrls) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) {
            errors.push(`${response.status} ${response.statusText}`);
            continue;
          }
          const payload = await response.json();
          return { payload, source: url };
        } catch (error) {
          errors.push(error.message);
        }
      }
      throw new Error(errors.join("; "));
    };

    const filterToolkits = () => {
      const term = state.search.trim().toLowerCase();
      return state.toolkits.filter((toolkit) => {
        const matchesSearch = !term
          || [
            toolkit.name,
            toolkit.slug,
            toolkit.description,
            ...(toolkit.tags || []),
            ...(toolkit.categories || []),
            ...(toolkit.maintainers || []),
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term));

        const matchesCategory = state.selectedCategories.size === 0
          || (toolkit.categories || []).some((category) => state.selectedCategories.has(category));

        const matchesTags = state.selectedTags.size === 0
          || (toolkit.tags || []).some((tag) => state.selectedTags.has(tag));

        return matchesSearch && matchesCategory && matchesTags;
      });
    };

    const renderEmptyState = (container) => {
      container.innerHTML = "";
      const message = document.createElement("div");
      message.className = "toolkit-browser__empty";
      message.textContent = "No toolkits match the current filters.";
      container.appendChild(message);
    };

    const renderToolkitCard = (toolkit) => {
      const article = document.createElement("article");
      article.className = "toolkit-card";
      article.setAttribute("data-slug", toolkit.slug);

      const header = document.createElement("header");
      header.className = "toolkit-card__header";

      const title = document.createElement("div");
      title.className = "toolkit-card__title";
      const name = document.createElement("span");
      name.textContent = toolkit.name;
      const version = document.createElement("span");
      version.className = "toolkit-card__version";
      version.textContent = toolkit.version ? `v${toolkit.version}` : "";
      title.append(name);
      if (toolkit.version) {
        title.append(version);
      }

      const description = document.createElement("p");
      description.className = "toolkit-card__description";
      description.textContent = toolkit.description || "No description provided.";

      header.append(title, description);
      article.append(header);

      const categories = toolkit.categories || [];
      if (categories.length) {
        const list = document.createElement("ul");
        list.className = "toolkit-card__chips";
        list.setAttribute("aria-label", "Categories");
        for (const category of categories) {
          const item = document.createElement("li");
          item.className = "toolkit-card__chip";
          item.textContent = category;
          list.append(item);
        }
        article.append(list);
      }

      const tags = toolkit.tags || [];
      if (tags.length) {
        const list = document.createElement("ul");
        list.className = "toolkit-card__chips";
        list.setAttribute("aria-label", "Tags");
        for (const tag of tags) {
          const item = document.createElement("li");
          item.className = "toolkit-card__chip toolkit-card__chip--tag";
          item.textContent = tag;
          list.append(item);
        }
        article.append(list);
      }

      const actions = document.createElement("div");
      actions.className = "toolkit-card__actions";
      const docsUrl = makeAbsoluteUrl(toolkit.docs_url);
      if (docsUrl) {
        const docsLink = document.createElement("a");
        docsLink.href = docsUrl;
        docsLink.textContent = "View documentation";
        docsLink.setAttribute("data-action", "docs");
        actions.append(docsLink);
      }
      const bundleUrl = makeAbsoluteUrl(toolkit.bundle_url);
      if (bundleUrl) {
        const bundleLink = document.createElement("a");
        bundleLink.href = bundleUrl;
        bundleLink.textContent = "Download bundle";
        bundleLink.setAttribute("data-action", "bundle");
        bundleLink.rel = "noopener";
        actions.append(bundleLink);
      }
      if (actions.children.length) {
        article.append(actions);
      }

      const maintainers = toolkit.maintainers || [];
      if (maintainers.length) {
        const meta = document.createElement("div");
        meta.className = "toolkit-card__meta";
        meta.textContent = `Maintainers: ${maintainers.join(", ")}`;
        article.append(meta);
      }

      return article;
    };

    const render = (resultsContainer, summaryElement, footnote) => {
      const filtered = filterToolkits();
      const total = state.toolkits.length;
      const count = filtered.length;
      summaryElement.textContent = count === total
        ? `${count} toolkit${count === 1 ? "" : "s"} available`
        : `${count} of ${total} toolkit${total === 1 ? "" : "s"} match the filters`;

      resultsContainer.innerHTML = "";
      if (!filtered.length) {
        renderEmptyState(resultsContainer);
      } else {
        for (const toolkit of filtered) {
          resultsContainer.append(renderToolkitCard(toolkit));
        }
      }

      if (state.source) {
        footnote.textContent = `Loaded from ${state.source}`;
      }
    };

    const buildCheckbox = (value, type, changeHandler) => {
      const wrapper = document.createElement("div");
      wrapper.className = "toolkit-browser__filter-option";

      const input = document.createElement("input");
      input.type = "checkbox";
      const labelValue = String(value);
      input.value = labelValue;
      const safeValue = labelValue.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      input.id = `toolkit-filter-${type}-${safeValue}`;

      input.addEventListener("change", () => changeHandler(labelValue, input.checked));

      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = labelValue;

      wrapper.append(input, label);
      return wrapper;
    };

    const buildFilters = (title, values, changeHandler) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "toolkit-browser__filter-group";

      const legend = document.createElement("legend");
      legend.textContent = title;
      fieldset.append(legend);

      if (!values.length) {
        const empty = document.createElement("p");
        empty.className = "toolkit-browser__empty";
        empty.textContent = `No ${title.toLowerCase()} available`;
        fieldset.append(empty);
        return fieldset;
      }

      const options = document.createElement("div");
      options.className = "toolkit-browser__filter-options";
      for (const value of values) {
        options.append(buildCheckbox(value, title.toLowerCase(), changeHandler));
      }
      fieldset.append(options);
      return fieldset;
    };

    const initialise = () => {
      root.innerHTML = "";

      const summary = document.createElement("div");
      summary.className = "toolkit-browser__summary";

      const results = document.createElement("div");
      results.className = "toolkit-browser__results";

      const footnote = document.createElement("div");
      footnote.className = "toolkit-browser__footnote";

      const rerender = () => render(results, summary, footnote);

      const controls = document.createElement("section");
      controls.className = "toolkit-browser__controls";

      const searchWrapper = document.createElement("label");
      searchWrapper.className = "toolkit-browser__search";
      searchWrapper.textContent = "Search toolkits";
      const searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.placeholder = "Name, description, tag, maintainer…";
      searchInput.setAttribute("aria-label", "Search toolkits");
      searchInput.addEventListener("input", () => {
        state.search = searchInput.value;
        rerender();
      });
      searchWrapper.append(searchInput);
      controls.append(searchWrapper);

      const filtersColumn = document.createElement("div");
      filtersColumn.className = "toolkit-browser__filters";

      const onCategoryChange = (value, checked) => {
        if (checked) {
          state.selectedCategories.add(value);
        } else {
          state.selectedCategories.delete(value);
        }
        rerender();
      };

      const onTagChange = (value, checked) => {
        if (checked) {
          state.selectedTags.add(value);
        } else {
          state.selectedTags.delete(value);
        }
        rerender();
      };

      filtersColumn.append(
        buildFilters("Categories", state.categories, onCategoryChange),
        buildFilters("Tags", state.tags, onTagChange),
      );

      controls.append(filtersColumn);

      root.append(controls, summary, results, footnote);

      rerender();
    };

    loadCatalog()
      .then(({ payload, source }) => {
        const toolkits = Array.isArray(payload?.toolkits) ? payload.toolkits : [];
        toolkits.sort((a, b) => collator.compare(a.name || a.slug, b.name || b.slug));
        state.toolkits = toolkits;
        state.categories = Array.from(new Set(toolkits.flatMap((item) => item.categories || []))).sort((a, b) => collator.compare(a, b));
        state.tags = Array.from(new Set(toolkits.flatMap((item) => item.tags || []))).sort((a, b) => collator.compare(a, b));
        state.source = source;
        initialise();
      })
      .catch((error) => {
        root.innerHTML = "";
        const message = document.createElement("div");
        message.className = "toolkit-browser__error";
        message.textContent = `Unable to load the catalog: ${error.message}`;
        root.append(message);
      });
  })();
</script>
