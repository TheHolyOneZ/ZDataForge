import { useState, useEffect } from "react";
import { countText, type TextStats } from "../../lib/ipc";

export default function TextCounter() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<TextStats | null>(null);

  useEffect(() => {
    countText(input)
      .then(setStats)
      .catch(() => {});
  }, [input]);

  const rows: { label: string; value: string }[] = stats
    ? [
        { label: "Characters", value: stats.chars.toLocaleString() },
        {
          label: "Characters (no space)",
          value: stats.chars_no_space.toLocaleString(),
        },
        { label: "Words", value: stats.words.toLocaleString() },
        { label: "Lines", value: stats.lines.toLocaleString() },
        { label: "Bytes (UTF-8)", value: stats.bytes.toLocaleString() },
        {
          label: "Reading time",
          value:
            stats.reading_time_sec < 60
              ? `${stats.reading_time_sec}s`
              : `${Math.round(stats.reading_time_sec / 60)}m`,
        },
      ]
    : [];

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
          flex: "1 1 60%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text to count…"
          style={{
            flex: 1,
            width: "100%",
            resize: "none",
            background: "var(--color-bg)",
            border: "none",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.55,
            padding: 16,
            outline: "none",
            boxSizing: "border-box",
          }}
          className="selectable"
        />
      </div>
      <div
        style={{
          flex: "1 1 40%",
          minHeight: 0,
          overflow: "auto",
          background: "var(--color-panel)",
        }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
