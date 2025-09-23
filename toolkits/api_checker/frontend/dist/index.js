// ../toolkits/api_checker/frontend/runtime.ts
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

// ../toolkits/api_checker/frontend/index.tsx
var React = getReactRuntime();
var { useCallback, useEffect, useMemo, useRef, useState } = React;
var HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
var RAW_CONTENT_TYPES = [
  "text/plain",
  "application/json",
  "application/xml",
  "application/x-www-form-urlencoded",
  "application/octet-stream"
];
var HISTORY_STORAGE_KEY = "toolkits.api-checker.history.v1";
var MAX_HISTORY_ENTRIES = 25;
var layoutStyles = {
  wrapper: {
    display: "grid",
    gap: "1.5rem",
    color: "var(--color-text-primary)",
    padding: "1.5rem"
  },
  main: {
    display: "grid",
    gap: "1.5rem",
    alignItems: "flex-start"
  },
  split: {
    display: "grid",
    gap: "1.5rem",
    alignItems: "flex-start",
    gridTemplateColumns: "minmax(0, 1fr)"
  },
  splitWide: {
    display: "grid",
    gap: "1.5rem",
    alignItems: "flex-start",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)"
  },
  rightColumn: {
    display: "grid",
    gap: "1.5rem",
    alignItems: "flex-start"
  },
  section: {
    background: "var(--color-surface-alt)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    padding: "1.25rem",
    display: "grid",
    gap: "0.9rem"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem"
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    fontSize: "1rem",
    margin: 0
  },
  icon: {
    fontSize: "1.2rem",
    color: "var(--color-link)",
    lineHeight: 1
  },
  mutedText: {
    color: "var(--color-text-secondary)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem"
  },
  tableHeadCell: {
    textAlign: "left",
    color: "var(--color-text-secondary)",
    fontWeight: 500,
    paddingBottom: "0.35rem"
  },
  badge: {
    borderRadius: 999,
    padding: "0.15rem 0.5rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem"
  }
};
function uniqueId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}
function createRow(overrides = {}) {
  return {
    id: uniqueId("row"),
    name: "",
    value: "",
    enabled: true,
    ...overrides
  };
}
function ensureTrailingBlank(rows) {
  const filled = rows.filter((row) => row.name.trim() !== "" || row.value.trim() !== "");
  const blanks = rows.filter((row) => row.name.trim() === "" && row.value.trim() === "");
  const trailingBlank = blanks.length > 0 ? blanks[blanks.length - 1] : createRow();
  return [...filled, trailingBlank];
}
function toPayloadPairs(rows) {
  return rows.filter((row) => row.name.trim() !== "" || row.value.trim() !== "").map((row) => ({
    name: row.name.trim(),
    value: row.value,
    enabled: row.enabled
  }));
}
function rowsFromPayload(pairs) {
  if (!pairs.length) {
    return ensureTrailingBlank([createRow()]);
  }
  const mapped = pairs.map(
    (pair) => createRow({
      name: pair.name,
      value: pair.value,
      enabled: pair.enabled
    })
  );
  return ensureTrailingBlank(mapped);
}
function cloneRequest(payload) {
  return JSON.parse(JSON.stringify(payload));
}
function cloneResponse(payload) {
  return JSON.parse(JSON.stringify(payload));
}
function formatDuration(durationMs) {
  if (Number.isNaN(durationMs)) {
    return "\u2014";
  }
  if (durationMs >= 1e3) {
    return `${(durationMs / 1e3).toFixed(2)} s`;
  }
  return `${durationMs.toFixed(1)} ms`;
}
function formatSize(sizeBytes) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
function statusTone(statusCode) {
  if (statusCode >= 500) {
    return { background: "rgba(226, 67, 67, 0.18)", color: "var(--color-danger-text)" };
  }
  if (statusCode >= 400) {
    return { background: "rgba(255, 193, 7, 0.18)", color: "#c77700" };
  }
  if (statusCode >= 200) {
    return { background: "rgba(72, 199, 142, 0.18)", color: "#1f8a53" };
  }
  return { background: "var(--color-surface)", color: "var(--color-text-secondary)" };
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "\u2014";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function ApiCheckerApp() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [queryParams, setQueryParams] = useState(() => ensureTrailingBlank([createRow()]));
  const [headers, setHeaders] = useState(() => ensureTrailingBlank([createRow()]));
  const [bodyMode, setBodyMode] = useState("none");
  const [bodyContent, setBodyContent] = useState("");
  const [rawContentType, setRawContentType] = useState("text/plain");
  const [authType, setAuthType] = useState("none");
  const [basicAuth, setBasicAuth] = useState({ username: "", password: "" });
  const [bearerToken, setBearerToken] = useState("");
  const [apiKeyAuth, setApiKeyAuth] = useState({ headerName: "Authorization", headerValue: "" });
  const [followRedirects, setFollowRedirects] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [bodyError, setBodyError] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = window.sessionStorage.getItem(HISTORY_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const entries = parsed.slice(0, MAX_HISTORY_ENTRIES);
      return entries.map((entry) => ({
        ...entry,
        response: entry.response ? {
          ...entry.response,
          method: entry.response.method || entry.request.method
        } : void 0
      }));
    } catch (err) {
      console.warn("Failed to restore API Checker history:", err);
      return [];
    }
  });
  const [historyExpanded, setHistoryExpanded] = useState(() => history.length > 0);
  const previousHistoryCount = useRef(history.length);
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === "undefined" ? 0 : window.innerWidth);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ENTRIES)));
    } catch (err) {
      console.warn("Failed to persist API Checker history:", err);
    }
  }, [history]);
  const methodSupportsBody = method !== "GET" && method !== "HEAD";
  useEffect(() => {
    if (!methodSupportsBody) {
      setBodyMode("none");
    }
  }, [methodSupportsBody]);
  const buildRequestPayload = useCallback(() => {
    const trimmedUrl = url.trim();
    const payload = {
      method,
      url: trimmedUrl,
      query_params: toPayloadPairs(queryParams),
      headers: toPayloadPairs(headers),
      body: {
        mode: bodyMode,
        content: bodyMode === "none" ? null : bodyContent,
        content_type: bodyMode === "json" ? "application/json" : bodyMode === "raw" ? rawContentType : null
      },
      auth: {
        type: authType,
        username: authType === "basic" ? basicAuth.username || null : null,
        password: authType === "basic" ? basicAuth.password || null : null,
        token: authType === "bearer" ? bearerToken || null : null,
        header_name: authType === "apiKey" ? apiKeyAuth.headerName || null : null,
        header_value: authType === "apiKey" ? apiKeyAuth.headerValue || null : null
      },
      follow_redirects: followRedirects,
      timeout: timeoutSeconds
    };
    return payload;
  }, [
    method,
    url,
    queryParams,
    headers,
    bodyMode,
    bodyContent,
    rawContentType,
    authType,
    basicAuth.username,
    basicAuth.password,
    bearerToken,
    apiKeyAuth.headerName,
    apiKeyAuth.headerValue,
    followRedirects,
    timeoutSeconds
  ]);
  const handleSend = useCallback(async () => {
    if (sending) {
      return;
    }
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Provide a target URL to send the request.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError("Requests must start with http:// or https://.");
      return;
    }
    setError(null);
    setBodyError(null);
    const payload = buildRequestPayload();
    const historyId = uniqueId("history");
    const startedAt = (/* @__PURE__ */ new Date()).toISOString();
    const requestSnapshot = cloneRequest(payload);
    setHistory((prev) => {
      const next = [{ id: historyId, startedAt, request: requestSnapshot }, ...prev];
      return next.slice(0, MAX_HISTORY_ENTRIES);
    });
    setActiveHistoryId(historyId);
    setSending(true);
    try {
      const result = await apiFetch("/toolkits/api-checker/requests", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setResponse(result);
      setHistory(
        (prev) => prev.map((entry) => entry.id === historyId ? { ...entry, response: cloneResponse(result) } : entry)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed.";
      setResponse(null);
      setError(message);
      setHistory(
        (prev) => prev.map((entry) => entry.id === historyId ? { ...entry, error: message } : entry)
      );
    } finally {
      setSending(false);
    }
  }, [buildRequestPayload, sending, url]);
  const handleFormatJson = useCallback(() => {
    if (!bodyContent.trim()) {
      setBodyError("Add JSON content before formatting.");
      return;
    }
    try {
      const parsed = JSON.parse(bodyContent);
      setBodyContent(JSON.stringify(parsed, null, 2));
      setBodyError(null);
    } catch (err) {
      setBodyError(err instanceof Error ? err.message : "Unable to format JSON payload.");
    }
  }, [bodyContent]);
  const selectHistoryEntry = useCallback(
    (entry) => {
      setActiveHistoryId(entry.id);
      setMethod(entry.request.method);
      setUrl(entry.request.url);
      setQueryParams(rowsFromPayload(entry.request.query_params));
      setHeaders(rowsFromPayload(entry.request.headers));
      setBodyMode(entry.request.body.mode);
      setBodyContent(entry.request.body.content ?? "");
      if (entry.request.body.mode === "raw" && entry.request.body.content_type) {
        setRawContentType(entry.request.body.content_type);
      }
      setAuthType(entry.request.auth.type);
      setBasicAuth({
        username: entry.request.auth.username ?? "",
        password: entry.request.auth.password ?? ""
      });
      setBearerToken(entry.request.auth.token ?? "");
      setApiKeyAuth({
        headerName: entry.request.auth.header_name ?? "Authorization",
        headerValue: entry.request.auth.header_value ?? ""
      });
      setFollowRedirects(entry.request.follow_redirects);
      setTimeoutSeconds(entry.request.timeout);
      setResponse(entry.response ? cloneResponse({ ...entry.response, method: entry.response.method || entry.request.method }) : null);
      setError(entry.error ?? null);
    },
    []
  );
  const clearHistory = useCallback(() => {
    setHistory([]);
    setActiveHistoryId(null);
    setHistoryExpanded(false);
  }, []);
  const requestSummary = useMemo(() => {
    return `${method} ${url || "\u2014"}`;
  }, [method, url]);
  useEffect(() => {
    const previousCount = previousHistoryCount.current;
    if (history.length === 0) {
      setHistoryExpanded(false);
    } else if (previousCount === 0 && history.length > 0) {
      setHistoryExpanded(true);
    }
    previousHistoryCount.current = history.length;
  }, [history.length]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isCompactLayout = useMemo(() => {
    if (viewportWidth === 0) {
      return false;
    }
    return viewportWidth < 1080;
  }, [viewportWidth]);
  const requestBuilderSplitStyle = useMemo(() => {
    if (isCompactLayout) {
      return layoutStyles.split;
    }
    return layoutStyles.splitWide;
  }, [isCompactLayout]);
  return /* @__PURE__ */ React.createElement("div", { className: "tk-card", style: layoutStyles.wrapper }, /* @__PURE__ */ React.createElement("header", { style: { display: "grid", gap: "0.35rem" } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" } }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "api"), "API Checker"), /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Compose HTTP requests, inspect responses, and replay calls with history \u2014 all inside the toolbox shell."), /* @__PURE__ */ React.createElement("div", { style: { ...layoutStyles.mutedText, fontSize: "0.9rem" } }, requestSummary)), /* @__PURE__ */ React.createElement("div", { style: requestBuilderSplitStyle }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "1.5rem" } }, /* @__PURE__ */ React.createElement("section", { style: { ...layoutStyles.section, gap: "0.75rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.35rem", minWidth: 120 } }, "Method", /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "tk-select",
      value: method,
      onChange: (event) => setMethod(event.target.value),
      style: { minWidth: 120 }
    },
    HTTP_METHODS.map((option) => /* @__PURE__ */ React.createElement("option", { key: option, value: option }, option))
  )), /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { flex: 1, display: "grid", gap: "0.35rem", minWidth: 220 } }, "Request URL", /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "tk-input",
      placeholder: "https://api.example.com/v1/resources",
      value: url,
      onChange: (event) => setUrl(event.target.value)
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "tk-button tk-button--primary",
      onClick: handleSend,
      disabled: sending,
      style: { display: "inline-flex", alignItems: "center", gap: "0.35rem", height: 40 }
    },
    /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", "aria-hidden": true }, "play_arrow"),
    sending ? "Sending\u2026" : "Send"
  )), error && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--color-danger-text)", margin: 0 } }, error)), /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "tune"), "Query parameters"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "tk-button tk-button--ghost",
      onClick: () => setQueryParams((rows) => ensureTrailingBlank([...rows, createRow()]))
    },
    "Add row"
  )), /* @__PURE__ */ React.createElement(KeyValueEditor, { rows: queryParams, onRowsChange: setQueryParams, namePlaceholder: "name", valuePlaceholder: "value" })), /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "mail"), "Headers"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "tk-button tk-button--ghost",
      onClick: () => setHeaders((rows) => ensureTrailingBlank([...rows, createRow()]))
    },
    "Add header"
  )), /* @__PURE__ */ React.createElement(KeyValueEditor, { rows: headers, onRowsChange: setHeaders, namePlaceholder: "Header name", valuePlaceholder: "Header value" })), /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "dataset"), "Body"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "tk-select",
      value: bodyMode,
      onChange: (event) => setBodyMode(event.target.value),
      disabled: !methodSupportsBody
    },
    /* @__PURE__ */ React.createElement("option", { value: "none" }, "None"),
    /* @__PURE__ */ React.createElement("option", { value: "raw" }, "Raw text"),
    /* @__PURE__ */ React.createElement("option", { value: "json" }, "JSON")
  ), bodyMode === "raw" && /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "tk-select",
      value: rawContentType,
      onChange: (event) => setRawContentType(event.target.value),
      style: { minWidth: 200 }
    },
    RAW_CONTENT_TYPES.map((type) => /* @__PURE__ */ React.createElement("option", { key: type, value: type }, type))
  ), bodyMode === "json" && /* @__PURE__ */ React.createElement("button", { type: "button", className: "tk-button tk-button--ghost", onClick: handleFormatJson }, "Format JSON"))), bodyMode === "none" ? /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "This request will be sent without a body.") : /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "tk-input",
      rows: bodyMode === "json" ? 12 : 8,
      value: bodyContent,
      onChange: (event) => setBodyContent(event.target.value),
      placeholder: bodyMode === "json" ? '{\n  "example": true\n}' : "Request payload",
      style: { fontFamily: "var(--font-family-mono)", fontSize: "0.95rem" }
    }
  ), bodyError && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--color-danger-text)", margin: 0 } }, bodyError)), /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "vpn_key"), "Authentication")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.75rem" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "tk-select",
      value: authType,
      onChange: (event) => setAuthType(event.target.value),
      style: { maxWidth: 260 }
    },
    /* @__PURE__ */ React.createElement("option", { value: "none" }, "No authentication"),
    /* @__PURE__ */ React.createElement("option", { value: "basic" }, "Basic auth"),
    /* @__PURE__ */ React.createElement("option", { value: "bearer" }, "Bearer token"),
    /* @__PURE__ */ React.createElement("option", { value: "apiKey" }, "Custom header")
  ), authType === "basic" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.6rem", maxWidth: 420 } }, /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.25rem" } }, "Username", /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "tk-input",
      value: basicAuth.username,
      onChange: (event) => setBasicAuth((prev) => ({ ...prev, username: event.target.value }))
    }
  )), /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.25rem" } }, "Password", /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "tk-input",
      type: "password",
      value: basicAuth.password,
      onChange: (event) => setBasicAuth((prev) => ({ ...prev, password: event.target.value }))
    }
  )), /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Credentials are sent over HTTPS only; ensure you trust the target endpoint before sharing secrets.")), authType === "bearer" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.6rem", maxWidth: 420 } }, /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.25rem" } }, "Token", /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "tk-input",
      rows: 3,
      value: bearerToken,
      onChange: (event) => setBearerToken(event.target.value),
      placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\u2026"
    }
  )), /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "A header of the form ", /* @__PURE__ */ React.createElement("code", null, "Authorization: Bearer <token>"), " is added to the request.")), authType === "apiKey" && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.6rem", maxWidth: 420 } }, /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.25rem" } }, "Header name", /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "tk-input",
      value: apiKeyAuth.headerName,
      onChange: (event) => setApiKeyAuth((prev) => ({ ...prev, headerName: event.target.value })),
      placeholder: "X-API-Key"
    }
  )), /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.25rem" } }, "Header value", /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "tk-input",
      value: apiKeyAuth.headerValue,
      onChange: (event) => setApiKeyAuth((prev) => ({ ...prev, headerValue: event.target.value })),
      placeholder: "secret-token"
    }
  )), /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Use this to inject API keys or custom auth headers without editing the headers table manually.")))), /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "settings"), "Request options")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("label", { className: "tk-label", style: { display: "grid", gap: "0.25rem", width: 160 } }, "Timeout (seconds)", /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "tk-input",
      type: "number",
      min: 1,
      max: 120,
      value: timeoutSeconds,
      onChange: (event) => {
        const value = Number(event.target.value);
        if (Number.isNaN(value)) {
          setTimeoutSeconds(30);
        } else {
          setTimeoutSeconds(Math.min(120, Math.max(1, Math.round(value))));
        }
      }
    }
  )), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: followRedirects,
      onChange: (event) => setFollowRedirects(event.target.checked)
    }
  ), "Follow redirects")))), /* @__PURE__ */ React.createElement("div", { style: layoutStyles.rightColumn }, /* @__PURE__ */ React.createElement(ResponsePanel, { response, sending, error }), /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "history"), "History"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "tk-button tk-button--ghost",
      onClick: () => setHistoryExpanded((expanded) => !expanded),
      disabled: history.length === 0
    },
    historyExpanded ? "Hide" : "Show"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "tk-button tk-button--ghost",
      onClick: clearHistory,
      disabled: history.length === 0
    },
    "Clear"
  ))), history.length === 0 && /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Requests you send will appear here."), history.length > 0 && historyExpanded && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.5rem", maxHeight: 360, overflow: "auto", paddingRight: "0.25rem" } }, history.map((entry) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: entry.id,
      type: "button",
      onClick: () => selectHistoryEntry(entry),
      className: "tk-button tk-button--ghost",
      style: {
        justifyContent: "flex-start",
        display: "grid",
        gap: "0.15rem",
        textAlign: "left",
        border: entry.id === activeHistoryId ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
        background: entry.id === activeHistoryId ? "rgba(79, 111, 255, 0.1)" : "transparent",
        padding: "0.75rem"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, display: "flex", gap: "0.5rem", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-family-mono)", fontSize: "0.85rem" } }, entry.request.method), /* @__PURE__ */ React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, entry.request.url)),
    /* @__PURE__ */ React.createElement("span", { style: { ...layoutStyles.mutedText, fontSize: "0.85rem", display: "flex", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement("span", null, formatTimestamp(entry.startedAt)), entry.response && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, "\u2022"), /* @__PURE__ */ React.createElement("span", null, entry.response.status_code, " ", entry.response.reason_phrase || ""), /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, "\u2022"), /* @__PURE__ */ React.createElement("span", null, formatDuration(entry.response.duration_ms))), entry.error && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--color-danger-text)" } }, "Error")))
  ))), history.length > 0 && !historyExpanded && /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, 'History hidden. Select "Show" to browse previous requests.')))));
}
function KeyValueEditor({
  rows,
  onRowsChange,
  namePlaceholder,
  valuePlaceholder
}) {
  const handleNameChange = (rowId, value) => {
    onRowsChange(ensureTrailingBlank(rows.map((row) => row.id === rowId ? { ...row, name: value } : row)));
  };
  const handleValueChange = (rowId, value) => {
    onRowsChange(ensureTrailingBlank(rows.map((row) => row.id === rowId ? { ...row, value } : row)));
  };
  const handleToggle = (rowId, enabled) => {
    onRowsChange(rows.map((row) => row.id === rowId ? { ...row, enabled } : row));
  };
  const handleRemove = (rowId) => {
    const remaining = rows.filter((row) => row.id !== rowId);
    onRowsChange(ensureTrailingBlank(remaining.length ? remaining : [createRow()]));
  };
  return /* @__PURE__ */ React.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: layoutStyles.table }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { ...layoutStyles.tableHeadCell, width: 60 } }, "Send"), /* @__PURE__ */ React.createElement("th", { style: { ...layoutStyles.tableHeadCell, minWidth: 160 } }, namePlaceholder), /* @__PURE__ */ React.createElement("th", { style: { ...layoutStyles.tableHeadCell, minWidth: 200 } }, valuePlaceholder), /* @__PURE__ */ React.createElement("th", { style: { ...layoutStyles.tableHeadCell, width: 40 }, "aria-label": "Remove row" }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((row, index) => {
    const isBlank = row.name.trim() === "" && row.value.trim() === "";
    const allowRemove = rows.length > 1 && (index !== rows.length - 1 || !isBlank);
    return /* @__PURE__ */ React.createElement("tr", { key: row.id }, /* @__PURE__ */ React.createElement("td", { style: { padding: "0.3rem 0.4rem" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: row.enabled, onChange: (event) => handleToggle(row.id, event.target.checked) })), /* @__PURE__ */ React.createElement("td", { style: { padding: "0.3rem 0.4rem" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "tk-input",
        value: row.name,
        onChange: (event) => handleNameChange(row.id, event.target.value),
        placeholder: namePlaceholder
      }
    )), /* @__PURE__ */ React.createElement("td", { style: { padding: "0.3rem 0.4rem" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "tk-input",
        value: row.value,
        onChange: (event) => handleValueChange(row.id, event.target.value),
        placeholder: valuePlaceholder
      }
    )), /* @__PURE__ */ React.createElement("td", { style: { padding: "0.3rem 0.4rem", textAlign: "center" } }, allowRemove && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "tk-button tk-button--ghost",
        onClick: () => handleRemove(row.id),
        "aria-label": "Remove row"
      },
      /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", "aria-hidden": true }, "close")
    )));
  }))));
}
function ResponsePanel({
  response,
  sending,
  error
}) {
  const [activeTab, setActiveTab] = useState("body");
  useEffect(() => {
    setActiveTab("body");
  }, [response?.status_code, error]);
  return /* @__PURE__ */ React.createElement("section", { style: layoutStyles.section }, /* @__PURE__ */ React.createElement("div", { style: layoutStyles.sectionHeader }, /* @__PURE__ */ React.createElement("h4", { style: layoutStyles.sectionTitle }, /* @__PURE__ */ React.createElement("span", { className: "material-symbols-outlined", style: layoutStyles.icon, "aria-hidden": true }, "terminal"), "Response")), sending && /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Awaiting response\u2026"), !sending && !response && !error && /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Send a request to see the response details."), error && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--color-danger-text)", margin: 0 } }, error), response && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.75rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { ...layoutStyles.badge, ...statusTone(response.status_code) } }, /* @__PURE__ */ React.createElement("strong", null, response.status_code), /* @__PURE__ */ React.createElement("span", null, response.reason_phrase || "\u2014")), /* @__PURE__ */ React.createElement("span", { style: layoutStyles.mutedText }, response.http_version || ""), /* @__PURE__ */ React.createElement("span", { "aria-hidden": true, style: layoutStyles.mutedText }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: layoutStyles.mutedText }, formatDuration(response.duration_ms)), /* @__PURE__ */ React.createElement("span", { "aria-hidden": true, style: layoutStyles.mutedText }, "\u2022"), /* @__PURE__ */ React.createElement("span", { style: layoutStyles.mutedText }, formatSize(response.size_bytes))), /* @__PURE__ */ React.createElement("div", { style: { ...layoutStyles.mutedText, wordBreak: "break-all" } }, response.url), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: `tk-button tk-button--ghost${activeTab === "body" ? " tk-button--active" : ""}`,
      onClick: () => setActiveTab("body")
    },
    "Body"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: `tk-button tk-button--ghost${activeTab === "headers" ? " tk-button--active" : ""}`,
      onClick: () => setActiveTab("headers")
    },
    "Headers"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: `tk-button tk-button--ghost${activeTab === "request" ? " tk-button--active" : ""}`,
      onClick: () => setActiveTab("request")
    },
    "Request"
  )), activeTab === "body" && /* @__PURE__ */ React.createElement(ResponseBodyView, { response }), activeTab === "headers" && /* @__PURE__ */ React.createElement(ResponseHeadersView, { response }), activeTab === "request" && /* @__PURE__ */ React.createElement(RequestSummaryView, { response })));
}
function ResponseBodyView({ response }) {
  const bodyText = useMemo(() => {
    if (response.json_body !== null && response.json_body !== void 0) {
      try {
        return JSON.stringify(response.json_body, null, 2);
      } catch (err) {
        console.warn("Failed to stringify JSON body:", err);
      }
    }
    return response.body;
  }, [response.body, response.json_body]);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, response.is_binary && /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Response appears to be binary. Showing decoded preview \u2014 characters may look garbled."), response.body_truncated && /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "Preview truncated to 64 KB. Download the resource directly for the complete payload."), /* @__PURE__ */ React.createElement(
    "pre",
    {
      style: {
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "0.9rem",
        maxHeight: 320,
        overflow: "auto",
        fontFamily: "var(--font-family-mono)",
        fontSize: "0.9rem",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        margin: 0
      }
    },
    bodyText || "(empty body)"
  ));
}
function ResponseHeadersView({ response }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement("h5", { style: { margin: "0 0 0.25rem", fontSize: "0.9rem" } }, "Response headers"), /* @__PURE__ */ React.createElement(HeaderList, { headers: response.headers }), /* @__PURE__ */ React.createElement("h5", { style: { margin: "0.75rem 0 0.25rem", fontSize: "0.9rem" } }, "Request headers"), /* @__PURE__ */ React.createElement(HeaderList, { headers: response.request_headers }));
}
function HeaderList({ headers }) {
  if (!headers.length) {
    return /* @__PURE__ */ React.createElement("p", { style: { ...layoutStyles.mutedText, margin: 0 } }, "No headers recorded.");
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gap: "0.35rem",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "0.75rem"
      }
    },
    headers.map((header, index) => /* @__PURE__ */ React.createElement("div", { key: `${header.name}:${index}`, style: { display: "grid", gap: "0.15rem" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, header.name), /* @__PURE__ */ React.createElement("code", { style: { fontFamily: "var(--font-family-mono)", fontSize: "0.85rem" } }, header.value)))
  );
}
function RequestSummaryView({ response }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: "0.6rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Method"), /* @__PURE__ */ React.createElement("div", { style: layoutStyles.mutedText }, response.method)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "URL"), /* @__PURE__ */ React.createElement("div", { style: { ...layoutStyles.mutedText, wordBreak: "break-all" } }, response.url)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Request headers"), /* @__PURE__ */ React.createElement(HeaderList, { headers: response.request_headers })));
}
export {
  ApiCheckerApp as default
};
