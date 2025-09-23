// ../toolkits/connectivity/frontend/runtime.ts
function getToolkitRuntime() {
  if (typeof window === "undefined" || !window.__SRE_TOOLKIT_RUNTIME) {
    throw new Error("SRE Toolkit runtime not injected yet");
  }
  return window.__SRE_TOOLKIT_RUNTIME;
}
function apiFetch(path, options) {
  return getToolkitRuntime().apiFetch(path, options);
}
function getReactRuntime() {
  return getToolkitRuntime().react;
}
function getReactRouterRuntime() {
  return getToolkitRuntime().reactRouterDom;
}

// ../toolkits/connectivity/frontend/pages/hooks.ts
var React = getReactRuntime();
var { useCallback, useEffect, useMemo, useState } = React;
function useConnectivityTargets() {
  const [targets, setTargets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/toolkits/connectivity/targets");
      setTargets(data);
      setSelectedId((prev) => {
        if (prev && data.some((target) => target.id === prev)) {
          return prev;
        }
        return data.length > 0 ? data[0].id : "";
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const selectedTarget = useMemo(
    () => targets.find((target) => target.id === selectedId) ?? null,
    [targets, selectedId]
  );
  return {
    targets,
    selectedId,
    setSelectedId,
    selectedTarget,
    loading,
    error,
    refresh
  };
}

// ../toolkits/connectivity/frontend/pages/ConnectivityOverviewPage.tsx
var React2 = getReactRuntime();
var { useEffect: useEffect2, useMemo: useMemo2, useState: useState2 } = React2;
var iconStyle = {
  fontSize: "1.1rem",
  lineHeight: 1,
  color: "var(--color-link)"
};
var sectionStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  padding: "1.25rem",
  background: "var(--color-surface-alt)"
};
function ConnectivityOverviewPage() {
  const { targets, selectedId, setSelectedId, selectedTarget, loading, error, refresh } = useConnectivityTargets();
  const [jobs, setJobs] = useState2([]);
  const [preview, setPreview] = useState2({ loading: false, error: null, summary: null });
  const [repetitions, setRepetitions] = useState2(1);
  const [jobFeedback, setJobFeedback] = useState2(null);
  const [queueBusy, setQueueBusy] = useState2(false);
  useEffect2(() => {
    apiFetch("/jobs?toolkit=connectivity").then((response) => setJobs(response.jobs.slice(0, 5))).catch((err) => {
      console.error(err);
    });
  }, []);
  const totals = useMemo2(() => {
    const endpointCount = targets.reduce((sum, target) => sum + target.endpoint_count, 0);
    return {
      groups: targets.length,
      endpoints: endpointCount
    };
  }, [targets]);
  const runPreview = async () => {
    if (!selectedTarget) {
      return;
    }
    setPreview({ loading: true, error: null, summary: null });
    try {
      const summary = await apiFetch(
        `/toolkits/connectivity/targets/${selectedTarget.id}/actions/check/preview`,
        {
          method: "POST",
          body: JSON.stringify({ repetitions })
        }
      );
      setPreview({ loading: false, error: null, summary });
    } catch (err) {
      setPreview({ loading: false, error: err instanceof Error ? err.message : String(err), summary: null });
    }
  };
  const queueJob = async () => {
    if (!selectedTarget) {
      return;
    }
    setQueueBusy(true);
    setJobFeedback(null);
    try {
      await apiFetch(`/toolkits/connectivity/targets/${selectedTarget.id}/actions/check/execute`, {
        method: "POST",
        body: JSON.stringify({ repetitions })
      });
      setJobFeedback(`Queued connectivity job for "${selectedTarget.name}" (${repetitions} attempt${repetitions === 1 ? "" : "s"}).`);
      const response = await apiFetch("/jobs?toolkit=connectivity");
      setJobs(response.jobs.slice(0, 5));
    } catch (err) {
      setJobFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setQueueBusy(false);
    }
  };
  return /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "1.5rem", color: "var(--color-text-primary)" } }, /* @__PURE__ */ React2.createElement("section", { style: sectionStyle }, /* @__PURE__ */ React2.createElement("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("h4", { style: { margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React2.createElement("span", { className: "material-symbols-outlined", style: iconStyle, "aria-hidden": true }, "radar"), "Connectivity summary"), /* @__PURE__ */ React2.createElement("p", { style: { margin: "0.25rem 0 0", color: "var(--color-text-secondary)" } }, "Track configured probe groups and recent reachability jobs.")), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "tk-button",
      onClick: () => {
        refresh();
        apiFetch("/jobs?toolkit=connectivity").then((response) => setJobs(response.jobs.slice(0, 5))).catch((err) => console.error(err));
      }
    },
    /* @__PURE__ */ React2.createElement("span", { className: "material-symbols-outlined", style: iconStyle, "aria-hidden": true }, "refresh"),
    "Refresh"
  )), loading ? /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "Loading targets\u2026") : /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" } }, /* @__PURE__ */ React2.createElement(MetricCard, { label: "Probe groups", value: totals.groups }), /* @__PURE__ */ React2.createElement(MetricCard, { label: "Endpoints", value: totals.endpoints })), error && /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-danger-border)" } }, error)), /* @__PURE__ */ React2.createElement("section", { style: sectionStyle }, /* @__PURE__ */ React2.createElement("h4", { style: { marginTop: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React2.createElement("span", { className: "material-symbols-outlined", style: iconStyle, "aria-hidden": true }, "network_check"), "Quick preview"), targets.length === 0 ? /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "Create a probe group in the Targets tab to run a preview.") : /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.75rem" } }, /* @__PURE__ */ React2.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.3rem", maxWidth: 320 } }, "Probe group", /* @__PURE__ */ React2.createElement("select", { className: "tk-input", value: selectedId, onChange: (event) => setSelectedId(event.target.value) }, targets.map((target) => /* @__PURE__ */ React2.createElement("option", { key: target.id, value: target.id }, target.name)))), /* @__PURE__ */ React2.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.3rem", maxWidth: 160 } }, "Attempts", /* @__PURE__ */ React2.createElement(
    "input",
    {
      className: "tk-input",
      type: "number",
      min: 1,
      max: 10,
      value: repetitions,
      onChange: (event) => setRepetitions(Math.max(1, Math.min(10, Number(event.target.value) || 1)))
    }
  )), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button tk-button--primary", onClick: runPreview, disabled: preview.loading }, /* @__PURE__ */ React2.createElement("span", { className: "material-symbols-outlined", style: iconStyle, "aria-hidden": true }, "play_circle"), "Run preview"), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "tk-button", onClick: queueJob, disabled: queueBusy }, /* @__PURE__ */ React2.createElement("span", { className: "material-symbols-outlined", style: iconStyle, "aria-hidden": true }, "bolt"), "Queue job"), preview.loading && /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "Running probes\u2026"), preview.error && /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-danger-border)" } }, preview.error), preview.summary && /* @__PURE__ */ React2.createElement(PreviewTable, { summary: preview.summary }), jobFeedback && /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-text-secondary)" } }, jobFeedback))), /* @__PURE__ */ React2.createElement("section", { style: sectionStyle }, /* @__PURE__ */ React2.createElement("h4", { style: { marginTop: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React2.createElement("span", { className: "material-symbols-outlined", style: iconStyle, "aria-hidden": true }, "schedule"), "Recent jobs"), jobs.length === 0 ? /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "No recent connectivity jobs.") : /* @__PURE__ */ React2.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React2.createElement("thead", null, /* @__PURE__ */ React2.createElement("tr", { style: { textAlign: "left", background: "var(--color-surface-alt)" } }, /* @__PURE__ */ React2.createElement("th", { style: { padding: "0.5rem" } }, "Operation"), /* @__PURE__ */ React2.createElement("th", null, "Status"), /* @__PURE__ */ React2.createElement("th", null, "Progress"), /* @__PURE__ */ React2.createElement("th", null, "Updated"))), /* @__PURE__ */ React2.createElement("tbody", null, jobs.map((job) => /* @__PURE__ */ React2.createElement("tr", { key: job.id, style: { borderTop: "1px solid var(--color-border)" } }, /* @__PURE__ */ React2.createElement("td", { style: { padding: "0.5rem" } }, job.operation), /* @__PURE__ */ React2.createElement("td", { style: { textTransform: "capitalize" } }, job.status), /* @__PURE__ */ React2.createElement("td", null, job.progress, "%"), /* @__PURE__ */ React2.createElement("td", null, job.updated_at ? new Date(job.updated_at).toLocaleString() : "\u2014")))))));
}
function MetricCard({ label, value }) {
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      style: {
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "0.85rem 1.1rem",
        background: "var(--color-surface)",
        minWidth: 140
      }
    },
    /* @__PURE__ */ React2.createElement("div", { style: { fontSize: "0.8rem", color: "var(--color-text-secondary)" } }, label),
    /* @__PURE__ */ React2.createElement("div", { style: { fontSize: "1.6rem", fontWeight: 700 } }, value)
  );
}
function PreviewTable({ summary }) {
  const { useMemo: useMemo4 } = React2;
  const condensed = useMemo4(() => summary.results.slice(0, 10), [summary.results]);
  const showAttempt = summary.repetitions > 1;
  return /* @__PURE__ */ React2.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, /* @__PURE__ */ React2.createElement("div", { style: { color: "var(--color-text-secondary)", fontSize: "0.9rem" } }, summary.failures === 0 ? "All probes succeeded." : `${summary.failures} of ${summary.total_probes} probes reported failures.`), /* @__PURE__ */ React2.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React2.createElement("thead", null, /* @__PURE__ */ React2.createElement("tr", { style: { textAlign: "left", background: "var(--color-surface)" } }, showAttempt && /* @__PURE__ */ React2.createElement("th", { style: { padding: "0.4rem" } }, "Attempt"), /* @__PURE__ */ React2.createElement("th", { style: { padding: "0.4rem" } }, "Endpoint"), /* @__PURE__ */ React2.createElement("th", null, "Status"), /* @__PURE__ */ React2.createElement("th", null, "Latency"), /* @__PURE__ */ React2.createElement("th", null, "Message"))), /* @__PURE__ */ React2.createElement("tbody", null, condensed.map((result, idx) => /* @__PURE__ */ React2.createElement("tr", { key: `${result.host}-${result.port}-${idx}`, style: { borderTop: "1px solid var(--color-border)" } }, showAttempt && /* @__PURE__ */ React2.createElement("td", null, result.attempt), /* @__PURE__ */ React2.createElement("td", { style: { padding: "0.4rem" } }, result.host, ":", result.port, "/", result.protocol), /* @__PURE__ */ React2.createElement("td", { style: { color: result.status === "reachable" ? "var(--color-accent)" : "var(--color-danger-border)" } }, result.status), /* @__PURE__ */ React2.createElement("td", null, result.latency_ms, " ms"), /* @__PURE__ */ React2.createElement("td", null, result.message ?? "\u2014"))))), summary.results.length > 10 && /* @__PURE__ */ React2.createElement("p", { style: { color: "var(--color-text-secondary)", fontSize: "0.85rem" } }, "Showing first 10 results out of ", summary.total_probes, " probes."));
}

// ../toolkits/connectivity/frontend/pages/TargetsPage.tsx
var React3 = getReactRuntime();
var { useEffect: useEffect3, useMemo: useMemo3, useState: useState3 } = React3;
var sectionStyle2 = {
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  padding: "1.25rem",
  background: "var(--color-surface-alt)"
};
var iconStyle2 = {
  fontSize: "1.1rem",
  lineHeight: 1,
  color: "var(--color-link)"
};
var emptyEndpoint = {
  host: "",
  ports: "80,443"
};
function TargetsPage() {
  const { targets, selectedId, setSelectedId, selectedTarget, loading, error, refresh } = useConnectivityTargets();
  const [createForm, setCreateForm] = useState3({ name: "", description: "", endpoints: [emptyEndpoint] });
  const [editForm, setEditForm] = useState3({ name: "", description: "", endpoints: [emptyEndpoint] });
  const [busy, setBusy] = useState3(false);
  const [feedback, setFeedback] = useState3(null);
  useEffect3(() => {
    if (selectedTarget) {
      setEditForm({
        name: selectedTarget.name,
        description: selectedTarget.description ?? "",
        endpoints: selectedTarget.endpoints.length > 0 ? selectedTarget.endpoints.map((endpoint) => ({
          host: endpoint.host,
          ports: endpoint.ports.map((port) => port.protocol === "tcp" ? String(port.port) : `${port.port}/${port.protocol}`).join(", ")
        })) : [emptyEndpoint]
      });
    } else {
      setEditForm({ name: "", description: "", endpoints: [emptyEndpoint] });
    }
  }, [selectedTarget]);
  const endpointCount = useMemo3(
    () => targets.reduce((sum, target) => sum + target.endpoint_count, 0),
    [targets]
  );
  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const updateEndpoint = (formType, index, field, value) => {
    const setter = formType === "create" ? setCreateForm : setEditForm;
    setter((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((endpoint, idx) => idx === index ? { ...endpoint, [field]: value } : endpoint)
    }));
  };
  const addEndpoint = (formType) => {
    const setter = formType === "create" ? setCreateForm : setEditForm;
    setter((prev) => ({ ...prev, endpoints: [...prev.endpoints, { ...emptyEndpoint }] }));
  };
  const removeEndpoint = (formType, index) => {
    const setter = formType === "create" ? setCreateForm : setEditForm;
    setter((prev) => ({ ...prev, endpoints: prev.endpoints.filter((_, idx) => idx !== index) }));
  };
  const buildPayload = (form) => {
    const endpoints = form.endpoints.filter((endpoint) => endpoint.host.trim()).map((endpoint) => ({
      host: endpoint.host.trim(),
      ports: parsePorts(endpoint.ports)
    }));
    return {
      name: form.name.trim(),
      description: form.description.trim() || void 0,
      endpoints
    };
  };
  const createTarget = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const payload = buildPayload(createForm);
      if (!payload.name) {
        throw new Error("Name is required");
      }
      const created = await apiFetch("/toolkits/connectivity/targets", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setFeedback(`Created probe group "${created.name}".`);
      setCreateForm({ name: "", description: "", endpoints: [emptyEndpoint] });
      await refresh();
      setSelectedId(created.id);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };
  const updateTarget = async (event) => {
    event.preventDefault();
    if (!selectedTarget) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const payload = buildPayload(editForm);
      const updated = await apiFetch(
        `/toolkits/connectivity/targets/${selectedTarget.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload)
        }
      );
      setFeedback(`Updated probe group "${updated.name}".`);
      await refresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };
  const deleteTarget = async () => {
    if (!selectedTarget) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await apiFetch(`/toolkits/connectivity/targets/${selectedTarget.id}`, {
        method: "DELETE"
      });
      setFeedback(`Deleted probe group "${selectedTarget.name}".`);
      await refresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React3.createElement("div", { style: { display: "grid", gap: "1.5rem" } }, /* @__PURE__ */ React3.createElement("section", { style: sectionStyle2 }, /* @__PURE__ */ React3.createElement("h4", { style: { marginTop: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React3.createElement("span", { className: "material-symbols-outlined", style: iconStyle2, "aria-hidden": true }, "hub"), "Probe groups"), loading ? /* @__PURE__ */ React3.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "Loading\u2026") : /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", gap: "1rem", flexWrap: "wrap" } }, /* @__PURE__ */ React3.createElement("div", { style: { flex: "1 1 240px" } }, /* @__PURE__ */ React3.createElement("h5", { style: { margin: "0 0 0.5rem", color: "var(--color-text-secondary)" } }, "Groups (", targets.length, ")"), targets.length === 0 && /* @__PURE__ */ React3.createElement("p", { style: { color: "var(--color-text-secondary)" } }, "No probe groups yet."), /* @__PURE__ */ React3.createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" } }, targets.map((target) => /* @__PURE__ */ React3.createElement("li", { key: target.id }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      onClick: () => setSelectedId(target.id),
      style: {
        width: "100%",
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderRadius: 8,
        border: "1px solid",
        borderColor: selectedId === target.id ? "var(--color-link)" : "var(--color-border)",
        background: selectedId === target.id ? "var(--color-accent-soft)" : "var(--color-surface)"
      }
    },
    /* @__PURE__ */ React3.createElement("strong", null, target.name),
    /* @__PURE__ */ React3.createElement("div", { style: { fontSize: "0.8rem", color: "var(--color-text-secondary)" } }, target.endpoint_count, " endpoint", target.endpoint_count === 1 ? "" : "s")
  ))))), /* @__PURE__ */ React3.createElement("form", { style: { flex: "1 1 320px" }, onSubmit: createTarget }, /* @__PURE__ */ React3.createElement("h5", { style: { margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" } }, /* @__PURE__ */ React3.createElement("span", { className: "material-symbols-outlined", style: { ...iconStyle2, color: "var(--color-accent)" }, "aria-hidden": true }, "add_circle"), "Add group"), /* @__PURE__ */ React3.createElement(Field, { label: "Name" }, /* @__PURE__ */ React3.createElement("input", { className: "tk-input", name: "name", value: createForm.name, onChange: handleCreateChange, required: true })), /* @__PURE__ */ React3.createElement(Field, { label: "Description" }, /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      className: "tk-input",
      name: "description",
      value: createForm.description,
      onChange: handleCreateChange,
      rows: 2
    }
  )), /* @__PURE__ */ React3.createElement(
    EndpointList,
    {
      endpoints: createForm.endpoints,
      onChange: (index, field, value) => updateEndpoint("create", index, field, value),
      onAdd: () => addEndpoint("create"),
      onRemove: (index) => removeEndpoint("create", index)
    }
  ), /* @__PURE__ */ React3.createElement("button", { type: "submit", className: "tk-button tk-button--primary", disabled: busy, style: { marginTop: "0.75rem" } }, "Create")), selectedTarget && /* @__PURE__ */ React3.createElement("form", { style: { flex: "1 1 320px" }, onSubmit: updateTarget }, /* @__PURE__ */ React3.createElement("h5", { style: { margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" } }, /* @__PURE__ */ React3.createElement("span", { className: "material-symbols-outlined", style: iconStyle2, "aria-hidden": true }, "tune"), "Edit \u201C", selectedTarget.name, "\u201D"), /* @__PURE__ */ React3.createElement(Field, { label: "Name" }, /* @__PURE__ */ React3.createElement("input", { className: "tk-input", name: "name", value: editForm.name, onChange: handleEditChange, required: true })), /* @__PURE__ */ React3.createElement(Field, { label: "Description" }, /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      className: "tk-input",
      name: "description",
      value: editForm.description,
      onChange: handleEditChange,
      rows: 2
    }
  )), /* @__PURE__ */ React3.createElement(
    EndpointList,
    {
      endpoints: editForm.endpoints,
      onChange: (index, field, value) => updateEndpoint("edit", index, field, value),
      onAdd: () => addEndpoint("edit"),
      onRemove: (index) => removeEndpoint("edit", index)
    }
  ), /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", gap: "0.75rem", marginTop: "0.75rem" } }, /* @__PURE__ */ React3.createElement("button", { type: "submit", className: "tk-button tk-button--primary", disabled: busy }, "Save changes"), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "tk-button tk-button--danger", onClick: deleteTarget, disabled: busy }, "Delete")))), feedback && /* @__PURE__ */ React3.createElement("p", { style: { marginTop: "1rem", color: "var(--color-text-secondary)" } }, feedback)), /* @__PURE__ */ React3.createElement("section", { style: sectionStyle2 }, /* @__PURE__ */ React3.createElement("h4", { style: { marginTop: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React3.createElement("span", { className: "material-symbols-outlined", style: iconStyle2, "aria-hidden": true }, "data_thresholding"), "Inventory snapshot"), /* @__PURE__ */ React3.createElement("p", { style: { color: "var(--color-text-secondary)", margin: "0 0 0.5rem" } }, targets.length, " groups, ", endpointCount, " endpoints configured.")));
}
function Field({ label, children }) {
  return /* @__PURE__ */ React3.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.3rem", fontSize: "0.9rem" } }, label, children);
}
function EndpointList({
  endpoints,
  onChange,
  onAdd,
  onRemove
}) {
  return /* @__PURE__ */ React3.createElement("div", { style: { display: "grid", gap: "0.75rem", marginTop: "1rem" } }, /* @__PURE__ */ React3.createElement("h6", { style: { margin: 0, color: "var(--color-text-secondary)" } }, "Endpoints"), endpoints.map((endpoint, idx) => /* @__PURE__ */ React3.createElement(
    "div",
    {
      key: `${endpoint.host}-${idx}`,
      style: { border: "1px solid var(--color-border)", borderRadius: 8, padding: "0.75rem", background: "var(--color-surface)" }
    },
    /* @__PURE__ */ React3.createElement(Field, { label: "Host" }, /* @__PURE__ */ React3.createElement(
      "input",
      {
        className: "tk-input",
        value: endpoint.host,
        onChange: (event) => onChange(idx, "host", event.target.value),
        placeholder: "app.example.com"
      }
    )),
    /* @__PURE__ */ React3.createElement(Field, { label: "Ports (comma separated, use 53/udp for UDP)" }, /* @__PURE__ */ React3.createElement(
      "input",
      {
        className: "tk-input",
        value: endpoint.ports,
        onChange: (event) => onChange(idx, "ports", event.target.value),
        placeholder: "80,443,53/udp"
      }
    )),
    endpoints.length > 1 && /* @__PURE__ */ React3.createElement("button", { type: "button", className: "tk-button tk-button--danger", onClick: () => onRemove(idx) }, "Remove endpoint")
  )), /* @__PURE__ */ React3.createElement("button", { type: "button", className: "tk-button", onClick: onAdd }, "Add endpoint"));
}
function parsePorts(value) {
  const tokens = value.split(",").map((token) => token.trim()).filter(Boolean);
  if (tokens.length === 0) {
    return [{ port: 80, protocol: "tcp" }];
  }
  return tokens.map((token) => {
    const [portPart, protocolPart] = token.split("/");
    const port = Number.parseInt(portPart, 10);
    if (Number.isNaN(port)) {
      throw new Error(`Invalid port value: ${token}`);
    }
    const protocol = protocolPart ? protocolPart.toLowerCase() : "tcp";
    if (protocol !== "tcp" && protocol !== "udp") {
      throw new Error(`Unsupported protocol: ${protocol}`);
    }
    return { port, protocol };
  });
}

// ../toolkits/connectivity/frontend/pages/AdhocCheckPage.tsx
var React4 = getReactRuntime();
var { useState: useState4 } = React4;
var sectionStyle3 = {
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  padding: "1.25rem",
  background: "var(--color-surface-alt)"
};
var iconStyle3 = {
  fontSize: "1.1rem",
  lineHeight: 1,
  color: "var(--color-link)"
};
function AdhocCheckPage() {
  const [input, setInput] = useState4("web-1.example.com:80,443\n10.0.0.5:22\n8.8.8.8:53/udp");
  const [loading, setLoading] = useState4(false);
  const [error, setError] = useState4(null);
  const [summary, setSummary] = useState4(null);
  const [repetitions, setRepetitions] = useState4(1);
  const runCheck = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const endpoints = parseInput(input);
      const result = await apiFetch("/toolkits/connectivity/actions/adhoc-check", {
        method: "POST",
        body: JSON.stringify({ endpoints, repetitions })
      });
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React4.createElement("div", { style: { display: "grid", gap: "1.5rem", color: "var(--color-text-primary)" } }, /* @__PURE__ */ React4.createElement("section", { style: sectionStyle3 }, /* @__PURE__ */ React4.createElement("h4", { style: { marginTop: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React4.createElement("span", { className: "material-symbols-outlined", style: iconStyle3, "aria-hidden": true }, "insights"), "Ad-hoc connectivity check"), /* @__PURE__ */ React4.createElement("p", { style: { margin: "0.25rem 0 1rem", color: "var(--color-text-secondary)" } }, "Paste a host list to quickly validate reachability without saving a probe group."), /* @__PURE__ */ React4.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.3rem" } }, "Host list", /* @__PURE__ */ React4.createElement(
    "textarea",
    {
      className: "tk-input",
      rows: 6,
      value: input,
      onChange: (event) => setInput(event.target.value),
      placeholder: "host.example.com:80,443\\n10.0.0.5:22\\n8.8.8.8:53/udp"
    }
  )), /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" } }, /* @__PURE__ */ React4.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.3rem", width: 120 } }, "Attempts", /* @__PURE__ */ React4.createElement(
    "input",
    {
      className: "tk-input",
      type: "number",
      min: 1,
      max: 10,
      value: repetitions,
      onChange: (event) => setRepetitions(Math.max(1, Math.min(10, Number(event.target.value) || 1)))
    }
  )), /* @__PURE__ */ React4.createElement("button", { type: "button", className: "tk-button tk-button--primary", onClick: runCheck, disabled: loading }, /* @__PURE__ */ React4.createElement("span", { className: "material-symbols-outlined", style: iconStyle3, "aria-hidden": true }, "play_circle"), "Run check"), loading && /* @__PURE__ */ React4.createElement("span", { style: { color: "var(--color-text-secondary)" } }, "Probing\u2026")), error && /* @__PURE__ */ React4.createElement("p", { style: { color: "var(--color-danger-border)", marginTop: "0.75rem" } }, error)), summary && /* @__PURE__ */ React4.createElement(SummaryCard, { summary }));
}
function SummaryCard({ summary }) {
  return /* @__PURE__ */ React4.createElement("section", { style: sectionStyle3 }, /* @__PURE__ */ React4.createElement("h4", { style: { marginTop: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React4.createElement("span", { className: "material-symbols-outlined", style: iconStyle3, "aria-hidden": true }, "analytics"), "Results"), /* @__PURE__ */ React4.createElement("p", { style: { color: "var(--color-text-secondary)" } }, summary.failures === 0 ? `All ${summary.total_probes} probes succeeded across ${summary.repetitions} attempt${summary.repetitions === 1 ? "" : "s"}.` : `${summary.failures} failures detected across ${summary.total_probes} probes in ${summary.repetitions} attempt${summary.repetitions === 1 ? "" : "s"}.`), /* @__PURE__ */ React4.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React4.createElement("thead", null, /* @__PURE__ */ React4.createElement("tr", { style: { textAlign: "left", background: "var(--color-surface)" } }, summary.repetitions > 1 && /* @__PURE__ */ React4.createElement("th", { style: { padding: "0.4rem" } }, "Attempt"), /* @__PURE__ */ React4.createElement("th", { style: { padding: "0.4rem" } }, "Endpoint"), /* @__PURE__ */ React4.createElement("th", null, "Status"), /* @__PURE__ */ React4.createElement("th", null, "Latency"), /* @__PURE__ */ React4.createElement("th", null, "Message"))), /* @__PURE__ */ React4.createElement("tbody", null, summary.results.map((result, idx) => /* @__PURE__ */ React4.createElement("tr", { key: `${result.host}-${result.port}-${idx}`, style: { borderTop: "1px solid var(--color-border)" } }, summary.repetitions > 1 && /* @__PURE__ */ React4.createElement("td", null, result.attempt), /* @__PURE__ */ React4.createElement("td", { style: { padding: "0.4rem" } }, result.host, ":", result.port, "/", result.protocol), /* @__PURE__ */ React4.createElement("td", { style: { color: result.status === "reachable" ? "var(--color-accent)" : "var(--color-danger-border)" } }, result.status), /* @__PURE__ */ React4.createElement("td", null, result.latency_ms, " ms"), /* @__PURE__ */ React4.createElement("td", null, result.message ?? "\u2014"))))));
}
function parseInput(value) {
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error("Provide at least one host entry (format: host:port,port2,port3/udp)");
  }
  return lines.map((line) => {
    const [hostPart, portsPart] = line.split(":");
    if (!portsPart) {
      throw new Error(`Missing ports for host: ${line}`);
    }
    return {
      host: hostPart.trim(),
      ports: parsePorts2(portsPart)
    };
  });
}
function parsePorts2(token) {
  const entries = token.split(",").map((entry) => entry.trim()).filter(Boolean);
  if (entries.length === 0) {
    return [{ port: 80, protocol: "tcp" }];
  }
  return entries.map((entry) => {
    const [portPart, protocolPart] = entry.split("/");
    const port = Number.parseInt(portPart, 10);
    if (Number.isNaN(port)) {
      throw new Error(`Invalid port value: ${entry}`);
    }
    const protocol = protocolPart ? protocolPart.toLowerCase() : "tcp";
    if (protocol !== "tcp" && protocol !== "udp") {
      throw new Error(`Unsupported protocol: ${protocol}`);
    }
    return { port, protocol };
  });
}

// ../toolkits/connectivity/frontend/index.tsx
var React5 = getReactRuntime();
var ReactRouterDom = getReactRouterRuntime();
var { NavLink, Navigate, Route, Routes } = ReactRouterDom;
var layoutStyles = {
  wrapper: {
    padding: "1.5rem",
    display: "grid",
    gap: "1.5rem",
    color: "var(--color-text-primary)"
  },
  nav: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap"
  },
  navLink: (active) => ({
    padding: "0.5rem 0.9rem",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: active ? "var(--color-accent)" : "transparent",
    color: active ? "var(--color-sidebar-item-active-text)" : "var(--color-link)",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem"
  })
};
var iconStyle4 = {
  fontSize: "1.15rem",
  lineHeight: 1,
  color: "var(--color-link)"
};
var navItems = [
  { label: "Overview", to: "", icon: "dashboard", exact: true },
  { label: "Targets", to: "targets", icon: "hub", exact: false },
  { label: "Ad-hoc Check", to: "adhoc", icon: "quick_reference", exact: false }
];
function ConnectivityToolkitLayout() {
  return /* @__PURE__ */ React5.createElement("div", { className: "tk-card", style: layoutStyles.wrapper }, /* @__PURE__ */ React5.createElement("header", null, /* @__PURE__ */ React5.createElement("h3", { style: { margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React5.createElement("span", { className: "material-symbols-outlined", style: iconStyle4, "aria-hidden": true }, "cell_tower"), "Bulk Connectivity Checker"), /* @__PURE__ */ React5.createElement("p", { style: { margin: "0.3rem 0 0", color: "var(--color-text-secondary)" } }, "Probe large host lists, monitor reachability, and dispatch remediation jobs.")), /* @__PURE__ */ React5.createElement("nav", { style: layoutStyles.nav }, navItems.map((item) => /* @__PURE__ */ React5.createElement(
    NavLink,
    {
      key: item.label,
      to: item.to,
      end: item.exact,
      style: ({ isActive }) => layoutStyles.navLink(isActive)
    },
    /* @__PURE__ */ React5.createElement("span", { className: "material-symbols-outlined", style: iconStyle4, "aria-hidden": true }, item.icon),
    item.label
  ))), /* @__PURE__ */ React5.createElement("section", null, /* @__PURE__ */ React5.createElement(Routes, null, /* @__PURE__ */ React5.createElement(Route, { index: true, element: /* @__PURE__ */ React5.createElement(ConnectivityOverviewPage, null) }), /* @__PURE__ */ React5.createElement(Route, { path: "targets", element: /* @__PURE__ */ React5.createElement(TargetsPage, null) }), /* @__PURE__ */ React5.createElement(Route, { path: "adhoc", element: /* @__PURE__ */ React5.createElement(AdhocCheckPage, null) }), /* @__PURE__ */ React5.createElement(Route, { path: "*", element: /* @__PURE__ */ React5.createElement(Navigate, { to: ".", replace: true }) }))));
}
export {
  ConnectivityToolkitLayout as default
};
