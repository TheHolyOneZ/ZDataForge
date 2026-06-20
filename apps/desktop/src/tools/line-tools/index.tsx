import { useState, useCallback } from "react";
import * as ipc from "../../lib/ipc";

type Mode = "sort" | "sort-desc" | "dedupe" | "reverse" | "number" | "trim" | "filter";

export default function LineTools() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("sort");
  const [filterPattern, setFilterPattern] = useState("");
  const [error, setError] = useState("");

  const run = useCallback(async (val: string, m: Mode, fp: string) => {
    if (!val) {
      setOutput("");
      setError("");
      return;
    }
    try {
      let result = "";
      switch (m) {
        case "sort":
          result = await ipc.sortLines(val, false);
          break;
        case "sort-desc":
          result = await ipc.sortLines(val, true);
          break;
        case "dedupe":
          result = await ipc.deduplicateLines(val, true);
          break;
        case "reverse":
          result = await ipc.reverseLines(val);
          break;
        case "number":
          result = await ipc.numberLines(val, 1);
          break;
        case "trim":
          result = await ipc.trimLines(val, "both");
          break;
        case "filter":
          result = fp ? await ipc.filterLines(val, fp, false) : val;
          break;
      }
      setOutput(result);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const MODES: { value: Mode; label: string }[] = [
    { value: "sort", label: "Sort A→Z" },
    { value: "sort-desc", label: "Sort Z→A" },
    { value: "dedupe", label: "Deduplicate" },
    { value: "reverse", label: "Reverse" },
    { value: "number", label: "Number lines" },
    { value: "trim", label: "Trim whitespace" },
    { value: "filter", label: "Filter (regex)" },
  ];

  const inLines = input.replace(/\r\n/g, "\n").split("\n").length;
  const outLines = output.replace(/\r\n/g, "\n").split("\n").filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => {
                setMode(m.value);
                run(input, m.value, filterPattern);
              }}
              style={{
                background:
                  mode === m.value ? "var(--color-accent-muted)" : "var(--color-elevated)",
                border: `1px solid ${mode === m.value ? "var(--color-accent)" : "var(--color-border)"}`,
                borderRadius: 4,
                color:
                  mode === m.value ? "var(--color-accent)" : "var(--color-text-secondary)",
                fontSize: 12,
                padding: "3px 10px",
                cursor: "pointer",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === "filter" && (
          <input
            value={filterPattern}
            onChange={(e) => {
              setFilterPattern(e.target.value);
              run(input, mode, e.target.value);
            }}
            placeholder="regex pattern…"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              color: "var(--color-text-primary)",
              fontSize: 12,
              padding: "3px 8px",
              outline: "none",
              fontFamily: "var(--font-mono)",
            }}
          />
        )}
        {error && <span style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</span>}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-muted)" }}>
          {inLines} → {outLines} lines
        </span>
      </div>
      <div
        style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}
      >
        {[
          {
            label: "INPUT",
            val: input,
            onChange: (v: string) => {
              setInput(v);
              run(v, mode, filterPattern);
            },
            readOnly: false,
          },
          { label: "OUTPUT", val: output, onChange: () => {}, readOnly: true },
        ].map(({ label, val, onChange, readOnly }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight:
                label === "INPUT" ? "1px solid var(--color-border)" : undefined,
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
            <textarea
              value={val}
              onChange={(e) => onChange(e.target.value)}
              readOnly={readOnly}
              style={{
                flex: 1,
                resize: "none",
                background: "var(--color-panel)",
                border: "none",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: 12,
                outline: "none",
              }}
              placeholder={readOnly ? "Output appears here…" : "Paste lines here…"}
              className="selectable"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
