import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface DirectionToggleProps {
  leftLabel: string;
  rightLabel: string;

  reversed: boolean;
  onToggle: () => void;
}


export function DirectionToggle({
  leftLabel,
  rightLabel,
  reversed,
  onToggle,
}: DirectionToggleProps) {
  const [hover, setHover] = useState(false);
  const pill: React.CSSProperties = {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    padding: "3px 8px",
    borderRadius: 3,
    background: "var(--color-elevated)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontWeight: 600,
  };
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Click to flip direction"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 28,
        padding: "0 8px",
        background: hover ? "var(--color-elevated)" : "transparent",
        border: `1px solid ${hover ? "var(--color-border-strong)" : "var(--color-border)"}`,
        borderRadius: 5,
        cursor: "pointer",
        transition:
          "background var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)",
      }}
    >
      <span style={pill}>{leftLabel}</span>
      <ArrowRight
        size={14}
        color="var(--color-accent)"
        style={{
          transform: reversed ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform var(--duration-base) var(--ease-out)",
        }}
      />
      <span style={pill}>{rightLabel}</span>
    </button>
  );
}
