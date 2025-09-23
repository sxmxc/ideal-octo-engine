// ../toolkits/latency_sleuth/frontend/runtime.ts
function getToolkitRuntime() {
  if (typeof window === "undefined" || !window.__SRE_TOOLKIT_RUNTIME) {
    throw new Error("SRE Toolkit runtime not injected yet");
  }
  return window.__SRE_TOOLKIT_RUNTIME;
}
function getReactRuntime() {
  return getToolkitRuntime().react;
}
function getRouterRuntime() {
  return getToolkitRuntime().reactRouterDom;
}
function apiFetch(path, options = {}) {
  const runtime = getToolkitRuntime();
  const headers = new Headers(options.headers);
  if (options.json !== void 0) {
    headers.set("Content-Type", "application/json");
  }
  const request = {
    ...options,
    headers,
    body: options.json !== void 0 ? JSON.stringify(options.json) : options.body
  };
  return runtime.apiFetch(path, request);
}

// ../toolkits/latency_sleuth/frontend/hooks/useProbeTemplates.ts
var React = getReactRuntime();
var { useCallback, useEffect, useMemo, useRef, useState } = React;
function useProbeTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(
        "/toolkits/latency_sleuth/probe-templates"
      );
      if (!activeRef.current) return;
      response.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setTemplates(response);
    } catch (err) {
      if (!activeRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const createTemplate = useCallback(
    async (payload) => {
      const created = await apiFetch(
        "/toolkits/latency_sleuth/probe-templates",
        { method: "POST", json: payload }
      );
      if (activeRef.current) {
        setTemplates((prev) => [...prev, created]);
      }
      return created;
    },
    []
  );
  const updateTemplate = useCallback(
    async (templateId, payload) => {
      const updated = await apiFetch(
        `/toolkits/latency_sleuth/probe-templates/${templateId}`,
        { method: "PUT", json: payload }
      );
      if (activeRef.current) {
        setTemplates((prev) => prev.map((item) => item.id === templateId ? updated : item));
      }
      return updated;
    },
    []
  );
  const removeTemplate = useCallback(async (templateId) => {
    await apiFetch(`/toolkits/latency_sleuth/probe-templates/${templateId}`, { method: "DELETE" });
    if (activeRef.current) {
      setTemplates((prev) => prev.filter((item) => item.id !== templateId));
    }
  }, []);
  const templatesById = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const template of templates) {
      map.set(template.id, template);
    }
    return map;
  }, [templates]);
  return {
    templates,
    templatesById,
    loading,
    error,
    refresh,
    createTemplate,
    updateTemplate,
    removeTemplate
  };
}

// ../toolkits/latency_sleuth/frontend/components/filterProbeTemplates.ts
function normalizeSearch(searchText) {
  return (searchText ?? "").trim().toLowerCase();
}
function normalizeTags(selectedTags) {
  const seen = /* @__PURE__ */ new Set();
  const normalized = [];
  for (const raw of selectedTags ?? []) {
    const tag = raw.trim();
    if (!tag) continue;
    const lower = tag.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    normalized.push(lower);
  }
  return normalized;
}
function collectAvailableTags(templates) {
  const unique = /* @__PURE__ */ new Set();
  for (const template of templates) {
    for (const tag of template.tags ?? []) {
      const normalized = tag.trim();
      if (!normalized) continue;
      unique.add(normalized);
    }
  }
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}
function matchesSearch(template, search) {
  if (!search) return true;
  const haystack = `${template.name}
${template.url}`.toLowerCase();
  return haystack.includes(search);
}
function matchesTags(template, normalizedTags) {
  if (normalizedTags.length === 0) return true;
  const templateTags = new Set((template.tags ?? []).map((tag) => tag.toLowerCase()));
  for (const tag of normalizedTags) {
    if (!templateTags.has(tag)) {
      return false;
    }
  }
  return true;
}
function filterProbeTemplates(templates, options = {}) {
  const search = normalizeSearch(options.searchText);
  const normalizedTags = normalizeTags(options.selectedTags);
  const availableTags = collectAvailableTags(templates);
  const filteredTemplates = templates.filter(
    (template) => matchesSearch(template, search) && matchesTags(template, normalizedTags)
  );
  return { availableTags, filteredTemplates };
}

// ../toolkits/latency_sleuth/frontend/components/ProbeDesigner.tsx
var React2 = getReactRuntime();
var { useEffect: useEffect2, useMemo: useMemo2, useState: useState2 } = React2;
var methods = ["GET", "HEAD", "POST"];
var channels = ["slack", "email", "pagerduty", "webhook"];
var thresholds = ["breach", "always", "recovery"];
var formDefaults = {
  name: "",
  url: "https://example.com/healthz",
  method: "GET",
  sla_ms: 500,
  interval_seconds: 300,
  notification_rules: [],
  tags: []
};
function toFormState(template) {
  return {
    name: template.name,
    description: template.description ?? void 0,
    url: template.url,
    method: template.method,
    sla_ms: template.sla_ms,
    interval_seconds: template.interval_seconds,
    notification_rules: template.notification_rules.map((rule) => ({ ...rule })),
    tags: [...template.tags]
  };
}
function TemplateFilters({
  searchText,
  onSearchChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onClear
}) {
  return /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label", style: { display: "grid", gap: "0.35rem" } }, "Search", /* @__PURE__ */ React2.createElement(
    "input",
    {
      className: "tk-input",
      placeholder: "Filter by name or URL",
      value: searchText,
      onChange: (event) => onSearchChange(event.target.value)
    }
  )), availableTags.length > 0 && /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.35rem" } }, /* @__PURE__ */ React2.createElement("span", { className: "tk-field-label" }, "Tags"), /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.5rem" } }, availableTags.map((tag) => {
    const selected = selectedTags.includes(tag);
    const className = selected ? "tk-button tk-button--primary" : "tk-button";
    return /* @__PURE__ */ React2.createElement(
      "button",
      {
        key: tag,
        type: "button",
        className,
        onClick: () => onToggleTag(tag),
        "aria-pressed": selected
      },
      tag
    );
  }), selectedTags.length > 0 && /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: onClear }, "Clear"))));
}
function ProbeDesigner() {
  const {
    templates,
    templatesById,
    createTemplate,
    updateTemplate,
    removeTemplate,
    refresh,
    loading,
    error
  } = useProbeTemplates();
  const [formState, setFormState] = useState2(formDefaults);
  const [status, setStatus] = useState2(null);
  const [formMode, setFormMode] = useState2("create");
  const [activeTemplateId, setActiveTemplateId] = useState2(null);
  const [searchText, setSearchText] = useState2("");
  const [selectedTags, setSelectedTags] = useState2([]);
  useEffect2(() => {
    if (!activeTemplateId) return;
    const template = templatesById.get(activeTemplateId);
    if (!template) return;
    setFormState(toFormState(template));
  }, [activeTemplateId, templatesById]);
  const sortedTemplates = useMemo2(
    () => [...templates].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ),
    [templates]
  );
  const { availableTags, filteredTemplates } = useMemo2(
    () => filterProbeTemplates(sortedTemplates, {
      searchText,
      selectedTags
    }),
    [sortedTemplates, searchText, selectedTags]
  );
  const activeTemplateName = activeTemplateId ? templatesById.get(activeTemplateId)?.name ?? null : null;
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    const payload = {
      ...formState,
      notification_rules: formState.notification_rules?.filter((rule) => rule.target.trim().length > 0),
      tags: formState.tags?.filter((tag) => tag.trim().length > 0) ?? []
    };
    try {
      if (formMode === "edit" && activeTemplateId) {
        await updateTemplate(activeTemplateId, payload);
        setStatus("Probe template updated");
      } else {
        await createTemplate(payload);
        setStatus("Probe template created");
      }
      setFormState(formDefaults);
      if (formMode === "edit") {
        setFormMode("create");
        setActiveTemplateId(null);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to save template");
    }
  };
  const handleReset = () => {
    setFormState(formDefaults);
    setFormMode("create");
    setActiveTemplateId(null);
    setStatus(null);
  };
  const handleRuleChange = (index, key, value) => {
    setFormState((prev) => {
      const rules = [...prev.notification_rules ?? []];
      const current = rules[index] ?? { channel: "slack", target: "", threshold: "breach" };
      rules[index] = { ...current, [key]: value };
      return { ...prev, notification_rules: rules };
    });
  };
  const addRule = () => {
    setFormState((prev) => ({
      ...prev,
      notification_rules: [...prev.notification_rules ?? [], { channel: "slack", target: "", threshold: "breach" }]
    }));
  };
  const removeRule = (index) => {
    setFormState((prev) => ({
      ...prev,
      notification_rules: (prev.notification_rules ?? []).filter((_, idx) => idx !== index)
    }));
  };
  const updateTag = (index, value) => {
    setFormState((prev) => {
      const tags = [...prev.tags ?? []];
      tags[index] = value;
      return { ...prev, tags };
    });
  };
  const addTag = () => {
    setFormState((prev) => ({ ...prev, tags: [...prev.tags ?? [], ""] }));
  };
  const removeTag = (index) => {
    setFormState((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((_, idx) => idx !== index)
    }));
  };
  const beginEdit = (templateId) => {
    setActiveTemplateId(templateId);
    setFormMode("edit");
    setStatus(null);
  };
  const beginClone = (template) => {
    const cloned = toFormState(template);
    cloned.name = `${template.name} copy`;
    setFormState(cloned);
    setFormMode("create");
    setActiveTemplateId(null);
    setStatus("Cloning template \u2014 adjust fields before saving");
  };
  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]);
  };
  return /* @__PURE__ */ React2.createElement("div", { className: "tk-card", style: { padding: "1.5rem", display: "grid", gap: "1.5rem" } }, /* @__PURE__ */ React2.createElement("header", null, /* @__PURE__ */ React2.createElement("h3", { style: { margin: 0 } }, "Probe Designer"), /* @__PURE__ */ React2.createElement("p", { style: { margin: "0.35rem 0 0", color: "var(--color-text-secondary)" } }, "Model SLAs, tags, and notification policies before releasing synthetic probes.")), /* @__PURE__ */ React2.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "flex-start"
      }
    },
    /* @__PURE__ */ React2.createElement(
      "form",
      {
        onSubmit: handleSubmit,
        style: {
          flex: "1 1 320px",
          maxWidth: 480,
          display: "grid",
          gap: "0.75rem",
          paddingRight: "0.5rem"
        }
      },
      /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label" }, "Name"), /* @__PURE__ */ React2.createElement(
        "input",
        {
          className: "tk-input",
          required: true,
          value: formState.name,
          onChange: (event) => setFormState((prev) => ({ ...prev, name: event.target.value }))
        }
      )),
      /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label" }, "URL"), /* @__PURE__ */ React2.createElement(
        "input",
        {
          className: "tk-input",
          required: true,
          type: "url",
          value: formState.url,
          onChange: (event) => setFormState((prev) => ({ ...prev, url: event.target.value }))
        }
      )),
      /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" } }, /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label", style: { flex: "1 0 200px" } }, "Method", /* @__PURE__ */ React2.createElement(
        "select",
        {
          className: "tk-select",
          value: formState.method,
          onChange: (event) => setFormState((prev) => ({ ...prev, method: event.target.value }))
        },
        methods.map((method) => /* @__PURE__ */ React2.createElement("option", { key: method }, method))
      )), /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label", style: { flex: "1 0 200px" } }, "SLA (ms)", /* @__PURE__ */ React2.createElement(
        "input",
        {
          className: "tk-input",
          required: true,
          type: "number",
          min: 10,
          value: formState.sla_ms,
          onChange: (event) => setFormState((prev) => ({ ...prev, sla_ms: Number(event.target.value) }))
        }
      )), /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label", style: { flex: "1 0 200px" } }, "Interval (seconds)", /* @__PURE__ */ React2.createElement(
        "input",
        {
          className: "tk-input",
          type: "number",
          min: 30,
          value: formState.interval_seconds ?? 300,
          onChange: (event) => setFormState((prev) => ({ ...prev, interval_seconds: Number(event.target.value) }))
        }
      ))),
      /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label", style: { marginBottom: "0.3rem" } }, "Notification Rules"), /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, (formState.notification_rules ?? []).map((rule, index) => /* @__PURE__ */ React2.createElement(
        "div",
        {
          key: index,
          style: { display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(3, minmax(120px, 1fr)) auto" }
        },
        /* @__PURE__ */ React2.createElement(
          "select",
          {
            className: "tk-select",
            value: rule.channel,
            onChange: (event) => handleRuleChange(index, "channel", event.target.value)
          },
          channels.map((channel) => /* @__PURE__ */ React2.createElement("option", { key: channel, value: channel }, channel))
        ),
        /* @__PURE__ */ React2.createElement(
          "input",
          {
            className: "tk-input",
            placeholder: "Target",
            value: rule.target,
            onChange: (event) => handleRuleChange(index, "target", event.target.value)
          }
        ),
        /* @__PURE__ */ React2.createElement(
          "select",
          {
            className: "tk-select",
            value: rule.threshold,
            onChange: (event) => handleRuleChange(index, "threshold", event.target.value)
          },
          thresholds.map((threshold) => /* @__PURE__ */ React2.createElement("option", { key: threshold, value: threshold }, threshold))
        ),
        /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: () => removeRule(index) }, "Remove")
      )), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: addRule }, "Add rule"))),
      /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("label", { className: "tk-field-label", style: { marginBottom: "0.3rem" } }, "Tags"), /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, (formState.tags ?? []).map((tag, index) => /* @__PURE__ */ React2.createElement("div", { key: index, style: { display: "flex", gap: "0.5rem" } }, /* @__PURE__ */ React2.createElement(
        "input",
        {
          className: "tk-input",
          placeholder: "service:web",
          value: tag,
          onChange: (event) => updateTag(index, event.target.value)
        }
      ), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: () => removeTag(index) }, "Remove"))), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: addTag }, "Add tag"))),
      /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React2.createElement("button", { type: "submit", className: "tk-button tk-button--primary", disabled: loading }, formMode === "edit" ? "Update template" : "Create template"), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: handleReset }, formMode === "edit" ? "Cancel edit" : "Reset"), loading && /* @__PURE__ */ React2.createElement("span", { style: { color: "var(--color-text-secondary)" } }, "Saving\u2026")),
      /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.25rem" } }, formMode === "edit" && activeTemplateName && /* @__PURE__ */ React2.createElement("span", { style: { color: "var(--color-accent)" } }, "Editing \u201C", activeTemplateName, "\u201D \u2014 submit to apply changes or cancel to discard."), status && /* @__PURE__ */ React2.createElement("span", { style: { color: "var(--color-text-secondary)" } }, status), error && /* @__PURE__ */ React2.createElement("span", { style: { color: "var(--color-status-error)" } }, error))
    ),
    /* @__PURE__ */ React2.createElement("section", { style: { flex: "2 1 440px", minWidth: 320, display: "grid", gap: "1rem" } }, /* @__PURE__ */ React2.createElement(
      "header",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap"
        }
      },
      /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("h3", { style: { margin: 0 } }, "Template Catalog"), /* @__PURE__ */ React2.createElement("p", { style: { margin: "0.25rem 0 0", color: "var(--color-text-secondary)" } }, "Filter templates, edit in place, or clone successful probes.")),
      /* @__PURE__ */ React2.createElement("button", { className: "tk-button", type: "button", onClick: () => refresh(), disabled: loading }, "Refresh")
    ), /* @__PURE__ */ React2.createElement(
      TemplateFilters,
      {
        searchText,
        onSearchChange: setSearchText,
        availableTags,
        selectedTags,
        onToggleTag: toggleTag,
        onClear: () => setSelectedTags([])
      }
    ), /* @__PURE__ */ React2.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React2.createElement("table", { className: "tk-table" }, /* @__PURE__ */ React2.createElement("thead", null, /* @__PURE__ */ React2.createElement("tr", null, /* @__PURE__ */ React2.createElement("th", null, "Name"), /* @__PURE__ */ React2.createElement("th", null, "URL"), /* @__PURE__ */ React2.createElement("th", null, "SLA (ms)"), /* @__PURE__ */ React2.createElement("th", null, "Interval"), /* @__PURE__ */ React2.createElement("th", null, "Tags"), /* @__PURE__ */ React2.createElement("th", null, "Next run"), /* @__PURE__ */ React2.createElement("th", null, "Updated"), /* @__PURE__ */ React2.createElement("th", { style: { minWidth: 180 } }, "Actions"))), /* @__PURE__ */ React2.createElement("tbody", null, filteredTemplates.map((template) => {
      const isEditing = formMode === "edit" && activeTemplateId === template.id;
      return /* @__PURE__ */ React2.createElement("tr", { key: template.id, style: isEditing ? { outline: "2px solid var(--color-accent)" } : void 0 }, /* @__PURE__ */ React2.createElement("td", null, template.name), /* @__PURE__ */ React2.createElement("td", { style: { maxWidth: 240, wordBreak: "break-all" } }, template.url), /* @__PURE__ */ React2.createElement("td", null, template.sla_ms), /* @__PURE__ */ React2.createElement("td", null, template.interval_seconds, "s"), /* @__PURE__ */ React2.createElement("td", null, template.tags.join(", ")), /* @__PURE__ */ React2.createElement("td", null, template.next_run_at ? new Date(template.next_run_at).toLocaleString() : "Pending"), /* @__PURE__ */ React2.createElement("td", null, new Date(template.updated_at).toLocaleString()), /* @__PURE__ */ React2.createElement("td", null, /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", gap: "0.35rem", flexWrap: "wrap" } }, /* @__PURE__ */ React2.createElement(
        "button",
        {
          className: "tk-button",
          type: "button",
          onClick: () => beginEdit(template.id)
        },
        "Edit"
      ), /* @__PURE__ */ React2.createElement(
        "button",
        {
          className: "tk-button",
          type: "button",
          onClick: () => beginClone(template)
        },
        "Clone"
      ), /* @__PURE__ */ React2.createElement(
        "button",
        {
          className: "tk-button",
          type: "button",
          onClick: () => removeTemplate(template.id)
        },
        "Delete"
      ))));
    }), filteredTemplates.length === 0 && /* @__PURE__ */ React2.createElement("tr", null, /* @__PURE__ */ React2.createElement("td", { colSpan: 8, style: { textAlign: "center", padding: "1rem" } }, loading ? "Loading templates\u2026" : searchText || selectedTags.length > 0 ? "No templates match the current filters." : "No templates captured yet."))))))
  ));
}

// ../toolkits/latency_sleuth/frontend/hooks/useJobStream.ts
var React3 = getReactRuntime();
var { useCallback: useCallback2, useEffect: useEffect3, useRef: useRef2, useState: useState3 } = React3;
var TERMINAL_STATUSES = /* @__PURE__ */ new Set(["succeeded", "failed", "cancelled"]);
function useJobStream(jobId, pollInterval = 2e3) {
  const [job, setJob] = useState3(null);
  const [loading, setLoading] = useState3(false);
  const [error, setError] = useState3(null);
  const activeRef = useRef2(true);
  useEffect3(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);
  const fetchJob = useCallback2(
    async (currentJobId) => {
      setLoading(true);
      try {
        const response = await apiFetch(
          `/toolkits/latency_sleuth/jobs/${currentJobId}`
        );
        if (!activeRef.current) return response;
        setJob(response);
        setError(null);
        return response;
      } catch (err) {
        if (!activeRef.current) return null;
        setError(err instanceof Error ? err.message : "Failed to load job status");
        throw err;
      } finally {
        if (activeRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );
  useEffect3(() => {
    if (!jobId) {
      setJob(null);
      setError(null);
      setLoading(false);
      return () => {
      };
    }
    let cancelled = false;
    let timer;
    const poll = async () => {
      try {
        const response = await fetchJob(jobId);
        if (!response || TERMINAL_STATUSES.has(response.status) || cancelled) {
          return;
        }
        timer = setTimeout(poll, pollInterval);
      } catch {
        timer = setTimeout(poll, pollInterval * 2);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, pollInterval, fetchJob]);
  return {
    job,
    loading,
    error,
    refresh: jobId ? () => fetchJob(jobId) : async () => null
  };
}

// ../toolkits/latency_sleuth/frontend/hooks/useToolkitJobs.ts
var React4 = getReactRuntime();
var { useCallback: useCallback3, useEffect: useEffect4, useRef: useRef3, useState: useState4 } = React4;
function useToolkitJobs(templateId, pollInterval = 1e4) {
  const [jobs, setJobs] = useState4([]);
  const [loading, setLoading] = useState4(false);
  const [error, setError] = useState4(null);
  const activeRef = useRef3(true);
  useEffect4(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);
  const fetchJobs = useCallback3(async () => {
    if (!templateId) {
      setJobs([]);
      setError(null);
      return [];
    }
    setLoading(true);
    try {
      const response = await apiFetch(
        `/toolkits/latency_sleuth/jobs?template_id=${encodeURIComponent(templateId)}`
      );
      if (!activeRef.current) return response;
      setJobs(response);
      setError(null);
      return response;
    } catch (err) {
      if (!activeRef.current) return [];
      const message = err instanceof Error ? err.message : "Failed to load jobs";
      setError(message);
      throw err;
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  }, [templateId]);
  useEffect4(() => {
    if (!templateId) {
      setJobs([]);
      setError(null);
      return () => {
      };
    }
    let cancelled = false;
    let timer;
    const poll = async () => {
      try {
        await fetchJobs();
        if (cancelled) return;
        timer = setTimeout(poll, pollInterval);
      } catch {
        if (cancelled) return;
        timer = setTimeout(poll, pollInterval * 2);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [templateId, pollInterval, fetchJobs]);
  return {
    jobs,
    loading,
    error,
    refresh: fetchJobs
  };
}

// ../toolkits/latency_sleuth/frontend/hooks/usePaginatedJobs.ts
var React5 = getReactRuntime();
var { useCallback: useCallback4, useEffect: useEffect5, useMemo: useMemo3, useRef: useRef4, useState: useState5 } = React5;
function normalisePageSize(size) {
  if (!size || Number.isNaN(size) || size < 1) {
    return 10;
  }
  return Math.floor(size);
}
function usePaginatedJobs(templateId, options = {}) {
  const pageSize = normalisePageSize(options.pageSize);
  const {
    jobs: allJobs,
    loading,
    error,
    refresh
  } = useToolkitJobs(templateId);
  const [pages, setPages] = useState5(1);
  const latestJobRef = useRef4(null);
  const latestJobId = allJobs.length > 0 ? allJobs[0].id : null;
  useEffect5(() => {
    setPages(1);
    latestJobRef.current = latestJobId;
  }, [templateId]);
  useEffect5(() => {
    if (latestJobRef.current && latestJobId && latestJobRef.current !== latestJobId) {
      setPages(1);
    }
    latestJobRef.current = latestJobId;
  }, [latestJobId]);
  useEffect5(() => {
    const maxPages = Math.max(Math.ceil(allJobs.length / pageSize), 1);
    setPages((previous) => Math.min(previous, maxPages));
  }, [allJobs.length, pageSize]);
  const jobs = useMemo3(() => allJobs.slice(0, pageSize * pages), [allJobs, pageSize, pages]);
  const hasMore = jobs.length < allJobs.length;
  const loadMore = useCallback4(() => {
    if (!hasMore) return;
    setPages((previous) => previous + 1);
  }, [hasMore]);
  const reset = useCallback4(() => setPages(1), []);
  return {
    jobs,
    allJobs,
    totalJobs: allJobs.length,
    hasMore,
    loadMore,
    loading,
    error,
    refresh,
    pageSize,
    reset
  };
}

// ../toolkits/latency_sleuth/frontend/components/JobLogViewer.tsx
var React6 = getReactRuntime();
var { useEffect: useEffect6, useMemo: useMemo4, useState: useState6 } = React6;
function formatRelativeTime(value) {
  if (!value) return "\u2014";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "\u2014";
  const diff = Date.now() - timestamp;
  const abs = Math.abs(diff);
  const seconds = Math.round(abs / 1e3);
  if (seconds < 60) {
    return diff >= 0 ? `${seconds}s ago` : `in ${seconds}s`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return diff >= 0 ? `${minutes}m ago` : `in ${minutes}m`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return diff >= 0 ? `${hours}h ago` : `in ${hours}h`;
  }
  const days = Math.round(hours / 24);
  return diff >= 0 ? `${days}d ago` : `in ${days}d`;
}
function JobLogViewer() {
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    refresh: refreshTemplates
  } = useProbeTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState6(null);
  const [jobId, setJobId] = useState6(null);
  const [preview, setPreview] = useState6(null);
  const [status, setStatus] = useState6(null);
  const { job, loading: jobLoading, error: jobError, refresh } = useJobStream(jobId);
  const {
    jobs: visibleJobs,
    allJobs,
    totalJobs,
    hasMore,
    loadMore,
    loading: jobsLoading,
    error: jobsError,
    refresh: refreshJobs
  } = usePaginatedJobs(selectedTemplate);
  const [lastJobsSignature, setLastJobsSignature] = useState6(null);
  const templateOptions = useMemo4(
    () => templates.map((template) => ({
      id: template.id,
      label: `${template.name} \u2013 SLA ${template.sla_ms}ms`
    })),
    [templates]
  );
  const currentTemplate = useMemo4(
    () => templates.find((template) => template.id === selectedTemplate) ?? null,
    [templates, selectedTemplate]
  );
  useEffect6(() => {
    setJobId(null);
    setPreview(null);
    setStatus(null);
    setLastJobsSignature(null);
  }, [selectedTemplate]);
  useEffect6(() => {
    if (allJobs.length === 0) {
      return;
    }
    const signature = allJobs[0]?.updated_at || allJobs[0]?.created_at;
    if (signature && signature !== lastJobsSignature) {
      setLastJobsSignature(signature);
      refreshTemplates();
    }
  }, [allJobs, lastJobsSignature, refreshTemplates]);
  useEffect6(() => {
    if (jobId || visibleJobs.length === 0) {
      return;
    }
    setJobId(visibleJobs[0].id);
  }, [visibleJobs, jobId]);
  const triggerPreview = async () => {
    if (!currentTemplate) return;
    try {
      const response = await apiFetch(
        `/toolkits/latency_sleuth/probe-templates/${currentTemplate.id}/actions/preview`,
        { method: "POST", json: { sample_size: 3 } }
      );
      setPreview(response);
      setStatus("Preview generated");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to preview probe");
    }
  };
  const triggerRun = async () => {
    if (!currentTemplate) return;
    setStatus(null);
    setJobId(null);
    try {
      const response = await apiFetch(
        `/toolkits/latency_sleuth/probe-templates/${currentTemplate.id}/actions/run`,
        { method: "POST", json: { sample_size: 3 } }
      );
      setJobId(response.job.id);
      setStatus("Probe dispatched to workers");
      try {
        await refreshJobs();
      } catch (err) {
        console.warn("Failed to refresh job list after manual run", err);
      }
      refreshTemplates();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to start probe");
    }
  };
  const latestJob = allJobs.length > 0 ? allJobs[0] : null;
  const renderLogs = () => {
    if (!job) {
      return /* @__PURE__ */ React6.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "Select a run to stream logs.");
    }
    return /* @__PURE__ */ React6.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, /* @__PURE__ */ React6.createElement("header", { style: { display: "flex", gap: "0.75rem", alignItems: "center" } }, /* @__PURE__ */ React6.createElement("strong", null, "Job status: ", job.status), /* @__PURE__ */ React6.createElement("span", null, "Progress: ", job.progress, "%"), /* @__PURE__ */ React6.createElement("button", { type: "button", className: "tk-button", onClick: () => refresh(), disabled: jobLoading }, "Refresh")), /* @__PURE__ */ React6.createElement("div", { className: "tk-log-viewer" }, /* @__PURE__ */ React6.createElement("ul", { style: { margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.35rem" } }, job.logs.map((log) => /* @__PURE__ */ React6.createElement("li", { key: log.ts, style: { fontFamily: "var(--font-mono)" } }, /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-text-secondary)" } }, new Date(log.ts).toLocaleTimeString(), " "), log.message)))), job.result && /* @__PURE__ */ React6.createElement("pre", { className: "tk-code-block", style: { whiteSpace: "pre-wrap" } }, JSON.stringify(job.result, null, 2)));
  };
  const renderJobTable = () => {
    if (!currentTemplate) {
      return /* @__PURE__ */ React6.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "Choose a template to inspect recent runs.");
    }
    if (jobsLoading && visibleJobs.length === 0) {
      return /* @__PURE__ */ React6.createElement("p", null, "Loading recent runs\u2026");
    }
    if (visibleJobs.length === 0) {
      return /* @__PURE__ */ React6.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "No probe executions recorded yet.");
    }
    return /* @__PURE__ */ React6.createElement("div", { style: { display: "grid", gap: "0.75rem" } }, /* @__PURE__ */ React6.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React6.createElement("table", { className: "tk-table" }, /* @__PURE__ */ React6.createElement("thead", null, /* @__PURE__ */ React6.createElement("tr", null, /* @__PURE__ */ React6.createElement("th", { style: { minWidth: 140 } }, "Run"), /* @__PURE__ */ React6.createElement("th", null, "Status"), /* @__PURE__ */ React6.createElement("th", null, "Progress"), /* @__PURE__ */ React6.createElement("th", null, "Updated"), /* @__PURE__ */ React6.createElement("th", null, "Action"))), /* @__PURE__ */ React6.createElement("tbody", null, visibleJobs.map((entry) => {
      const isActive = jobId === entry.id;
      const trigger = entry.logs?.[0]?.message?.includes("Scheduled run enqueued") ? "Scheduled" : "Manual";
      return /* @__PURE__ */ React6.createElement("tr", { key: entry.id, style: isActive ? { background: "var(--color-surface-muted)" } : void 0 }, /* @__PURE__ */ React6.createElement("td", null, /* @__PURE__ */ React6.createElement("div", { style: { display: "grid" } }, /* @__PURE__ */ React6.createElement("span", { style: { fontWeight: 600 } }, trigger), /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-text-secondary)" } }, new Date(entry.created_at).toLocaleString()))), /* @__PURE__ */ React6.createElement("td", { style: { textTransform: "capitalize" } }, entry.status), /* @__PURE__ */ React6.createElement("td", null, entry.progress ?? 0, "%"), /* @__PURE__ */ React6.createElement("td", null, formatRelativeTime(entry.updated_at)), /* @__PURE__ */ React6.createElement("td", null, /* @__PURE__ */ React6.createElement(
        "button",
        {
          type: "button",
          className: "tk-button",
          onClick: () => setJobId(entry.id),
          disabled: isActive
        },
        isActive ? "Viewing" : "View logs"
      )));
    })))), /* @__PURE__ */ React6.createElement("footer", { style: { display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" } }, /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-text-secondary)" } }, "Showing ", visibleJobs.length, " of ", totalJobs, " run", totalJobs === 1 ? "" : "s"), hasMore && /* @__PURE__ */ React6.createElement(
      "button",
      {
        type: "button",
        className: "tk-button",
        onClick: loadMore,
        disabled: jobsLoading
      },
      jobsLoading ? "Loading\u2026" : "Load older runs"
    )));
  };
  return /* @__PURE__ */ React6.createElement("div", { className: "tk-card", style: { padding: "1.25rem", display: "grid", gap: "1rem" } }, /* @__PURE__ */ React6.createElement("header", null, /* @__PURE__ */ React6.createElement("h3", { style: { margin: 0 } }, "Job Log Viewer"), /* @__PURE__ */ React6.createElement("p", { style: { margin: "0.25rem 0 0", color: "var(--color-text-secondary)" } }, "Dispatch probes and stream worker logs directly from Redis telemetry.")), /* @__PURE__ */ React6.createElement("div", { style: { display: "grid", gap: "0.75rem" } }, /* @__PURE__ */ React6.createElement("label", { className: "tk-field-label" }, "Probe template", /* @__PURE__ */ React6.createElement(
    "select",
    {
      className: "tk-select",
      value: selectedTemplate ?? "",
      onChange: (event) => setSelectedTemplate(event.target.value || null)
    },
    /* @__PURE__ */ React6.createElement("option", { value: "", disabled: true }, templatesLoading ? "Loading templates\u2026" : "Choose a template"),
    templateOptions.map((template) => /* @__PURE__ */ React6.createElement("option", { key: template.id, value: template.id }, template.label))
  )), templatesError && /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-status-error)" } }, templatesError), currentTemplate && /* @__PURE__ */ React6.createElement("div", { className: "tk-card", style: { padding: "1rem", background: "var(--color-surface-muted)" } }, /* @__PURE__ */ React6.createElement("h4", { style: { margin: "0 0 0.5rem" } }, "Scheduling"), /* @__PURE__ */ React6.createElement("p", { style: { margin: 0, color: "var(--color-text-secondary)" } }, "Next automatic run ", formatRelativeTime(currentTemplate.next_run_at ?? null), currentTemplate.next_run_at ? ` (${new Date(currentTemplate.next_run_at).toLocaleTimeString()})` : "", ".", latestJob && /* @__PURE__ */ React6.createElement(React6.Fragment, null, " ", "Last run ", formatRelativeTime(latestJob.updated_at), " \u2013 status ", latestJob.status, "."))), /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" } }, /* @__PURE__ */ React6.createElement("button", { className: "tk-button", type: "button", onClick: triggerPreview, disabled: !currentTemplate }, "Preview run"), /* @__PURE__ */ React6.createElement("button", { className: "tk-button tk-button--primary", type: "button", onClick: triggerRun, disabled: !currentTemplate }, "Run probe"), status && /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-text-secondary)" } }, status), jobError && /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-status-error)" } }, jobError), jobsError && /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--color-status-error)" } }, jobsError))), preview && /* @__PURE__ */ React6.createElement("section", { className: "tk-card", style: { background: "var(--color-surface-muted)", padding: "1rem" } }, /* @__PURE__ */ React6.createElement("h4", { style: { marginTop: 0 } }, "Preview summary"), /* @__PURE__ */ React6.createElement("p", { style: { margin: "0 0 0.5rem" } }, "Average latency ", preview.average_latency_ms, " ms with ", preview.breach_count, " breach(es)."), /* @__PURE__ */ React6.createElement("ul", { style: { margin: 0, paddingLeft: "1.25rem", display: "grid", gap: "0.25rem" } }, preview.samples.map((sample) => /* @__PURE__ */ React6.createElement("li", { key: sample.attempt }, "Attempt ", sample.attempt, ": ", sample.latency_ms, " ms \u2013 ", sample.breach ? "breach" : "ok")))), /* @__PURE__ */ React6.createElement("section", { style: { display: "grid", gap: "1rem" } }, /* @__PURE__ */ React6.createElement("div", { className: "tk-card", style: { padding: "1rem" } }, /* @__PURE__ */ React6.createElement("h4", { style: { marginTop: 0 } }, "Recent runs"), renderJobTable()), /* @__PURE__ */ React6.createElement("div", { className: "tk-card", style: { padding: "1rem" } }, /* @__PURE__ */ React6.createElement("h4", { style: { marginTop: 0 } }, "Live logs"), renderLogs())));
}

// ../toolkits/latency_sleuth/frontend/components/LatencyHeatmap.tsx
var React7 = getReactRuntime();
var { useEffect: useEffect7, useMemo: useMemo5, useState: useState7 } = React7;
function computeHeatColor(cell, slaMs) {
  const sla = slaMs || 1;
  const ratio = Math.max(0, Math.min(cell.latency_ms / sla, 2.5));
  const hue = Math.max(0, Math.min(120, 120 - ratio * 70));
  const saturation = 75;
  const lightness = cell.breach ? 45 : 55 + Math.max(0, 1 - ratio) * 10;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
function LatencyHeatmapView() {
  const { templates, loading: templatesLoading, error: templatesError } = useProbeTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState7(null);
  const [heatmap, setHeatmap] = useState7(null);
  const [loading, setLoading] = useState7(false);
  const [error, setError] = useState7(null);
  const [refreshToken, setRefreshToken] = useState7(0);
  const currentTemplate = useMemo5(
    () => templates.find((template) => template.id === selectedTemplate) ?? null,
    [templates, selectedTemplate]
  );
  useEffect7(() => {
    if (!currentTemplate) {
      setHeatmap(null);
      return;
    }
    let cancelled = false;
    const fetchHeatmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(
          `/toolkits/latency_sleuth/probe-templates/${currentTemplate.id}/heatmap`,
          { method: "GET" }
        );
        if (!cancelled) {
          setHeatmap(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load heatmap");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchHeatmap();
    return () => {
      cancelled = true;
    };
  }, [currentTemplate, refreshToken]);
  const renderLegend = () => {
    if (!currentTemplate) {
      return null;
    }
    const sampleValues = [0.5, 0.9, 1, 1.25, 1.5, 2];
    return /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React7.createElement("span", { style: { color: "var(--color-text-secondary)" } }, "Latency vs SLA"), sampleValues.map((ratio) => {
      const fakeCell = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        latency_ms: currentTemplate.sla_ms * ratio,
        breach: ratio > 1
      };
      return /* @__PURE__ */ React7.createElement(
        "span",
        {
          key: ratio,
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.85rem"
          }
        },
        /* @__PURE__ */ React7.createElement(
          "span",
          {
            style: {
              width: 18,
              height: 18,
              borderRadius: 4,
              background: computeHeatColor(fakeCell, currentTemplate.sla_ms),
              border: ratio > 1 ? "1px solid var(--color-status-error-border)" : "1px solid transparent"
            }
          }
        ),
        /* @__PURE__ */ React7.createElement("span", { style: { color: "var(--color-text-secondary)" } }, Math.round(ratio * 100), "%")
      );
    }));
  };
  const renderGrid = () => {
    if (!heatmap || heatmap.rows.length === 0) {
      return /* @__PURE__ */ React7.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "No probe executions recorded yet.");
    }
    return /* @__PURE__ */ React7.createElement("div", { style: { display: "grid", gap: "0.75rem" } }, heatmap.rows.map((row, rowIndex) => /* @__PURE__ */ React7.createElement(
      "div",
      {
        key: rowIndex,
        style: {
          display: "grid",
          gap: "0.5rem",
          gridTemplateColumns: `repeat(${heatmap.columns}, minmax(40px, 1fr))`
        }
      },
      row.map((cell, cellIndex) => /* @__PURE__ */ React7.createElement(
        "div",
        {
          key: cellIndex,
          title: `${new Date(cell.timestamp).toLocaleString()} \u2014 ${cell.latency_ms} ms`,
          style: {
            padding: "0.75rem 0.5rem",
            borderRadius: 6,
            border: cell.breach ? "1px solid var(--color-status-error-border)" : "1px solid transparent",
            background: computeHeatColor(cell, currentTemplate?.sla_ms),
            color: "var(--color-surface)",
            fontWeight: 600
          },
          role: "img",
          "aria-label": `${Math.round(cell.latency_ms)} ms on ${new Date(cell.timestamp).toLocaleString()}`
        },
        /* @__PURE__ */ React7.createElement("span", { style: { display: "block", fontSize: "0.9rem" } }, Math.round(cell.latency_ms))
      ))
    )));
  };
  return /* @__PURE__ */ React7.createElement("div", { className: "tk-card", style: { padding: "1.25rem", display: "grid", gap: "1rem" } }, /* @__PURE__ */ React7.createElement("header", null, /* @__PURE__ */ React7.createElement("h3", { style: { margin: 0 } }, "Latency Heatmap"), /* @__PURE__ */ React7.createElement("p", { style: { margin: "0.25rem 0 0", color: "var(--color-text-secondary)" } }, "Spot drift in synthetic response times and correlate with SLA breaches.")), /* @__PURE__ */ React7.createElement("label", { className: "tk-field-label" }, "Probe template", /* @__PURE__ */ React7.createElement(
    "select",
    {
      className: "tk-select",
      value: selectedTemplate ?? "",
      onChange: (event) => setSelectedTemplate(event.target.value || null)
    },
    /* @__PURE__ */ React7.createElement("option", { value: "", disabled: true }, templatesLoading ? "Loading templates\u2026" : "Choose a template"),
    templates.map((template) => /* @__PURE__ */ React7.createElement("option", { key: template.id, value: template.id }, template.name))
  )), templatesError && /* @__PURE__ */ React7.createElement("span", { style: { color: "var(--color-status-error)" } }, templatesError), error && /* @__PURE__ */ React7.createElement("span", { style: { color: "var(--color-status-error)" } }, error), currentTemplate && /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" } }, renderLegend(), /* @__PURE__ */ React7.createElement(
    "button",
    {
      className: "tk-button",
      type: "button",
      onClick: () => setRefreshToken((value) => value + 1),
      disabled: loading
    },
    "Refresh"
  )), loading ? /* @__PURE__ */ React7.createElement("p", null, "Loading heatmap\u2026") : renderGrid());
}

// ../toolkits/latency_sleuth/frontend/index.tsx
var React8 = getReactRuntime();
var Router = getRouterRuntime();
var { NavLink, Navigate, Route, Routes } = Router;
var navItems = [
  { label: "Designer", path: "", icon: "draw", exact: true },
  { label: "Job Logs", path: "jobs", icon: "receipt_long", exact: false },
  { label: "Heatmap", path: "heatmap", icon: "grid_view", exact: false }
];
var navStyle = {
  wrapper: {
    padding: "1.5rem",
    display: "grid",
    gap: "1.25rem",
    color: "var(--color-text-primary)"
  },
  nav: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap"
  },
  navLink(active) {
    return {
      padding: "0.5rem 0.85rem",
      borderRadius: 8,
      border: "1px solid var(--color-border)",
      textDecoration: "none",
      background: active ? "var(--color-accent)" : "transparent",
      color: active ? "var(--color-sidebar-item-active-text)" : "var(--color-link)",
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem"
    };
  }
};
function LatencySleuthApp() {
  return /* @__PURE__ */ React8.createElement("div", { className: "tk-card", style: navStyle.wrapper }, /* @__PURE__ */ React8.createElement("header", null, /* @__PURE__ */ React8.createElement("h2", { style: { margin: 0, display: "flex", gap: "0.5rem", alignItems: "center" } }, /* @__PURE__ */ React8.createElement("span", { className: "material-symbols-outlined", "aria-hidden": true }, "speed"), "Latency Sleuth"), /* @__PURE__ */ React8.createElement("p", { style: { margin: "0.35rem 0 0", color: "var(--color-text-secondary)" } }, "Synthetic probes purpose-built for latency investigations and SLA validation.")), /* @__PURE__ */ React8.createElement("nav", { style: navStyle.nav }, navItems.map((item) => /* @__PURE__ */ React8.createElement(NavLink, { key: item.label, to: item.path, end: item.exact, style: ({ isActive }) => navStyle.navLink(isActive) }, /* @__PURE__ */ React8.createElement("span", { className: "material-symbols-outlined", "aria-hidden": true }, item.icon), item.label))), /* @__PURE__ */ React8.createElement("section", null, /* @__PURE__ */ React8.createElement(Routes, null, /* @__PURE__ */ React8.createElement(Route, { index: true, element: /* @__PURE__ */ React8.createElement(ProbeDesigner, null) }), /* @__PURE__ */ React8.createElement(Route, { path: "jobs", element: /* @__PURE__ */ React8.createElement(JobLogViewer, null) }), /* @__PURE__ */ React8.createElement(Route, { path: "heatmap", element: /* @__PURE__ */ React8.createElement(LatencyHeatmapView, null) }), /* @__PURE__ */ React8.createElement(Route, { path: "*", element: /* @__PURE__ */ React8.createElement(Navigate, { to: ".", replace: true }) }))));
}
export {
  LatencySleuthApp as default
};
