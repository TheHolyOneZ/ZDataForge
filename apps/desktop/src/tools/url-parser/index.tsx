import { useState, useCallback } from "react";
import { parseUrlTool, type UrlInfo } from "../../lib/ipc";

export default function UrlParser() {
  const [input, setInput] = useState(
    "https://user@api.example.com:8080/v1/search?q=hello+world&page=2#results",
  );
  const [result, setResult] = useState<UrlInfo | null>(null);
  const [error, setError] = useState("");

  const run = useCallback(async (val: string) => {
    if (!val.trim()) {
      setResult(null);
      setError("");
      return;
    }
    try {
      setResult(await parseUrlTool(val));
      setError("");
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }, []);

  const fields: [string, string | null][] = result
    ? [
        ["Scheme", result.scheme],
        ["Host", result.host],
        ["Port", result.port != null ? String(result.port) : null],
        ["Path", result.path],
        ["Query", result.query],
        ["Fragment", result.fragment],
        ["Username", result.username],
      ]
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            run(e.target.value);
          }}
          placeholder="Paste a URL to parse…"
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: `1px solid ${
              error ? "var(--color-error)" : "var(--color-border)"
            }`,
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            height: 32,
            padding: "0 12px",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color var(--duration-base) var(--ease-out)",
          }}
          className="selectable"
        />
        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-error)" }}>
            {error}
          </div>
        )}
      </div>
      {result && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {fields
            .filter(([, v]) => v != null)
            .map(([label, val]) => (
              <Row key={label} label={label} value={val!} />
            ))}
          {result.query_params.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  padding: "14px 16px 6px",
                  letterSpacing: 0.5,
                  background: "var(--color-bg)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                QUERY PARAMETERS
              </div>
              {result.query_params.map(([k, v], i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--color-accent)",
                      minWidth: 120,
                      flexShrink: 0,
                    }}
                    className="selectable"
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      wordBreak: "break-all",
                    }}
                    className="selectable"
                  >
                    {v}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "1px solid var(--color-border)",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 100,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: 0.2,
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--color-text-primary)",
          wordBreak: "break-all",
        }}
        className="selectable"
      >
        {value}
      </span>
    </div>
  );
}
