import { X } from "lucide-react";
import { modKey, GLOBAL_HOTKEY_DISPLAY } from "../lib/platform";

interface ShortcutsOverlayProps {
  onClose: () => void;
}

const shortcuts: { keys: string; description: string }[] = [
  { keys: GLOBAL_HOTKEY_DISPLAY, description: "Open ZDataForge (global hotkey)" },
  { keys: modKey("K"), description: "Open command palette" },
  { keys: modKey("W"), description: "Close current tool" },
  { keys: modKey(","), description: "Open Settings" },
  { keys: "Escape", description: "Close palette / dismiss modal" },
  { keys: "\u2191 \u2193", description: "Navigate palette results" },
  { keys: "Enter", description: "Select tool" },
  { keys: "?", description: "Show this overlay" },
];

export function ShortcutsOverlay({ onClose }: ShortcutsOverlayProps) {
  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Keyboard Shortcuts
          </span>
          <button
            onClick={onClose}
            aria-label="Close shortcuts overlay"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>


        <div style={{ padding: "8px 0 16px" }}>
          {shortcuts.map(({ keys, description }) => (
            <div
              key={keys}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 20px",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  flex: 1,
                }}
              >
                {description}
              </span>
              <kbd
                style={{
                  fontSize: 11,
                  color: "var(--color-text-primary)",
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-border-strong)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {keys}
              </kbd>
            </div>
          ))}
        </div>


        <div
          style={{
            padding: "10px 20px",
            borderTop: "1px solid var(--color-border)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            textAlign: "center",
          }}
        >
          Press <kbd style={{ fontSize: 10, padding: "1px 5px", border: "1px solid var(--color-border)", borderRadius: 4 }}>Escape</kbd> or click outside to close
        </div>
      </div>
    </div>
  );
}
