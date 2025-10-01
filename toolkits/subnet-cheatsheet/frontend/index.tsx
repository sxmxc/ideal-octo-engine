import type { CSSProperties, FormEvent } from "react";

import { apiFetch, getReactRouterRuntime, getReactRuntime } from "./runtime";

const React = getReactRuntime();
const Router = getReactRouterRuntime();
const { useCallback, useEffect, useMemo, useState } = React;
const { NavLink, Navigate, Route, Routes } = Router;

const containerStyle: CSSProperties = {
  padding: "1.5rem",
  display: "grid",
  gap: "1.5rem",
  color: "var(--color-text-primary)",
};

const headerTitleStyle: CSSProperties = {
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const headerSubtitleStyle: CSSProperties = {
  margin: "0.35rem 0 0",
  color: "var(--color-text-secondary)",
};

const navStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const navLinkStyle = (active: boolean): CSSProperties => ({
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

const contentStyle: CSSProperties = {
  display: "grid",
  gap: "1.5rem",
};

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  alignItems: "end",
  gridTemplateColumns: "minmax(0, 1fr) auto",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
};

const inputStyle: CSSProperties = {
  background: "var(--color-surface-muted)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-text-primary)",
  padding: "0.65rem 0.75rem",
  font: "inherit",
};

const statusRowStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "center",
  flexWrap: "wrap",
};

const errorStyle: CSSProperties = {
  color: "var(--color-status-error)",
  margin: 0,
};

const summaryStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  margin: 0,
};

const summaryCardStyle: CSSProperties = {
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
  borderRadius: 10,
  display: "grid",
  gap: "0.35rem",
};

const summaryTermStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const summaryValueStyle: CSSProperties = {
  margin: 0,
  fontWeight: 600,
};

const tableSectionStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
};

const tableIntroStyle: CSSProperties = {
  margin: "0.25rem 0 0",
  color: "var(--color-text-secondary)",
};

const tableWrapperStyle: CSSProperties = {
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 480,
};

const tableHeaderCellStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.65rem",
  fontSize: "0.85rem",
  color: "var(--color-text-secondary)",
  borderBottom: "1px solid var(--color-border)",
};

const tableCellStyle: CSSProperties = {
  padding: "0.65rem",
  borderBottom: "1px solid var(--color-border)",
};

const codeStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
};

type SubnetSummary = {
  cidr: string;
  network_address: string;
  broadcast_address: string;
  netmask: string;
  wildcard_mask: string;
  total_addresses: number;
  usable_hosts: number;
  first_usable: string;
  last_usable: string;
  binary_mask: string;
};

type PrefixRow = {
  prefix: number;
  cidr: string;
  netmask: string;
  wildcardMask: string;
  binaryMask: string;
  totalAddresses: number;
  usableHosts: number;
};

const buildPrefixRow = (prefix: number): PrefixRow => {
  const octetBits: string[] = [];
  const octetValues: number[] = [];

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

const DEFAULT_PREFIX_ROWS: PrefixRow[] = Array.from({ length: 23 }, (_, index) =>
  buildPrefixRow(index + 8),
);

const formatNumber = (value: number) => value.toLocaleString();

const DEFAULT_CIDR = "192.168.1.0/24";

const CalculatorPage = () => {
  const [cidrInput, setCidrInput] = useState(DEFAULT_CIDR);
  const [summary, setSummary] = useState<SubnetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (cidr: string) => {
    if (!cidr) {
      setError("Provide a CIDR such as 10.0.0.0/24.");
      setSummary(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await apiFetch<{ summary: SubnetSummary }>(
        `/toolkits/subnet-cheatsheet/summary?cidr=${encodeURIComponent(cidr)}`,
      );
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
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void fetchSummary(cidrInput);
    },
    [cidrInput, fetchSummary],
  );

  const summaryItems = summary
    ? (
        [
          { label: "Network", value: summary.network_address },
          { label: "Broadcast", value: summary.broadcast_address },
          { label: "First usable", value: summary.first_usable },
          { label: "Last usable", value: summary.last_usable },
          { label: "Netmask", value: summary.netmask },
          { label: "Wildcard mask", value: summary.wildcard_mask },
          { label: "Usable hosts", value: formatNumber(summary.usable_hosts) },
          { label: "Total addresses", value: formatNumber(summary.total_addresses) },
        ] satisfies Array<{ label: string; value: string }>
      )
    : null;

  return (
    <section className="tk-card" style={sectionStyle}>
      <header>
        <h3 style={{ margin: 0 }}>IPv4 calculator</h3>
        <p style={tableIntroStyle}>Compute broadcast, mask, and usable range details for any CIDR.</p>
      </header>

      <form onSubmit={handleSubmit} style={formStyle}>
        <label htmlFor="subnet-cidr" style={labelStyle}>
          CIDR network
          <input
            id="subnet-cidr"
            type="text"
            value={cidrInput}
            onChange={(event) => setCidrInput(event.target.value)}
            placeholder="10.10.42.0/24"
            style={inputStyle}
          />
        </label>
        <button type="submit" className="tk-button tk-button--primary" disabled={loading}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>

      <div style={statusRowStyle}>
        {loading ? <span style={{ color: "var(--color-text-secondary)" }}>Fetching subnet data…</span> : null}
        {error ? (
          <p role="alert" style={errorStyle}>
            {error}
          </p>
        ) : null}
      </div>

      {summaryItems ? (
        <dl style={summaryStyle}>
          {summaryItems.map((item) => (
            <div key={item.label} style={summaryCardStyle}>
              <dt style={summaryTermStyle}>{item.label}</dt>
              <dd style={summaryValueStyle}>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
};

const PrefixCheatSheetPage = () => {
  const prefixRows = useMemo(() => DEFAULT_PREFIX_ROWS, []);

  return (
    <section className="tk-card" style={tableSectionStyle}>
      <header>
        <h3 style={{ margin: 0 }}>Prefix cheat sheet</h3>
        <p style={tableIntroStyle}>
          Use this table to compare prefix capacities, netmasks, and wildcard masks when planning address allocations.
        </p>
      </header>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th scope="col" style={tableHeaderCellStyle}>
                CIDR
              </th>
              <th scope="col" style={tableHeaderCellStyle}>
                Netmask
              </th>
              <th scope="col" style={tableHeaderCellStyle}>
                Wildcard
              </th>
              <th scope="col" style={tableHeaderCellStyle}>
                Usable hosts
              </th>
              <th scope="col" style={tableHeaderCellStyle}>
                Total addresses
              </th>
              <th scope="col" style={tableHeaderCellStyle}>
                Binary mask
              </th>
            </tr>
          </thead>
          <tbody>
            {prefixRows.map((row) => (
              <tr key={row.prefix}>
                <th scope="row" style={{ ...tableCellStyle, fontWeight: 600 }}>
                  {row.cidr}
                </th>
                <td style={tableCellStyle}>{row.netmask}</td>
                <td style={tableCellStyle}>{row.wildcardMask}</td>
                <td style={tableCellStyle}>{formatNumber(row.usableHosts)}</td>
                <td style={tableCellStyle}>{formatNumber(row.totalAddresses)}</td>
                <td style={tableCellStyle}>
                  <code style={codeStyle}>{row.binaryMask}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const SubnetCheatSheetPanel = () => {
  return (
    <section className="tk-card" style={containerStyle}>
      <header>
        <h2 style={headerTitleStyle}>
          <span className="material-symbols-outlined" aria-hidden>
            dns
          </span>
          Subnet toolkit
        </h2>
        <p style={headerSubtitleStyle}>
          Switch between the IPv4 calculator and the prefix reference without leaving the Toolbox.
        </p>
      </header>

      <nav style={navStyle} aria-label="Subnet toolkit sections">
        <NavLink end to="" style={({ isActive }) => navLinkStyle(isActive)}>
          <span className="material-symbols-outlined" aria-hidden>
            calculate
          </span>
          Calculator
        </NavLink>
        <NavLink to="cheat-sheet" style={({ isActive }) => navLinkStyle(isActive)}>
          <span className="material-symbols-outlined" aria-hidden>
            table
          </span>
          Prefix cheat sheet
        </NavLink>
      </nav>

      <div style={contentStyle}>
        <Routes>
          <Route index element={<CalculatorPage />} />
          <Route path="cheat-sheet" element={<PrefixCheatSheetPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
    </section>
  );
};

export default SubnetCheatSheetPanel;
