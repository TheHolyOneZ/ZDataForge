import type { CSSProperties, ReactNode } from "react";

interface ToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
}


export function ToolbarSeparator({ style }: { style?: CSSProperties } = {}) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 1,
        height: 18,
        background: "var(--color-border)",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}


export function Toolbar({ left, right, style }: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 40,
        padding: "0 12px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-panel)",
        flexShrink: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        {left}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {right}
      </div>
    </div>
  );
}
