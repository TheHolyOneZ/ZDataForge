import { useState, useCallback } from "react";
import { convertBase, type BaseConvResult } from "../../lib/ipc";
import { CopyButton } from "../../components/tool-bits";

const BASES = [
  { label: "BIN", base: 2 },
  { label: "OCT", base: 8 },
  { label: "DEC", base: 10 },
  { label: "HEX", base: 16 },
];

export default function BaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const [result, setResult] = useState<BaseConvResult | null>(null);
  const [error, setError] = useState("");

  const run = useCallback(async (val: string, fb: number) => {
    if (!val.trim()) {
      setResult(null);
      setError("");
      return;
    }
    try {
      setResult(await convertBase(val.toUpperCase(), fb));
      setError("");
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }, []);

  const currentBase = BASES.find((b) => b.base === fromBase);

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          INPUT BASE
        </label>
        <div
          style={{
            display: "inline-flex",
            padding: 2,
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: 5,
            gap: 1,
            alignSelf: "flex-start",
          }}
        >
          {BASES.map((b) => {
            const active = fromBase === b.base;
            return (
              <button
                key={b.base}
                onClick={() => {
                  setFromBase(b.base);
                  run(input, b.base);
                }}
                style={{
                  height: 22,
                  padding: "0 10px",
                  borderRadius: 3,
                  border: "none",
                  background: active ? "var(--color-accent-muted)" : "transparent",
                  color: active
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  letterSpacing: 0.4,
                  cursor: "pointer",
                  transition:
                    "background var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out)",
                }}
              >
                {b.label}
              </button>
            );
          })}
        </div>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            run(e.target.value, fromBase);
          }}
          placeholder={`Enter ${currentBase?.label} value…`}
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: `1px solid ${
              error ? "var(--color-error)" : "var(--color-border)"
            }`,
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            height: 36,
            padding: "0 12px",
            outline: "none",
            letterSpacing: "0.04em",
            boxSizing: "border-box",
            transition: "border-color var(--duration-base) var(--ease-out)",
          }}
          className="selectable"
        />
        {error && (
          <div style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</div>
        )}
      </div>
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {([
            ["BIN", result.binary],
            ["OCT", result.octal],
            ["DEC", result.decimal],
            ["HEX", result.hex],
          ] as [string, string][]).map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  width: 36,
                  flexShrink: 0,
                  letterSpacing: 0.5,
                  fontFamily: "var(--font-mono)",
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
      )}
    </div>
  );
}
