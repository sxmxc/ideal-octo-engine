import type { FormEvent } from "react";

import { apiFetch, getReactRouterRuntime, getReactRuntime } from "./runtime";

const React = getReactRuntime();
const Router = getReactRouterRuntime();
const { useCallback, useEffect, useMemo, useState } = React;
const { NavLink, Navigate, Route, Routes } = Router;

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

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "subnet-cheat-sheet__nav-link subnet-cheat-sheet__nav-link--active"
    : "subnet-cheat-sheet__nav-link";

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

  return (
    <div className="subnet-cheat-sheet__calculator">
      <form onSubmit={handleSubmit} className="subnet-cheat-sheet__form">
        <label htmlFor="subnet-cidr">
          CIDR network
          <input
            id="subnet-cidr"
            type="text"
            value={cidrInput}
            onChange={(event) => setCidrInput(event.target.value)}
            placeholder="10.10.42.0/24"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="subnet-cheat-sheet__error">
          {error}
        </p>
      ) : null}

      {summary ? (
        <dl className="subnet-cheat-sheet__summary">
          <div>
            <dt>Network</dt>
            <dd>{summary.network_address}</dd>
          </div>
          <div>
            <dt>Broadcast</dt>
            <dd>{summary.broadcast_address}</dd>
          </div>
          <div>
            <dt>First usable</dt>
            <dd>{summary.first_usable}</dd>
          </div>
          <div>
            <dt>Last usable</dt>
            <dd>{summary.last_usable}</dd>
          </div>
          <div>
            <dt>Netmask</dt>
            <dd>{summary.netmask}</dd>
          </div>
          <div>
            <dt>Wildcard mask</dt>
            <dd>{summary.wildcard_mask}</dd>
          </div>
          <div>
            <dt>Usable hosts</dt>
            <dd>{formatNumber(summary.usable_hosts)}</dd>
          </div>
          <div>
            <dt>Total addresses</dt>
            <dd>{formatNumber(summary.total_addresses)}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
};

const PrefixCheatSheetPage = () => {
  const prefixRows = useMemo(() => DEFAULT_PREFIX_ROWS, []);

  return (
    <section className="subnet-cheat-sheet__table">
      <h2>Prefix cheat sheet</h2>
      <p>
        Use this table to compare prefix capacities, netmasks, and wildcard
        masks when planning address allocations.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">CIDR</th>
            <th scope="col">Netmask</th>
            <th scope="col">Wildcard</th>
            <th scope="col">Usable hosts</th>
            <th scope="col">Total addresses</th>
            <th scope="col">Binary mask</th>
          </tr>
        </thead>
        <tbody>
          {prefixRows.map((row) => (
            <tr key={row.prefix}>
              <th scope="row">{row.cidr}</th>
              <td>{row.netmask}</td>
              <td>{row.wildcardMask}</td>
              <td>{formatNumber(row.usableHosts)}</td>
              <td>{formatNumber(row.totalAddresses)}</td>
              <td>
                <code>{row.binaryMask}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export const SubnetCheatSheetPanel = () => {
  return (
    <section className="subnet-cheat-sheet">
      <header>
        <h1>Subnet toolkit</h1>
        <p>
          Switch between the IPv4 calculator and the prefix reference without
          leaving the Toolbox.
        </p>
      </header>

      <nav className="subnet-cheat-sheet__nav" aria-label="Subnet toolkit sections">
        <NavLink end to="" className={navLinkClassName}>
          Calculator
        </NavLink>
        <NavLink to="cheat-sheet" className={navLinkClassName}>
          Prefix cheat sheet
        </NavLink>
      </nav>

      <div className="subnet-cheat-sheet__content">
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
