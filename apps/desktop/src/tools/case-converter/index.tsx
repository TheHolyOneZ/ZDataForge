import { useState, useEffect } from "react";
import { convertCase, type CaseConvertResponse } from "../../lib/ipc";
import { CopyButton } from "../../components/tool-bits";

export default function CaseConverter() {
  const [input, setInput] = useState("hello world example");
  const [result, setResult] = useState<CaseConvertResponse | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    convertCase(input)
      .then(setResult)
      .catch(() => setResult(null));
  }, [input]);

  const rows: { label: string; key: keyof CaseConvertResponse }[] = [
    { label: "snake_case", key: "snake" },
    { label: "camelCase", key: "camel" },
    { label: "PascalCase", key: "pascal" },
    { label: "kebab-case", key: "kebab" },
    { label: "SCREAMING_SNAKE", key: "screaming" },
    { label: "Title Case", key: "title" },
    { label: "Train-Case", key: "train" },
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
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert…"
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontSize: 13,
            height: 32,
            padding: "0 12px",
            outline: "none",
            fontFamily: "var(--font-sans)",
            boxSizing: "border-box",
          }}
          className="selectable"
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {rows.map((row) => {
          const value = result?.[row.key] ?? "";
          return (
            <div
              key={row.key}
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
                  width: 150,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  flexShrink: 0,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: value
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
                  wordBreak: "break-all",
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
