function getToolkitRuntime() {
  if (typeof window === "undefined" || !window.__SRE_TOOLKIT_RUNTIME) {
    throw new Error("SRE Toolkit runtime not injected yet");
  }
  return window.__SRE_TOOLKIT_RUNTIME;
}
function getReactRuntime() {
  return getToolkitRuntime().react;
}
function apiFetch(path, options) {
  return getToolkitRuntime().apiFetch(path, options);
}
const React = getReactRuntime();
const { useCallback, useEffect, useMemo, useState } = React;
const badgePalette = {
  ok: "var(--color-status-success)",
  watch: "var(--color-status-information)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-danger)",
};
const statusOrder = ["critical", "warning", "watch", "ok"];
const containerStyle = {
  padding: "1.5rem",
  display: "grid",
  gap: "1.5rem",
  color: "var(--color-text-primary)",
};
const cardStyle = {
  padding: "1.25rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--color-border-muted)",
  background: "var(--color-surface-raised)",
  display: "grid",
  gap: "0.75rem",
};
const listStyle = {
  display: "grid",
  gap: "1rem",
};
const historyListStyle = {
  margin: 0,
  paddingLeft: "1.1rem",
  display: "grid",
  gap: "0.25rem",
};
const formCardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--color-border-muted)",
  background: "var(--color-surface-raised)",
  padding: "1rem",
  display: "grid",
  gap: "0.75rem",
};
const fieldsetStyle = {
  display: "grid",
  gap: "0.25rem",
  minWidth: "12rem",
};
const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
};
const inputStyle = {
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border-muted)",
  padding: "0.45rem 0.65rem",
  fontSize: "0.95rem",
  background: "var(--color-surface-primary)",
  color: "var(--color-text-primary)",
};
const helperTextStyle = {
  fontSize: "0.85rem",
  color: "var(--color-status-danger)",
};
const mutedHelperTextStyle = {
  fontSize: "0.85rem",
  color: "var(--color-text-secondary)",
};
const distributionCardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid var(--color-border-muted)",
  padding: "1rem",
  background: "var(--color-surface-raised)",
  display: "grid",
  gap: "0.5rem",
};
const distributionBarStyle = {
  display: "flex",
  width: "100%",
  height: "0.75rem",
  borderRadius: "999px",
  overflow: "hidden",
  background: "var(--color-surface-muted)",
};
const distributionDotStyle = {
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "999px",
};
const buttonRowStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  alignItems: "center",
};
const ghostButtonStyle = {
  borderRadius: "999px",
  border: "1px solid var(--color-border-muted)",
  background: "transparent",
  padding: "0.4rem 0.85rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  cursor: "pointer",
};
function StatusBadge(props) {
  const background = badgePalette[props.status] || "var(--color-status-information)";
  return React.createElement(
    "span",
    {
      style: {
        alignSelf: "flex-start",
        padding: "0.25rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--color-surface-primary)",
        background,
      },
    },
    props.label,
  );
}
function formatDistance(daysRemaining) {
  if (daysRemaining === 0) {
    return "expires today";
  }
  if (daysRemaining === 1) {
    return "1 day remaining";
  }
  return `${daysRemaining} days remaining`;
}
async function loadHosts() {
  return apiFetch("/toolkits/tls-watchtower/hosts");
}
function createHost(payload) {
  return apiFetch("/toolkits/tls-watchtower/hosts", {
    method: "POST",
    json: payload,
  });
}
function updateHost(originalHost, payload) {
  return apiFetch(`/toolkits/tls-watchtower/hosts/${encodeURIComponent(originalHost)}`, {
    method: "PUT",
    json: payload,
  });
}
const TlsWatchtowerPanel = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formHost, setFormHost] = useState("");
  const [formPort, setFormPort] = useState("443");
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingHost, setEditingHost] = useState(null);
  const [editHostValue, setEditHostValue] = useState("");
  const [editPortValue, setEditPortValue] = useState("443");
  const [editError, setEditError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const fetchHosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadHosts();
      setHosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load hosts");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);
  const criticalCount = useMemo(() => hosts.filter((item) => item.status === "critical").length, [hosts]);
  const warningCount = useMemo(() => hosts.filter((item) => item.status === "warning").length, [hosts]);
  const statusBreakdown = useMemo(() => {
    return hosts.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { ok: 0, watch: 0, warning: 0, critical: 0 },
    );
  }, [hosts]);
  const totalHosts = hosts.length;
  const handleAddHost = useCallback(
    async (event) => {
      event.preventDefault();
      const host = formHost.trim();
      const port = Number(formPort);
      if (!host) {
        setFormError("Hostname is required");
        return;
      }
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        setFormError("Port must be between 1 and 65535");
        return;
      }
      setFormSubmitting(true);
      setFormError(null);
      try {
        await createHost({ host, port });
        setFormHost("");
        setFormPort("443");
        await fetchHosts();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Unable to add endpoint");
      } finally {
        setFormSubmitting(false);
      }
    },
    [fetchHosts, formHost, formPort],
  );
  const handleEditStart = useCallback((snapshot) => {
    setEditingHost(snapshot.host);
    setEditHostValue(snapshot.host);
    setEditPortValue(String(snapshot.port));
    setEditError(null);
  }, []);
  const handleEditCancel = useCallback(() => {
    setEditingHost(null);
    setEditHostValue("");
    setEditPortValue("443");
    setEditError(null);
  }, []);
  const handleEditSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!editingHost) {
        return;
      }
      const host = editHostValue.trim();
      const port = Number(editPortValue);
      if (!host) {
        setEditError("Hostname is required");
        return;
      }
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        setEditError("Port must be between 1 and 65535");
        return;
      }
      setEditSubmitting(true);
      setEditError(null);
      try {
        await updateHost(editingHost, { host, port });
        setEditingHost(null);
        setEditHostValue("");
        setEditPortValue("443");
        await fetchHosts();
      } catch (err) {
        setEditError(err instanceof Error ? err.message : "Unable to save changes");
      } finally {
        setEditSubmitting(false);
      }
    },
    [editHostValue, editPortValue, editingHost, fetchHosts],
  );
  const distributionContent = totalHosts
    ? [
        React.createElement(
          "div",
          { style: distributionBarStyle },
          statusOrder.map((status) => {
            const count = statusBreakdown[status] || 0;
            if (!count) {
              return null;
            }
            return React.createElement("span", {
              key: status,
              style: {
                background: badgePalette[status],
                flexGrow: count,
                flexBasis: 0,
              },
            });
          }),
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
            },
          },
          statusOrder.map((status) =>
            React.createElement(
              "span",
              {
                key: status,
                style: { display: "flex", alignItems: "center", gap: "0.4rem" },
              },
              React.createElement("span", {
                style: Object.assign({}, distributionDotStyle, { background: badgePalette[status] }),
              }),
              `${statusBreakdown[status] || 0} ${(statusBreakdown[status] || 0) === 1 ? "endpoint" : "endpoints"}`,
            ),
          ),
        ),
      ]
    : [React.createElement("div", { style: mutedHelperTextStyle }, "Add an endpoint to populate distribution metrics.")];
  const hostCards = hosts.map((host) => {
    const isEditing = editingHost === host.host;
    const historyItems = Array.isArray(host.history) ? host.history.slice(0, 4) : [];
    return React.createElement(
      "article",
      { key: host.host, style: cardStyle },
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" } },
        React.createElement(
          "div",
          null,
          React.createElement("h2", { style: { margin: 0 } }, host.host),
          React.createElement(
            "p",
            { style: { margin: "0.25rem 0 0", color: "var(--color-text-secondary)" } },
            `${formatDistance(host.days_remaining)} · last scanned ${new Date(host.last_scanned_at).toLocaleString()}`,
          ),
        ),
        React.createElement(StatusBadge, {
          status: host.status,
          label: host.status_label,
        }),
      ),
      React.createElement("p", { style: { margin: 0 } }, host.renewal_message),
      isEditing
        ? React.createElement(
            "form",
            { onSubmit: handleEditSubmit, style: { display: "grid", gap: "0.75rem" } },
            React.createElement(
              "div",
              { style: { display: "flex", gap: "1rem", flexWrap: "wrap" } },
              React.createElement(
                "label",
                { style: fieldsetStyle },
                React.createElement("span", { style: labelStyle }, "Hostname"),
                React.createElement("input", {
                  style: inputStyle,
                  type: "text",
                  value: editHostValue,
                  onChange: (event) => setEditHostValue(event.target.value),
                  disabled: editSubmitting,
                  required: true,
                }),
              ),
              React.createElement(
                "label",
                { style: fieldsetStyle },
                React.createElement("span", { style: labelStyle }, "Port"),
                React.createElement("input", {
                  style: inputStyle,
                  type: "number",
                  min: 1,
                  max: 65535,
                  value: editPortValue,
                  onChange: (event) => setEditPortValue(event.target.value),
                  disabled: editSubmitting,
                  required: true,
                }),
              ),
            ),
            React.createElement(
              "div",
              { style: buttonRowStyle },
              React.createElement(
                "button",
                { type: "submit", className: "sre-button", disabled: editSubmitting },
                editSubmitting ? "Saving" : "Save changes",
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: handleEditCancel,
                  style: Object.assign({}, ghostButtonStyle, { opacity: editSubmitting ? 0.6 : 1 }),
                  disabled: editSubmitting,
                },
                "Cancel",
              ),
              editError
                ? React.createElement("span", { style: helperTextStyle }, editError)
                : React.createElement(
                    "span",
                    { style: mutedHelperTextStyle },
                    "Changes trigger a fresh scan for this endpoint.",
                  ),
            ),
          )
        : React.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
              },
            },
            React.createElement(
              "span",
              { style: mutedHelperTextStyle },
              `Port ${host.port}`,
            ),
            React.createElement(
              "button",
              { type: "button", onClick: () => handleEditStart(host), style: ghostButtonStyle },
              "Edit endpoint",
            ),
          ),
      historyItems.length
        ? React.createElement(
            "div",
            null,
            React.createElement(
              "h3",
              { style: { margin: "0 0 0.25rem", fontSize: "0.95rem" } },
              "Recent scans",
            ),
            React.createElement(
              "ul",
              { style: historyListStyle },
              historyItems.map((entry) => {
                const scanned = new Date(entry.scanned_at).toLocaleDateString();
                const expires = new Date(entry.expires_at).toLocaleDateString();
                return React.createElement(
                  "li",
                  { key: entry.scanned_at },
                  `${scanned} → expires ${expires} · ${entry.status}`,
                );
              }),
            ),
          )
        : null,
    );
  });
  return React.createElement(
    "section",
    { style: containerStyle },
    React.createElement(
      "header",
      { style: { display: "grid", gap: "0.25rem" } },
      React.createElement("h1", { style: { margin: 0 } }, "TLS Watchtower"),
      React.createElement(
        "p",
        { style: { margin: 0, color: "var(--color-text-secondary)" } },
        "Track certificate expirations across self-contained lab hosts with deterministic sample data.",
      ),
    ),
    React.createElement(
      "div",
      { style: { display: "grid", gap: "1rem" } },
      React.createElement(
        "div",
        { style: { display: "flex", gap: "1rem", flexWrap: "wrap" } },
        React.createElement(
          "div",
          { style: { minWidth: "12rem" } },
          React.createElement("strong", { style: { fontSize: "2rem" } }, criticalCount),
          React.createElement(
            "div",
            { style: { color: "var(--color-text-secondary)" } },
            "critical expirations",
          ),
        ),
        React.createElement(
          "div",
          { style: { minWidth: "12rem" } },
          React.createElement("strong", { style: { fontSize: "2rem" } }, warningCount),
          React.createElement(
            "div",
            { style: { color: "var(--color-text-secondary)" } },
            "warning expirations",
          ),
        ),
      ),
      React.createElement(
        "div",
        { style: distributionCardStyle },
        React.createElement(
          "div",
          {
            style: {
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
            },
          },
          "Inventory distribution",
        ),
        ...distributionContent,
      ),
    ),
    React.createElement(
      "form",
      { style: formCardStyle, onSubmit: handleAddHost },
      React.createElement(
        "div",
        { style: { display: "flex", gap: "1rem", flexWrap: "wrap" } },
        React.createElement(
          "label",
          { style: fieldsetStyle },
          React.createElement("span", { style: labelStyle }, "Hostname"),
          React.createElement("input", {
            style: inputStyle,
            type: "text",
            name: "host",
            autoComplete: "off",
            placeholder: "example.internal",
            value: formHost,
            onChange: (event) => setFormHost(event.target.value),
            disabled: formSubmitting,
            required: true,
          }),
        ),
        React.createElement(
          "label",
          { style: fieldsetStyle },
          React.createElement("span", { style: labelStyle }, "Port"),
          React.createElement("input", {
            style: inputStyle,
            type: "number",
            name: "port",
            min: 1,
            max: 65535,
            value: formPort,
            onChange: (event) => setFormPort(event.target.value),
            disabled: formSubmitting,
            required: true,
          }),
        ),
      ),
      React.createElement(
        "div",
        { style: buttonRowStyle },
        React.createElement(
          "button",
          { type: "submit", className: "sre-button", disabled: formSubmitting },
          formSubmitting ? "Adding" : "Add endpoint",
        ),
        formError
          ? React.createElement("span", { style: helperTextStyle }, formError)
          : React.createElement(
              "span",
              { style: mutedHelperTextStyle },
              "New endpoints are scanned immediately after creation.",
            ),
      ),
    ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: "0.75rem", alignItems: "center" } },
      React.createElement(
        "button",
        { type: "button", className: "sre-button", onClick: () => fetchHosts(), disabled: loading },
        loading ? "Refreshing" : "Refresh",
      ),
      error ? React.createElement("span", { style: { color: "var(--color-status-danger)" } }, error) : null,
    ),
    React.createElement(
      "div",
      { style: listStyle },
      loading
        ? React.createElement("div", null, "Loading certificate data…")
        : hosts.length === 0
          ? React.createElement("div", null, "No hosts registered.")
          : hostCards,
    ),
  );
};
export { TlsWatchtowerPanel };
export default TlsWatchtowerPanel;
