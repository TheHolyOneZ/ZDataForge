import { useState, useEffect } from "react";
import { parseCron, type CronResult } from "../../lib/ipc";
import { Clock } from "lucide-react";

const EXAMPLES = [
  { expr: "0 9 * * 1-5", label: "Weekdays at 9am" },
  { expr: "*/5 * * * *", label: "Every 5 minutes" },
  { expr: "0 0 1 * *", label: "Monthly at midnight" },
  { expr: "0 12 * * 0", label: "Sundays at noon" },
];

export default function CronParser() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [result, setResult] = useState<CronResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!expr.trim()) {
      setResult(null);
      setError("");
      return;
    }
    parseCron(expr)
      .then((r) => {
        setResult(r);
        setError("");
      })
      .catch((e) => {
        setError(String(e));
        setResult(null);
      });
  }, [expr]);

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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.expr}
            onClick={() => setExpr(e.expr)}
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              color: "var(--color-text-secondary)",
              fontSize: 12,
              padding: "3px 10px",
              cursor: "pointer",
            }}
          >
            {e.label}
          </button>
        ))}
      </div>
      <div style={{ fontFamily: "var(--font-mono)" }}>
        <div
          style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 6 }}
        >
          CRON EXPRESSION (min hour dom mon dow)
        </div>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontSize: 16,
            padding: "10px 14px",
            outline: "none",
            letterSpacing: "0.05em",
            boxSizing: "border-box",
          }}
          className="selectable"
        />
        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-error)" }}>{error}</div>
        )}
      </div>
      {result && (
        <>
          <div
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: 14,
              color: "var(--color-text-secondary)",
            }}
          >
            {result.description}
          </div>
          <div>
            <div
              style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}
            >
              NEXT 10 FIRINGS
            </div>
            {result.next_firings.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <Clock size={12} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
