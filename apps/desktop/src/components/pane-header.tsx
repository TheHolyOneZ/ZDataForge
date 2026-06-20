import type { CSSProperties, ReactNode } from "react";

interface PaneHeaderProps {
  label: string;
  badge?: string;

  bytes?: number;

  right?: ReactNode;
  style?: CSSProperties;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function PaneHeader({ label, badge, bytes, right, style }: PaneHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 28,
        padding: "0 12px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-panel)",
        flexShrink: 0,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "var(--color-text-primary)",
          fontWeight: 500,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            color: "var(--color-text-secondary)",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: 3,
            padding: "1px 6px",
            fontFamily: "var(--font-mono)",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {badge}
        </span>
      )}
      <span style={{ flex: 1 }} />
      {bytes != null && bytes > 0 && (
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {formatBytes(bytes)}
        </span>
      )}
      {right}
    </div>
  );
}
