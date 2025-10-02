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
const TlsWatchtowerPanel = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const criticalCount = useMemo(
    () => hosts.filter((item) => item.status === "critical").length,
    [hosts],
  );
  const warningCount = useMemo(
    () => hosts.filter((item) => item.status === "warning").length,
    [hosts],
  );
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
      { style: { display: "flex", gap: "0.75rem", alignItems: "center" } },
      React.createElement(
        "button",
        {
          type: "button",
          className: "sre-button",
          onClick: () => fetchHosts(),
          disabled: loading,
        },
        loading ? "Refreshing" : "Refresh",
      ),
      error
        ? React.createElement(
            "span",
            { style: { color: "var(--color-status-danger)" } },
            error,
          )
        : null,
    ),
    React.createElement(
      "div",
      { style: listStyle },
      loading
        ? React.createElement("div", null, "Loading certificate data…")
        : hosts.length === 0
        ? React.createElement("div", null, "No hosts registered.")
        : hosts.map((host) => {
            const lastScanned = new Date(host.last_scanned_at).toLocaleString();
            const historyItems = Array.isArray(host.history) ? host.history.slice(0, 4) : [];
            return React.createElement(
              "article",
              { key: host.host, style: cardStyle },
              React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "1rem",
                  },
                },
                React.createElement(
                  "div",
                  null,
                  React.createElement("h2", { style: { margin: 0 } }, host.host),
                  React.createElement(
                    "p",
                    { style: { margin: "0.25rem 0 0", color: "var(--color-text-secondary)" } },
                    `${formatDistance(host.days_remaining)} · last scanned ${lastScanned}`,
                  ),
                ),
                React.createElement(StatusBadge, {
                  status: host.status,
                  label: host.status_label,
                }),
              ),
              React.createElement("p", { style: { margin: 0 } }, host.renewal_message),
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
          }),
    ),
  );
};
export { TlsWatchtowerPanel };
export default TlsWatchtowerPanel;
