import { useState, useCallback } from "react";
import { hmacSign } from "../../lib/ipc";
import { Copy } from "lucide-react";

const ALGOS = ["sha256", "sha384", "sha512", "sha1"] as const;

export default function HmacGenerator() {
  const [key, setKey] = useState("secret-key");
  const [message, setMessage] = useState("Hello, World!");
  const [algo, setAlgo] = useState<(typeof ALGOS)[number]>("sha256");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const run = useCallback(async (k: string, m: string, a: string) => {
    if (!k || !m) {
      setResult("");
      setError("");
      return;
    }
    try {
      setResult(await hmacSign(k, m, a));
      setError("");
    } catch (e) {
      setError(String(e));
      setResult("");
    }
  }, []);

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div>
        <label
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            display: "block",
            marginBottom: 6,
          }}
        >
          ALGORITHM
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          {ALGOS.map((a) => (
            <button
              key={a}
              onClick={() => {
                setAlgo(a);
                run(key, message, a);
              }}
              style={{
                background: algo === a ? "var(--color-accent-muted)" : "var(--color-elevated)",
                border: `1px solid ${algo === a ? "var(--color-accent)" : "var(--color-border)"}`,
                borderRadius: 4,
                color: algo === a ? "var(--color-accent)" : "var(--color-text-muted)",
                fontSize: 12,
                padding: "3px 10px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {(
        [
          {
            label: "KEY",
            val: key,
            set: (v: string) => {
              setKey(v);
              run(v, message, algo);
            },
          },
          {
            label: "MESSAGE",
            val: message,
            set: (v: string) => {
              setMessage(v);
              run(key, v, algo);
            },
          },
        ] as const
      ).map(({ label, val, set }) => (
        <div key={label}>
          <label
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            {label}
          </label>
          <input
            value={val}
            onChange={(e) => set(e.target.value)}
            style={{
              width: "100%",
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              padding: "8px 12px",
              outline: "none",
              boxSizing: "border-box",
            }}
            className="selectable"
          />
        </div>
      ))}
      {error && <div style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</div>}
      {result && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              wordBreak: "break-all",
              color: "var(--color-text-primary)",
            }}
            className="selectable"
          >
            {result}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              flexShrink: 0,
              display: "flex",
            }}
          >
            <Copy size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
