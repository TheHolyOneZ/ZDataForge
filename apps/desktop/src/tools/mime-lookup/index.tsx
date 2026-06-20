import { useState, useEffect } from "react";
import { lookupMime, type MimeInfo } from "../../lib/ipc";
import { CopyButton } from "../../components/tool-bits";

export default function MimeLookup() {
  const [input, setInput] = useState("json");
  const [result, setResult] = useState<MimeInfo | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    lookupMime(input.trim())
      .then(setResult)
      .catch(() => {});
  }, [input]);

  const rows: [string, string][] = result
    ? [
        ["MIME Type", result.mime ?? "Unknown"],
        ["Extension", result.extension ? `.${result.extension}` : "Unknown"],
      ]
    : [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        padding: 20,
        gap: 16,
        boxSizing: "border-box",
      }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Extension (e.g. json) or MIME type (e.g. image/png)"
        style={{
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          height: 32,
          padding: "0 12px",
          outline: "none",
        }}
        className="selectable"
      />

      {result ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  width: 88,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                  wordBreak: "break-all",
                }}
                className="selectable"
              >
                {val}
              </span>
              <CopyButton value={val} variant="ghost" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
