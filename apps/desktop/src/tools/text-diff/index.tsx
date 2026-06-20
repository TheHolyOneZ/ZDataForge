import { useState, useCallback } from "react";
import { textDiff, type DiffLine } from "../../lib/ipc";
import { PaneHeader } from "../../components/pane-header";

export default function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<DiffLine[]>([]);

  const run = useCallback(async (l: string, r: string) => {
    if (!l || !r) {
      setDiff([]);
      return;
    }
    try {
      setDiff(await textDiff(l, r));
    } catch {

    }
  }, []);

  const added = diff.filter((d) => d.kind === "added").length;
  const removed = diff.filter((d) => d.kind === "removed").length;

  const panes: { label: string; val: string; onChange: (v: string) => void }[] = [
    {
      label: "LEFT (original)",
      val: left,
      onChange: (v) => {
        setLeft(v);
        run(v, right);
      },
    },
    {
      label: "RIGHT (changed)",
      val: right,
      onChange: (v) => {
        setRight(v);
        run(left, v);
      },
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          padding: "0 16px",
          height: 28,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          flexShrink: 0,
          fontFamily: "var(--font-mono)",
        }}
      >
        {diff.length > 0 ? (
          <span style={{ display: "inline-flex", gap: 10 }}>
            <span style={{ color: "var(--color-success)" }}>+{added}</span>
            <span style={{ color: "var(--color-error)" }}>-{removed}</span>
          </span>
        ) : (
          <span>Paste text in both panes</span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.2fr",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {panes.map(({ label, val, onChange }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--color-border)",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <PaneHeader label={label} bytes={new Blob([val]).size} />
            <textarea
              value={val}
              onChange={(e) => onChange(e.target.value)}
              style={{
                flex: 1,
                resize: "none",
                background: "var(--color-bg)",
                border: "none",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                lineHeight: 1.55,
                padding: 12,
                outline: "none",
              }}
              className="selectable"
            />
          </div>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader label="DIFF" />
          <div
            style={{
              flex: 1,
              overflow: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              lineHeight: 1.6,
            }}
            className="selectable"
          >
            {diff.map((line, i) => {
              const isAdded = line.kind === "added";
              const isRemoved = line.kind === "removed";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    background: isAdded
                      ? "rgba(34, 211, 107, 0.06)"
                      : isRemoved
                        ? "rgba(255, 75, 75, 0.06)"
                        : "transparent",
                    borderLeft: `3px solid ${
                      isAdded
                        ? "var(--color-success)"
                        : isRemoved
                          ? "var(--color-error)"
                          : "transparent"
                    }`,
                    padding: "1px 12px",
                    whiteSpace: "pre",
                    color: isAdded
                      ? "var(--color-text-primary)"
                      : isRemoved
                        ? "var(--color-text-primary)"
                        : "var(--color-text-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      flexShrink: 0,
                      color: isAdded
                        ? "var(--color-success)"
                        : isRemoved
                          ? "var(--color-error)"
                          : "var(--color-text-muted)",
                    }}
                  >
                    {isAdded ? "+" : isRemoved ? "-" : " "}
                  </span>
                  {line.content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
