import type { CSSProperties, ReactNode } from "react";

interface StatusBarProps {
  latencyMs?: number | null;
  inputBytes?: number;
  outputBytes?: number;

  right?: ReactNode;

  left?: ReactNode;
  style?: CSSProperties;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function latencyColor(ms: number): string {
  if (ms < 5) return "var(--color-success)";
  if (ms < 50) return "var(--color-warning)";
  return "var(--color-error)";
}

export function StatusBar({
  latencyMs,
  inputBytes,
  outputBytes,
  right,
  left,
  style,
}: StatusBarProps) {
  const hasLatency = latencyMs != null;
  const hasBytes = (inputBytes ?? 0) > 0 || (outputBytes ?? 0) > 0;
  if (!hasLatency && !hasBytes && !right && !left) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 24,
        padding: "0 12px",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-panel)",
        flexShrink: 0,
        fontSize: 11,
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-mono)",
        ...style,
      }}
    >
      {left}
      {hasLatency && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: latencyColor(latencyMs!),
            }}
          />
          {latencyMs!.toFixed(2)} ms
        </span>
      )}
      <span style={{ flex: 1 }} />
      {hasBytes && (
        <span style={{ color: "var(--color-text-muted)" }}>
          {(inputBytes ?? 0) > 0 ? `${formatBytes(inputBytes!)} in` : ""}
          {(inputBytes ?? 0) > 0 && (outputBytes ?? 0) > 0 ? " · " : ""}
          {(outputBytes ?? 0) > 0 ? `${formatBytes(outputBytes!)} out` : ""}
        </span>
      )}
      {right}
    </div>
  );
}
