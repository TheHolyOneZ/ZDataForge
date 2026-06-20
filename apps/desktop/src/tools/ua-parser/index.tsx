import { useState, useEffect } from "react";
import { parseUa, type UaInfo } from "../../lib/ipc";
import { Button } from "../../components/button";

const SAMPLE_UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
];

export default function UaParser() {
  const [input, setInput] = useState(SAMPLE_UAS[0]);
  const [result, setResult] = useState<UaInfo | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    parseUa(input)
      .then(setResult)
      .catch(() => {});
  }, [input]);

  const rows: [string, string | null][] = result
    ? [
        ["Device Type", result.device_type],
        ["Browser", result.browser],
        ["Browser Version", result.browser_version],
        ["OS", result.os],
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
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SAMPLE_UAS.map((ua, i) => (
            <Button
              key={i}
              variant="secondary"
              active={input === ua}
              onClick={() => setInput(ua)}
            >
              Sample {i + 1}
            </Button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Paste a User-Agent string…"
          style={{
            width: "100%",
            resize: "none",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            lineHeight: 1.5,
            padding: "8px 12px",
            outline: "none",
            boxSizing: "border-box",
          }}
          className="selectable"
        />
      </div>
      {result && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {rows
            .filter(([, v]) => v != null)
            .map(([label, val]) => (
              <div
                key={label}
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
                    width: 140,
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
                  }}
                  className="selectable"
                >
                  {val}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
