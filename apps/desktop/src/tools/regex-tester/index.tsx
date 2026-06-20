import { useState, useCallback, useEffect } from "react";
import { testRegex, type RegexMatch } from "../../lib/ipc";

const FLAGS = ["i", "m", "s", "x"] as const;
const FLAG_LABELS: Record<string, string> = {
  i: "Case insensitive",
  m: "Multiline",
  s: "Dot matches newline",
  x: "Extended",
};

const COMMON_PATTERNS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "UUID", pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" },
  { label: "Hex color", pattern: "#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b" },
  { label: "ISO date", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])" },
  { label: "Digits only", pattern: "\\d+" },
  { label: "Words", pattern: "\\b\\w+\\b" },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = useState<string[]>(["i"]);
  const [input, setInput] = useState(
    "Contact us at hello@zdataforge.app or support@example.com",
  );
  const [replacement, setReplacement] = useState("");
  const [result, setResult] = useState<{
    matches: RegexMatch[];
    replaced: string | null;
    elapsed_ms: number;
  } | null>(null);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    if (!pattern.trim()) {
      setResult(null);
      setError("");
      return;
    }
    try {
      const res = await testRegex(pattern, flags.join(""), input, replacement || undefined);
      setResult(res);
      setError("");
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }, [pattern, flags, input, replacement]);

  useEffect(() => {
    run();
  }, [run]);

  function toggleFlag(f: string) {
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function renderHighlighted() {
    if (!result || result.matches.length === 0) return input;
    let last = 0;
    const segments: { text: string; match: boolean }[] = [];
    for (const m of result.matches) {
      if (m.start > last) segments.push({ text: input.slice(last, m.start), match: false });
      segments.push({ text: input.slice(m.start, m.end), match: true });
      last = m.end;
    }
    if (last < input.length) segments.push({ text: input.slice(last), match: false });
    return segments.map((seg, i) => (
      <span
        key={i}
        style={
          seg.match
            ? {
                background: "var(--color-accent-muted)",
                color: "var(--color-accent)",
                borderRadius: 2,
                padding: "0 2px",
              }
            : undefined
        }
      >
        {seg.text}
      </span>
    ));
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
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            /
          </span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="regex pattern…"
            style={{
              flex: 1,
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              padding: "5px 10px",
              outline: "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            /{flags.join("")}
          </span>
          {error && (
            <span style={{ color: "var(--color-error)", fontSize: 12 }}>⚠ {error}</span>
          )}
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {FLAGS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                title={FLAG_LABELS[f]}
                style={{
                  background: flags.includes(f)
                    ? "var(--color-accent-muted)"
                    : "var(--color-elevated)",
                  border: `1px solid ${flags.includes(f) ? "var(--color-accent)" : "var(--color-border)"}`,
                  borderRadius: 4,
                  color: flags.includes(f) ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontSize: 12,
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COMMON_PATTERNS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPattern(p.pattern)}
                style={{
                  background: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
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
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>TEST STRING</span>
            {result && (
              <span style={{ color: "var(--color-accent)" }}>
                {result.matches.length} match{result.matches.length !== 1 ? "es" : ""} ·{" "}
                {result.elapsed_ms.toFixed(2)} ms
              </span>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              resize: "none",
              background: "var(--color-panel)",
              border: "none",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              padding: 12,
              outline: "none",
              lineHeight: 1.6,
            }}
            placeholder="Paste text to match against…"
            className="selectable"
          />
          {result && result.matches.length > 0 && (
            <div
              style={{
                padding: "6px 12px",
                borderTop: "1px solid var(--color-border)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                background: "var(--color-bg)",
                whiteSpace: "pre-wrap",
                overflowY: "auto",
                maxHeight: 100,
              }}
              className="selectable"
            >
              {renderHighlighted()}
            </div>
          )}
        </div>


        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{ fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}
            >
              REPLACE
            </span>
            <input
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="replacement (leave blank to skip)…"
              style={{
                flex: 1,
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "3px 8px",
                outline: "none",
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {result?.replaced != null && (
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--color-border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-wrap",
                  background: "var(--color-bg)",
                }}
                className="selectable"
              >
                <div
                  style={{ fontSize: 10, color: "var(--color-text-muted)", marginBottom: 4 }}
                >
                  RESULT
                </div>
                {result.replaced}
              </div>
            )}
            <div style={{ padding: "0 12px" }}>
              <div
                style={{ fontSize: 10, color: "var(--color-text-muted)", padding: "8px 0 4px" }}
              >
                MATCHES
              </div>
              {result?.matches.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: 10,
                        flexShrink: 0,
                      }}
                    >
                      #{i + 1} [{m.start}:{m.end}]
                    </span>
                    <span
                      style={{
                        color: "var(--color-accent)",
                        background: "var(--color-accent-muted)",
                        borderRadius: 2,
                        padding: "0 4px",
                      }}
                      className="selectable"
                    >
                      {m.text}
                    </span>
                  </div>
                  {m.groups.length > 0 && (
                    <div
                      style={{
                        marginTop: 3,
                        paddingLeft: 8,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {m.groups.map((g, gi) => (
                        <span
                          key={gi}
                          style={{ fontSize: 11, color: "var(--color-text-secondary)" }}
                        >
                          <span style={{ color: "var(--color-text-muted)" }}>
                            group {gi + 1}:
                          </span>{" "}
                          {g ?? (
                            <span
                              style={{
                                color: "var(--color-text-muted)",
                                fontStyle: "italic",
                              }}
                            >
                              undefined
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {result && result.matches.length === 0 && !error && (
                <div style={{ padding: "12px 0", color: "var(--color-text-muted)", fontSize: 12 }}>
                  No matches
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
