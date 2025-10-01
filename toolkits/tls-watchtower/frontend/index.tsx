import { apiFetch, getReactRuntime } from "./runtime";

const React = getReactRuntime();

export type CertificateSnapshot = {
  host: string;
  port: number;
  expires_at: string;
  last_scanned_at: string;
  days_remaining: number;
  status: "ok" | "watch" | "warning" | "critical";
  status_label: string;
  renewal_message: string;
  error?: string | null;
  history: Array<{
    scanned_at: string;
    expires_at: string;
    status: "ok" | "watch" | "warning" | "critical";
  }>;
};

const badgePalette: Record<CertificateSnapshot["status"], string> = {
  ok: "var(--color-status-success)",
  watch: "var(--color-status-information)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-danger)",
};

const containerStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "grid",
  gap: "1.5rem",
  color: "var(--color-text-primary)",
};

const cardStyle: React.CSSProperties = {
  padding: "1.25rem",
  borderRadius: "0.75rem",
  border: "1px solid var(--color-border-muted)",
  background: "var(--color-surface-raised)",
  display: "grid",
  gap: "0.75rem",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const historyListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "1.1rem",
  display: "grid",
  gap: "0.25rem",
};

function StatusBadge({ status, label }: { status: CertificateSnapshot["status"]; label: string }) {
  const background = badgePalette[status] ?? "var(--color-status-information)";
  const style: React.CSSProperties = {
    alignSelf: "flex-start",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--color-surface-primary)",
    background,
  };

  return <span style={style}>{label}</span>;
}

function formatDistance(daysRemaining: number) {
  if (daysRemaining === 0) {
    return "expires today";
  }
  if (daysRemaining === 1) {
    return "1 day remaining";
  }
  return `${daysRemaining} days remaining`;
}

async function loadHosts(): Promise<CertificateSnapshot[]> {
  const response = await apiFetch<CertificateSnapshot[]>("/toolkits/tls-watchtower/hosts");
  return response;
}

export const TlsWatchtowerPanel = () => {
  const { useCallback, useEffect, useMemo, useState } = React;
  const [hosts, setHosts] = useState<CertificateSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadHosts();
      setHosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load hosts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHosts();
  }, [fetchHosts]);

  const criticalCount = useMemo(() => hosts.filter((item) => item.status === "critical").length, [hosts]);
  const warningCount = useMemo(() => hosts.filter((item) => item.status === "warning").length, [hosts]);

  return (
    <section style={containerStyle}>
      <header style={{ display: "grid", gap: "0.25rem" }}>
        <h1 style={{ margin: 0 }}>TLS Watchtower</h1>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Track certificate expirations across self-contained lab hosts with deterministic sample data.
        </p>
      </header>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: "12rem" }}>
          <strong style={{ fontSize: "2rem" }}>{criticalCount}</strong>
          <div style={{ color: "var(--color-text-secondary)" }}>critical expirations</div>
        </div>
        <div style={{ minWidth: "12rem" }}>
          <strong style={{ fontSize: "2rem" }}>{warningCount}</strong>
          <div style={{ color: "var(--color-text-secondary)" }}>warning expirations</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button type="button" className="sre-button" onClick={() => fetchHosts()} disabled={loading}>
          {loading ? "Refreshing" : "Refresh"}
        </button>
        {error ? <span style={{ color: "var(--color-status-danger)" }}>{error}</span> : null}
      </div>

      <div style={listStyle}>
        {loading ? (
          <div>Loading certificate data…</div>
        ) : hosts.length === 0 ? (
          <div>No hosts registered.</div>
        ) : (
          hosts.map((host) => (
            <article key={host.host} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{host.host}</h2>
                  <p style={{ margin: "0.25rem 0 0", color: "var(--color-text-secondary)" }}>
                    {formatDistance(host.days_remaining)} · last scanned {new Date(host.last_scanned_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={host.status} label={host.status_label} />
              </div>

              <p style={{ margin: 0 }}>{host.renewal_message}</p>

              {host.history.length > 0 ? (
                <div>
                  <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem" }}>Recent scans</h3>
                  <ul style={historyListStyle}>
                    {host.history.slice(0, 4).map((entry) => (
                      <li key={entry.scanned_at}>
                        {new Date(entry.scanned_at).toLocaleDateString()} → expires {new Date(entry.expires_at).toLocaleDateString()} · {entry.status}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default TlsWatchtowerPanel;
