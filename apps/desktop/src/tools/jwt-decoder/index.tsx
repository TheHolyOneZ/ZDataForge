import { useState, useCallback } from "react";
import { decodeJwt, type JwtParts } from "../../lib/ipc";
import { ShieldCheck, ShieldX, Clock } from "lucide-react";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNzE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature";

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [result, setResult] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");

  const run = useCallback(async (val: string) => {
    if (!val.trim()) {
      setResult(null);
      setError("");
      return;
    }
    try {
      setResult(await decodeJwt(val));
      setError("");
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }, []);

  function fmtTs(ts: number | null) {
    if (ts == null) return null;
    return new Date(ts * 1000).toISOString();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <textarea
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            run(e.target.value);
          }}
          placeholder="Paste JWT token here…"
          rows={3}
          style={{
            width: "100%",
            resize: "none",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            padding: "8px 12px",
            outline: "none",
            boxSizing: "border-box",
          }}
          className="selectable"
        />
        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-error)" }}>{error}</div>
        )}
        {result && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              fontSize: 12,
            }}
          >
            {result.is_expired === true && (
              <span
                style={{
                  color: "var(--color-error)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ShieldX size={13} /> EXPIRED
              </span>
            )}
            {result.is_expired === false && (
              <span
                style={{
                  color: "var(--color-success)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ShieldCheck size={13} /> Valid
              </span>
            )}
            {result.exp_ts && (
              <span
                style={{
                  color: "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock size={12} /> exp: {fmtTs(result.exp_ts)}
              </span>
            )}
          </div>
        )}
      </div>
      {result && (
        <div
          style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}
        >
          {[
            { label: "HEADER", obj: result.header },
            { label: "PAYLOAD", obj: result.payload },
          ].map(({ label, obj }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRight: label === "HEADER" ? "1px solid var(--color-border)" : undefined,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  padding: "5px 12px",
                  borderBottom: "1px solid var(--color-border)",
                  flexShrink: 0,
                }}
              >
                {label}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                {Object.entries(obj).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "5px 0",
                      borderBottom: "1px solid var(--color-border)",
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-accent)",
                        flexShrink: 0,
                        minWidth: 80,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                        wordBreak: "break-all",
                      }}
                      className="selectable"
                    >
                      {typeof v === "string" ? v : JSON.stringify(v)}
                    </span>
                    {(k === "exp" || k === "iat" || k === "nbf") && typeof v === "number" && (
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>
                        ({new Date(v * 1000).toISOString()})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
