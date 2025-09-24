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
const formStyles = {
  display: "grid",
  gap: "0.75rem",
  alignItems: "flex-start",
  gridTemplateColumns: "minmax(0, 1fr)",
  marginBottom: "1.5rem",
};
const formLabelStyles = {
  display: "grid",
  gap: "0.35rem",
  color: "var(--color-text-primary)",
};
const inputStyles = {
  padding: "0.65rem 0.75rem",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  font: "inherit",
};
const buttonStyles = {
  justifySelf: "start",
  padding: "0.65rem 1rem",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-accent)",
  color: "var(--color-sidebar-item-active-text)",
  fontWeight: 600,
  cursor: "pointer",
};
const summaryStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "0.75rem",
  marginBottom: "1.5rem",
};
const summaryItemStyles = {
  padding: "0.75rem",
  borderRadius: 10,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-alt)",
  display: "grid",
  gap: "0.25rem",
};
const summaryTermStyles = {
  margin: 0,
  fontSize: "0.85rem",
  color: "var(--color-text-secondary)",
};
const summaryValueStyles = {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: 600,
};
const tableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "1rem",
};
const tableHeaderStyles = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
  fontSize: "0.85rem",
  color: "var(--color-text-secondary)",
};
const tableCellStyles = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
  fontVariantNumeric: "tabular-nums",
};
const errorStyles = {
  color: "var(--color-danger)",
  fontWeight: 600,
  marginBottom: "1rem",
};
const headerStyles = {
  display: "grid",
  gap: "0.5rem",
  marginBottom: "1.5rem",
};
const sectionStyles = {
  display: "grid",
  color: "var(--color-text-primary)",
  gap: "1.5rem",
  padding: "1.5rem",
};
const tableWrapperStyles = {
  overflowX: "auto",
};
const SubnetCheatSheetPanel = () => {
  const [cidrInput, setCidrInput] = useState(DEFAULT_CIDR);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prefixRows = useMemo(() => DEFAULT_PREFIX_ROWS, []);
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
  return React.createElement(
    "section",
    { className: "subnet-cheat-sheet", style: sectionStyles },
    React.createElement(
      "header",
      { style: headerStyles },
      React.createElement("h1", null, "Subnet calculator"),
      React.createElement(
        "p",
        null,
        "Look up IPv4 ranges and compare prefix capacities without leaving the Toolbox.",
      ),
    ),
    React.createElement(
      "form",
      { onSubmit: handleSubmit, className: "subnet-cheat-sheet__form", style: formStyles },
      React.createElement(
        "label",
        { htmlFor: "subnet-cidr", style: formLabelStyles },
        "CIDR network",
        React.createElement("input", {
          id: "subnet-cidr",
          type: "text",
          value: cidrInput,
          onChange: (event) => setCidrInput(event.target.value),
          placeholder: "10.10.42.0/24",
          style: inputStyles,
        }),
      ),
      React.createElement(
        "button",
        { type: "submit", disabled: loading, style: buttonStyles },
        loading ? "Calculating…" : "Calculate",
      ),
    ),
    error
      ? React.createElement(
          "p",
          { role: "alert", className: "subnet-cheat-sheet__error", style: errorStyles },
          error,
        )
      : null,
    summary
      ? React.createElement(
          "dl",
          { className: "subnet-cheat-sheet__summary", style: summaryStyles },
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Network"),
            React.createElement("dd", { style: summaryValueStyles }, summary.network_address),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Broadcast"),
            React.createElement("dd", { style: summaryValueStyles }, summary.broadcast_address),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "First usable"),
            React.createElement("dd", { style: summaryValueStyles }, summary.first_usable),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Last usable"),
            React.createElement("dd", { style: summaryValueStyles }, summary.last_usable),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Wildcard"),
            React.createElement("dd", { style: summaryValueStyles }, summary.wildcard_mask),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Netmask"),
            React.createElement("dd", { style: summaryValueStyles }, summary.netmask),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Usable hosts"),
            React.createElement("dd", { style: summaryValueStyles }, formatNumber(summary.usable_hosts)),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Total addresses"),
            React.createElement("dd", { style: summaryValueStyles }, formatNumber(summary.total_addresses)),
          ),
          React.createElement(
            "div",
            { style: summaryItemStyles },
            React.createElement("dt", { style: summaryTermStyles }, "Binary mask"),
            React.createElement("dd", { style: summaryValueStyles }, React.createElement("code", null, summary.binary_mask)),
          ),
        )
      : null,
    React.createElement(
      "section",
      { className: "subnet-cheat-sheet__prefix-table", style: tableWrapperStyles },
      React.createElement(
        "h2",
        null,
        "Prefix cheat sheet",
      ),
      React.createElement(
        "table",
        { style: tableStyles },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", { scope: "col", style: tableHeaderStyles }, "CIDR"),
            React.createElement("th", { scope: "col", style: tableHeaderStyles }, "Netmask"),
            React.createElement("th", { scope: "col", style: tableHeaderStyles }, "Wildcard"),
            React.createElement("th", { scope: "col", style: tableHeaderStyles }, "Usable hosts"),
            React.createElement("th", { scope: "col", style: tableHeaderStyles }, "Total addresses"),
            React.createElement("th", { scope: "col", style: tableHeaderStyles }, "Binary mask"),
          ),
        ),
        React.createElement(
          "tbody",
          null,
          prefixRows.map((row) =>
            React.createElement(
              "tr",
              { key: row.prefix },
              React.createElement("th", { scope: "row", style: tableCellStyles }, row.cidr),
              React.createElement("td", { style: tableCellStyles }, row.netmask),
              React.createElement("td", { style: tableCellStyles }, row.wildcardMask),
              React.createElement("td", { style: tableCellStyles }, formatNumber(row.usableHosts)),
              React.createElement("td", { style: tableCellStyles }, formatNumber(row.totalAddresses)),
              React.createElement(
                "td",
                { style: tableCellStyles },
                React.createElement("code", null, row.binaryMask),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
export { SubnetCheatSheetPanel };
export default SubnetCheatSheetPanel;
