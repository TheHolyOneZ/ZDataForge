import { useState, useEffect } from "react";
import { hashText, type HashResult } from "../../lib/ipc";
import { CopyButton } from "../../components/tool-bits";

export default function HashGenerator() {
  const [input, setInput] = useState("Hello, ZDataForge!");
  const [result, setResult] = useState<HashResult | null>(null);

  useEffect(() => {
    if (!input) {
      setResult(null);
      return;
    }
    void hashText(input).then(setResult);
  }, [input]);

  const algorithms: { key: keyof HashResult; label: string }[] = [
    { key: "md5", label: "MD5" },
    { key: "sha1", label: "SHA-1" },
    { key: "sha256", label: "SHA-256" },
    { key: "sha384", label: "SHA-384" },
    { key: "sha512", label: "SHA-512" },
    { key: "blake3", label: "BLAKE3" },
  ];

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
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash…"
          rows={3}
          style={{
            width: "100%",
            resize: "none",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.5,
            padding: "8px 12px",
            outline: "none",
            boxSizing: "border-box",
          }}
          className="selectable"
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {algorithms.map(({ key, label }) => {
          const value = result?.[key] ?? "";
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-border)",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 80,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.4,
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: value
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
                  wordBreak: "break-all",
                  lineHeight: 1.6,
                }}
                className="selectable"
              >
                {value || "—"}
              </span>
              <CopyButton value={value} variant="ghost" disabled={!value} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
