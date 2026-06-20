import { useState, useEffect } from "react";
import { parseDuration, type DurationInfo } from "../../lib/ipc";

const EXAMPLES = ["2h 30m", "1d 4h 15m 30s", "3600", "90m", "1d"];

export default function DurationParser() {
  const [input, setInput] = useState("2h 30m");
  const [result, setResult] = useState<DurationInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input.trim()) { setResult(null); setError(""); return; }
    parseDuration(input).then(r => { setResult(r); setError(""); }).catch(e => { setError(String(e)); setResult(null); });
  }, [input]);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {EXAMPLES.map(e => <button key={e} onClick={() => setInput(e)} style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: 4, color: "var(--color-text-muted)", fontSize: 12, padding: "3px 10px", cursor: "pointer" }}>{e}</button>)}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)}
        placeholder="e.g. 1h 30m 45s or 3600"
        style={{ background: "var(--color-elevated)", border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`, borderRadius: "var(--radius-md)", color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", fontSize: 16, padding: "10px 14px", outline: "none" }}
        className="selectable"
      />
      {error && <div style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</div>}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Human", result.human],
            ["ISO 8601", result.iso8601],
            ["Total seconds", String(result.total_seconds)],
            ["Breakdown", `${result.breakdown.days}d ${result.breakdown.hours}h ${result.breakdown.minutes}m ${result.breakdown.seconds}s`],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-border)", gap: 16 }}>
              <span style={{ width: 120, fontSize: 12, color: "var(--color-text-muted)", flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-text-primary)" }} className="selectable">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
