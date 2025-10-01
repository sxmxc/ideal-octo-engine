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
const navLinkClassName = ({ isActive }) =>
  isActive
    ? "subnet-cheat-sheet__nav-link subnet-cheat-sheet__nav-link--active"
    : "subnet-cheat-sheet__nav-link";
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
  return React.createElement(
    "div",
    { className: "subnet-cheat-sheet__calculator" },
    React.createElement(
      "form",
      { onSubmit: handleSubmit, className: "subnet-cheat-sheet__form" },
      React.createElement(
        "label",
        { htmlFor: "subnet-cidr" },
        "CIDR network",
        React.createElement("input", {
          id: "subnet-cidr",
          type: "text",
          value: cidrInput,
          onChange: (event) => setCidrInput(event.target.value),
          placeholder: "10.10.42.0/24",
        }),
      ),
      React.createElement(
        "button",
        { type: "submit", disabled: loading },
        loading ? "Calculating…" : "Calculate",
      ),
    ),
    error
      ? React.createElement(
          "p",
          { role: "alert", className: "subnet-cheat-sheet__error" },
          error,
        )
      : null,
    summary
      ? React.createElement(
          "dl",
          { className: "subnet-cheat-sheet__summary" },
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Network"),
            React.createElement("dd", null, summary.network_address),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Broadcast"),
            React.createElement("dd", null, summary.broadcast_address),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "First usable"),
            React.createElement("dd", null, summary.first_usable),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Last usable"),
            React.createElement("dd", null, summary.last_usable),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Netmask"),
            React.createElement("dd", null, summary.netmask),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Wildcard mask"),
            React.createElement("dd", null, summary.wildcard_mask),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Usable hosts"),
            React.createElement("dd", null, formatNumber(summary.usable_hosts)),
          ),
          React.createElement(
            "div",
            null,
            React.createElement("dt", null, "Total addresses"),
            React.createElement("dd", null, formatNumber(summary.total_addresses)),
          ),
        )
      : null,
  );
};
const PrefixCheatSheetPage = () => {
  const prefixRows = useMemo(() => DEFAULT_PREFIX_ROWS, []);
  return React.createElement(
    "section",
    { className: "subnet-cheat-sheet__table" },
    React.createElement("h2", null, "Prefix cheat sheet"),
    React.createElement(
      "p",
      null,
      "Use this table to compare prefix capacities, netmasks, and wildcard masks when planning address allocations.",
    ),
    React.createElement(
      "table",
      null,
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", { scope: "col" }, "CIDR"),
          React.createElement("th", { scope: "col" }, "Netmask"),
          React.createElement("th", { scope: "col" }, "Wildcard"),
          React.createElement("th", { scope: "col" }, "Usable hosts"),
          React.createElement("th", { scope: "col" }, "Total addresses"),
          React.createElement("th", { scope: "col" }, "Binary mask"),
        ),
      ),
      React.createElement(
        "tbody",
        null,
        prefixRows.map((row) =>
          React.createElement(
            "tr",
            { key: row.prefix },
            React.createElement("th", { scope: "row" }, row.cidr),
            React.createElement("td", null, row.netmask),
            React.createElement("td", null, row.wildcardMask),
            React.createElement("td", null, formatNumber(row.usableHosts)),
            React.createElement("td", null, formatNumber(row.totalAddresses)),
            React.createElement("td", null, React.createElement("code", null, row.binaryMask)),
          ),
        ),
      ),
    ),
  );
};
const SubnetCheatSheetPanel = () => {
  return React.createElement(
    "section",
    { className: "subnet-cheat-sheet" },
    React.createElement(
      "header",
      null,
      React.createElement("h1", null, "Subnet toolkit"),
      React.createElement(
        "p",
        null,
        "Switch between the IPv4 calculator and the prefix reference without leaving the Toolbox.",
      ),
    ),
    React.createElement(
      "nav",
      { className: "subnet-cheat-sheet__nav", "aria-label": "Subnet toolkit sections" },
      React.createElement(NavLink, { end: true, to: "", className: navLinkClassName }, "Calculator"),
      React.createElement(NavLink, { to: "cheat-sheet", className: navLinkClassName }, "Prefix cheat sheet"),
    ),
    React.createElement(
      "div",
      { className: "subnet-cheat-sheet__content" },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { index: true, element: React.createElement(CalculatorPage, null) }),
        React.createElement(Route, { path: "cheat-sheet", element: React.createElement(PrefixCheatSheetPage, null) }),
        React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: ".", replace: true }) }),
      ),
    ),
  );
};
export { SubnetCheatSheetPanel };
export default SubnetCheatSheetPanel;
