import { useState, useCallback, type CSSProperties, type ReactNode } from "react";
import {
  Copy,
  ClipboardPaste,
  Trash2,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "./button";
import { modKey } from "../lib/platform";

const ICON_SIZE = 13;


export function CopyButton({
  value,
  label = "Copy",
  disabled,
  variant = "secondary",
}: {
  value: string;
  label?: string;
  disabled?: boolean;
  variant?: "secondary" | "primary" | "ghost";
}) {
  const [copied, setCopied] = useState(false);
  const onClick = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {

    }
  }, [value]);
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || !value}
      icon={
        copied ? (
          <Check size={ICON_SIZE} color="var(--color-success)" />
        ) : (
          <Copy size={ICON_SIZE} />
        )
      }
      style={
        copied
          ? { color: "var(--color-success)", borderColor: "var(--color-border-strong)" }
          : undefined
      }
    >
      {copied ? "Copied" : label}
    </Button>
  );
}


export function PasteButton({
  onPaste,
  label = "Paste",
}: {
  onPaste: (text: string) => void;
  label?: string;
}) {
  const onClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onPaste(text);
    } catch {

    }
  }, [onPaste]);
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      icon={<ClipboardPaste size={ICON_SIZE} />}
    >
      {label}
    </Button>
  );
}

export function ClearButton({
  onClick,
  disabled,
  label = "Clear",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      icon={<Trash2 size={ICON_SIZE} />}
    >
      {label}
    </Button>
  );
}

export function SampleButton({
  onClick,
  label = "Sample",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      icon={<FileText size={ICON_SIZE} />}
    >
      {label}
    </Button>
  );
}


export function ErrorBanner({
  title = "Parse error",
  message,
  style,
}: {
  title?: string;
  message: string;
  style?: CSSProperties;
}) {
  return (
    <div
      role="alert"
      style={{
        background: "rgba(255,75,75,0.08)",
        border: "1px solid rgba(255,75,75,0.25)",
        borderRadius: 6,
        padding: 12,
        margin: 12,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        color: "var(--color-text-primary)",
        ...style,
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--color-error)", marginBottom: 4 }}>
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-secondary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message}
      </div>
    </div>
  );
}


export function EmptyHint({
  text = "Paste JSON",
  keyCap = modKey("V"),
  children,
}: {
  text?: string;
  keyCap?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        color: "var(--color-text-muted)",
        fontSize: 12,
        gap: 6,
      }}
    >
      {children ?? (
        <>
          <span>{text} or press</span>
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "1px 6px",
              borderRadius: 3,
              border: "1px solid var(--color-border-strong)",
              background: "var(--color-elevated)",
              color: "var(--color-text-secondary)",
            }}
          >
            {keyCap}
          </kbd>
        </>
      )}
    </div>
  );
}


export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        height: 28,
        padding: 2,
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: 5,
        gap: 1,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            role="radio"
            aria-checked={active}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            style={{
              height: 22,
              padding: "0 8px",
              borderRadius: 3,
              border: "none",
              background: active ? "var(--color-accent-muted)" : "transparent",
              color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              cursor: "pointer",
              transition:
                "background var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export { ICON_SIZE };
