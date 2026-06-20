import { useState, useEffect } from "react";
import { generateSlug } from "../../lib/ipc";
import { CopyButton } from "../../components/tool-bits";
import { Segmented } from "../../components/tool-bits";

export default function SlugGenerator() {
  const [input, setInput] = useState("Hello World! This is a Test");
  const [separator, setSeparator] = useState("-");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    generateSlug(input, separator)
      .then(setOutput)
      .catch(() => {});
  }, [input, separator]);

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to slugify…"
        style={{
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text-primary)",
          fontSize: 13,
          height: 32,
          padding: "0 12px",
          outline: "none",
          fontFamily: "var(--font-sans)",
        }}
        className="selectable"
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Separator:
        </label>
        <Segmented
          value={separator}
          options={[
            { value: "-", label: "-" },
            { value: "_", label: "_" },
            { value: ".", label: "." },
          ]}
          onChange={setSeparator}
          ariaLabel="Separator"
        />
      </div>
      {output && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--color-text-primary)",
              wordBreak: "break-all",
            }}
            className="selectable"
          >
            {output}
          </span>
          <CopyButton value={output} variant="ghost" />
        </div>
      )}
    </div>
  );
}
