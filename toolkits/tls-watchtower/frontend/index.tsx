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

type Severity = CertificateSnapshot["status"];

const badgePalette: Record<Severity, string> = {
  ok: "var(--color-status-success)",
  watch: "var(--color-status-information)",
  warning: "var(--color-status-warning)",
  critical: "var(--color-status-danger)",
};

const statusOrder: Severity[] = ["critical", "warning", "watch", "ok"];

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

const formCardStyle: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid var(--color-border-muted)",
  background: "var(--color-surface-raised)",
  padding: "1rem",
  display: "grid",
  gap: "0.75rem",
};

const fieldsetStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.25rem",
  minWidth: "12rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
};

const inputStyle: React.CSSProperties = {
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border-muted)",
  padding: "0.45rem 0.65rem",
  fontSize: "0.95rem",
  background: "var(--color-surface-primary)",
  color: "var(--color-text-primary)",
};

const helperTextStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--color-status-danger)",
};

const mutedHelperTextStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--color-text-secondary)",
};

const distributionCardStyle: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid var(--color-border-muted)",
  padding: "1rem",
  background: "var(--color-surface-raised)",
  display: "grid",
  gap: "0.5rem",
};

const distributionBarStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  height: "0.75rem",
  borderRadius: "999px",
  overflow: "hidden",
  background: "var(--color-surface-muted)",
};

const distributionDotStyle: React.CSSProperties = {
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "999px",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  alignItems: "center",
};

const ghostButtonStyle: React.CSSProperties = {
  borderRadius: "999px",
  border: "1px solid var(--color-border-muted)",
  background: "transparent",
  padding: "0.4rem 0.85rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  cursor: "pointer",
};

function StatusBadge({ status, label }: { status: Severity; label: string }) {
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

async function createHost(payload: { host: string; port: number }) {
  return apiFetch<CertificateSnapshot>("/toolkits/tls-watchtower/hosts", {
    method: "POST",
    json: payload,
  });
}

async function updateHost(originalHost: string, payload: { host: string; port: number }) {
  return apiFetch<CertificateSnapshot>(`/toolkits/tls-watchtower/hosts/${encodeURIComponent(originalHost)}`, {
    method: "PUT",
    json: payload,
  });
}

export const TlsWatchtowerPanel = () => {
  const { useCallback, useEffect, useMemo, useState } = React;

  const [hosts, setHosts] = useState<CertificateSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formHost, setFormHost] = useState("");
  const [formPort, setFormPort] = useState("443");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [editingHost, setEditingHost] = useState<string | null>(null);
  const [editHostValue, setEditHostValue] = useState("");
  const [editPortValue, setEditPortValue] = useState("443");
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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
  const statusBreakdown = useMemo(() => {
    return hosts.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { ok: 0, watch: 0, warning: 0, critical: 0 } as Record<Severity, number>,
    );
  }, [hosts]);
  const totalHosts = hosts.length;

  const handleAddHost = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleEditStart = useCallback((snapshot: CertificateSnapshot) => {
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
    async (event: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <section style={containerStyle}>
      <header style={{ display: "grid", gap: "0.25rem" }}>
        <h1 style={{ margin: 0 }}>TLS Watchtower</h1>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          Track certificate expirations across self-contained lab hosts with deterministic sample data.
        </p>
      </header>

      <div style={{ display: "grid", gap: "1rem" }}>
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

        <div style={distributionCardStyle}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
            Inventory distribution
          </div>
          {totalHosts > 0 ? (
            <>
              <div style={distributionBarStyle}>
                {statusOrder.map((status) => {
                  const count = statusBreakdown[status];
                  if (count === 0) {
                    return null;
                  }

                  return (
                    <span
                      key={status}
                      style={{
                        background: badgePalette[status],
                        flexGrow: count,
                        flexBasis: 0,
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {statusOrder.map((status) => (
                  <span key={status} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ ...distributionDotStyle, background: badgePalette[status] }} />
                    {statusBreakdown[status]} {statusBreakdown[status] === 1 ? "endpoint" : "endpoints"}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={mutedHelperTextStyle}>Add an endpoint to populate distribution metrics.</div>
          )}
        </div>
      </div>

      <form style={formCardStyle} onSubmit={handleAddHost}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={fieldsetStyle}>
            <span style={labelStyle}>Hostname</span>
            <input
              style={inputStyle}
              type="text"
              name="host"
              autoComplete="off"
              placeholder="example.internal"
              value={formHost}
              onChange={(event) => setFormHost(event.target.value)}
              disabled={formSubmitting}
              required
            />
          </label>
          <label style={fieldsetStyle}>
            <span style={labelStyle}>Port</span>
            <input
              style={inputStyle}
              type="number"
              name="port"
              min={1}
              max={65535}
              value={formPort}
              onChange={(event) => setFormPort(event.target.value)}
              disabled={formSubmitting}
              required
            />
          </label>
        </div>
        <div style={buttonRowStyle}>
          <button type="submit" className="sre-button" disabled={formSubmitting}>
            {formSubmitting ? "Adding" : "Add endpoint"}
          </button>
          {formError ? <span style={helperTextStyle}>{formError}</span> : <span style={mutedHelperTextStyle}>New endpoints are scanned immediately after creation.</span>}
        </div>
      </form>

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
          hosts.map((host) => {
            const isEditing = editingHost === host.host;
            return (
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

                {isEditing ? (
                  <form onSubmit={handleEditSubmit} style={{ display: "grid", gap: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <label style={fieldsetStyle}>
                        <span style={labelStyle}>Hostname</span>
                        <input
                          style={inputStyle}
                          type="text"
                          value={editHostValue}
                          onChange={(event) => setEditHostValue(event.target.value)}
                          disabled={editSubmitting}
                          required
                        />
                      </label>
                      <label style={fieldsetStyle}>
                        <span style={labelStyle}>Port</span>
                        <input
                          style={inputStyle}
                          type="number"
                          min={1}
                          max={65535}
                          value={editPortValue}
                          onChange={(event) => setEditPortValue(event.target.value)}
                          disabled={editSubmitting}
                          required
                        />
                      </label>
                    </div>
                    <div style={buttonRowStyle}>
                      <button type="submit" className="sre-button" disabled={editSubmitting}>
                        {editSubmitting ? "Saving" : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        style={{ ...ghostButtonStyle, opacity: editSubmitting ? 0.6 : 1 }}
                        disabled={editSubmitting}
                      >
                        Cancel
                      </button>
                      {editError ? <span style={helperTextStyle}>{editError}</span> : <span style={mutedHelperTextStyle}>Changes trigger a fresh scan for this endpoint.</span>}
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={mutedHelperTextStyle}>Port {host.port}</span>
                    <button
                      type="button"
                      onClick={() => handleEditStart(host)}
                      style={ghostButtonStyle}
                    >
                      Edit endpoint
                    </button>
                  </div>
                )}

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
            );
          })
        )}
      </div>
    </section>
  );
};

export default TlsWatchtowerPanel;
