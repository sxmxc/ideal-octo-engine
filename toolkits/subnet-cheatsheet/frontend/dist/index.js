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

function getReactRouterRuntime() {
  return getToolkitRuntime().reactRouterDom;
}

const React = getReactRuntime();
const Router = getReactRouterRuntime();
const { useCallback, useEffect, useMemo, useState } = React;
const { NavLink, Navigate, Route, Routes } = Router;

const containerStyle = {
  padding: "1.5rem",
  display: "grid",
  gap: "1.5rem",
  color: "var(--color-text-primary)",
};

const headerTitleStyle = {
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const headerSubtitleStyle = {
  margin: "0.35rem 0 0",
  color: "var(--color-text-secondary)",
};

const navStyle = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const navLinkStyle = (active) => ({
  padding: "0.5rem 0.85rem",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  textDecoration: "none",
  background: active ? "var(--color-accent)" : "transparent",
  color: active ? "var(--color-sidebar-item-active-text)" : "var(--color-link)",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
});

const contentStyle = {
  display: "grid",
  gap: "1.5rem",
};

const sectionStyle = {
  display: "grid",
  gap: "1rem",
};

const formStyle = {
  display: "grid",
  gap: "1rem",
  alignItems: "end",
  gridTemplateColumns: "minmax(0, 1fr) auto",
};

const labelStyle = {
  display: "grid",
  gap: "0.35rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
};

const inputStyle = {
  background: "var(--color-surface-muted)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-text-primary)",
  padding: "0.65rem 0.75rem",
  font: "inherit",
};

const statusRowStyle = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "center",
  flexWrap: "wrap",
};

const errorStyle = {
  color: "var(--color-status-error)",
  margin: 0,
};

const summaryStyle = {
  display: "grid",
  gap: "0.75rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  margin: 0,
};

const summaryCardStyle = {
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
  borderRadius: 10,
  display: "grid",
  gap: "0.35rem",
};

const summaryTermStyle = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const summaryValueStyle = {
  margin: 0,
  fontWeight: 600,
};

const tableSectionStyle = {
  display: "grid",
  gap: "0.75rem",
};

const tableIntroStyle = {
  margin: "0.25rem 0 0",
  color: "var(--color-text-secondary)",
};

const tableWrapperStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 480,
};

const tableHeaderCellStyle = {
  textAlign: "left",
  padding: "0.65rem",
  fontSize: "0.85rem",
  color: "var(--color-text-secondary)",
  borderBottom: "1px solid var(--color-border)",
};

const tableCellStyle = {
  padding: "0.65rem",
  borderBottom: "1px solid var(--color-border)",
};

const codeStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
};

const buildPrefixRow = (prefix) => {
  const octetBits = [];
  const octetValues = [];
  for (let octetIndex = 0; octetIndex < 4; octetIndex += 1) {
    const ones = Math.min(8, Math.max(0, prefix - octetIndex * 8));
    const bitString = `${"1".repeat(ones)}${"0".repeat(8 - ones)}`;
    octetBits.push(bitString);
    octetValues.push(parseInt(bitString || "0", 2));
  }
  const netmask = octetValues.join(".");
  const wildcardMask = octetValues.map((value) => 255 - value).join(".");
  const binaryMask = octetBits.join(".");
  const hostBits = Math.max(0, 32 - prefix);
  const totalAddresses = prefix === 0 ? 2 ** 32 : 2 ** hostBits;
  const usableHosts = prefix >= 31 ? totalAddresses : Math.max(totalAddresses - 2, 0);
  return {
    prefix,
    cidr: `/${prefix}`,
    netmask,
    wildcardMask,
    binaryMask,
    totalAddresses,
    usableHosts,
  };
};

const DEFAULT_PREFIX_ROWS = Array.from({ length: 23 }, (_, index) => buildPrefixRow(index + 8));
const formatNumber = (value) => value.toLocaleString();
const DEFAULT_CIDR = "192.168.1.0/24";

const CalculatorPage = () => {
  const [cidrInput, setCidrInput] = useState(DEFAULT_CIDR);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (cidr) => {
    if (!cidr) {
      setError("Provide a CIDR such as 10.0.0.0/24.");
      setSummary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await apiFetch(`/toolkits/subnet-cheatsheet/summary?cidr=${encodeURIComponent(cidr)}`);
      setSummary(payload.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Subnet lookup failed";
      setError(message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary(DEFAULT_CIDR);
  }, [fetchSummary]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      void fetchSummary(cidrInput);
    },
    [cidrInput, fetchSummary],
  );

  const summaryItems = summary
    ? [
        { label: "Network", value: summary.network_address },
        { label: "Broadcast", value: summary.broadcast_address },
        { label: "First usable", value: summary.first_usable },
        { label: "Last usable", value: summary.last_usable },
        { label: "Netmask", value: summary.netmask },
        { label: "Wildcard mask", value: summary.wildcard_mask },
        { label: "Usable hosts", value: formatNumber(summary.usable_hosts) },
        { label: "Total addresses", value: formatNumber(summary.total_addresses) },
      ]
    : null;

  return React.createElement(
    "section",
    { className: "tk-card", style: sectionStyle },
    React.createElement(
      "header",
      null,
      React.createElement("h3", { style: { margin: 0 } }, "IPv4 calculator"),
      React.createElement(
        "p",
        { style: tableIntroStyle },
        "Compute broadcast, mask, and usable range details for any CIDR.",
      ),
    ),
    React.createElement(
      "form",
      { onSubmit: handleSubmit, style: formStyle },
      React.createElement(
        "label",
        { htmlFor: "subnet-cidr", style: labelStyle },
        "CIDR network",
        React.createElement("input", {
          id: "subnet-cidr",
          type: "text",
          value: cidrInput,
          onChange: (event) => setCidrInput(event.target.value),
          placeholder: "10.10.42.0/24",
          style: inputStyle,
        }),
      ),
      React.createElement(
        "button",
        { type: "submit", className: "tk-button tk-button--primary", disabled: loading },
        loading ? "Calculating…" : "Calculate",
      ),
    ),
    React.createElement(
      "div",
      { style: statusRowStyle },
      loading
        ? React.createElement("span", { style: { color: "var(--color-text-secondary)" } }, "Fetching subnet data…")
        : null,
      error
        ? React.createElement(
            "p",
            { role: "alert", style: errorStyle },
            error,
          )
        : null,
    ),
    summaryItems
      ? React.createElement(
          "dl",
          { style: summaryStyle },
          summaryItems.map((item) =>
            React.createElement(
              "div",
              { key: item.label, style: summaryCardStyle },
              React.createElement("dt", { style: summaryTermStyle }, item.label),
              React.createElement("dd", { style: summaryValueStyle }, item.value),
            ),
          ),
        )
      : null,
  );
};

const PrefixCheatSheetPage = () => {
  const prefixRows = useMemo(() => DEFAULT_PREFIX_ROWS, []);

  return React.createElement(
    "section",
    { className: "tk-card", style: tableSectionStyle },
    React.createElement(
      "header",
      null,
      React.createElement("h3", { style: { margin: 0 } }, "Prefix cheat sheet"),
      React.createElement(
        "p",
        { style: tableIntroStyle },
        "Use this table to compare prefix capacities, netmasks, and wildcard masks when planning address allocations.",
      ),
    ),
    React.createElement(
      "div",
      { style: tableWrapperStyle },
      React.createElement(
        "table",
        { style: tableStyle },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", { scope: "col", style: tableHeaderCellStyle }, "CIDR"),
            React.createElement("th", { scope: "col", style: tableHeaderCellStyle }, "Netmask"),
            React.createElement("th", { scope: "col", style: tableHeaderCellStyle }, "Wildcard"),
            React.createElement("th", { scope: "col", style: tableHeaderCellStyle }, "Usable hosts"),
            React.createElement("th", { scope: "col", style: tableHeaderCellStyle }, "Total addresses"),
            React.createElement("th", { scope: "col", style: tableHeaderCellStyle }, "Binary mask"),
          ),
        ),
        React.createElement(
          "tbody",
          null,
          prefixRows.map((row) =>
            React.createElement(
              "tr",
              { key: row.prefix },
              React.createElement(
                "th",
                { scope: "row", style: Object.assign({}, tableCellStyle, { fontWeight: 600 }) },
                row.cidr,
              ),
              React.createElement("td", { style: tableCellStyle }, row.netmask),
              React.createElement("td", { style: tableCellStyle }, row.wildcardMask),
              React.createElement("td", { style: tableCellStyle }, formatNumber(row.usableHosts)),
              React.createElement("td", { style: tableCellStyle }, formatNumber(row.totalAddresses)),
              React.createElement(
                "td",
                { style: tableCellStyle },
                React.createElement("code", { style: codeStyle }, row.binaryMask),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};

const SubnetCheatSheetPanel = () =>
  React.createElement(
    "section",
    { className: "tk-card", style: containerStyle },
    React.createElement(
      "header",
      null,
      React.createElement(
        "h2",
        { style: headerTitleStyle },
        React.createElement(
          "span",
          { className: "material-symbols-outlined", "aria-hidden": true },
          "dns",
        ),
        "Subnet toolkit",
      ),
      React.createElement(
        "p",
        { style: headerSubtitleStyle },
        "Switch between the IPv4 calculator and the prefix reference without leaving the Toolbox.",
      ),
    ),
    React.createElement(
      "nav",
      { style: navStyle, "aria-label": "Subnet toolkit sections" },
      React.createElement(
        NavLink,
        { end: true, to: "", style: ({ isActive }) => navLinkStyle(isActive) },
        React.createElement(
          "span",
          { className: "material-symbols-outlined", "aria-hidden": true },
          "calculate",
        ),
        "Calculator",
      ),
      React.createElement(
        NavLink,
        { to: "cheat-sheet", style: ({ isActive }) => navLinkStyle(isActive) },
        React.createElement(
          "span",
          { className: "material-symbols-outlined", "aria-hidden": true },
          "table",
        ),
        "Prefix cheat sheet",
      ),
    ),
    React.createElement(
      "div",
      { style: contentStyle },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { index: true, element: React.createElement(CalculatorPage, null) }),
        React.createElement(Route, { path: "cheat-sheet", element: React.createElement(PrefixCheatSheetPage, null) }),
        React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: ".", replace: true }) }),
      ),
    ),
  );

export { SubnetCheatSheetPanel as default };
