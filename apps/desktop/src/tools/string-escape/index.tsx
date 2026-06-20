import { useState, useCallback } from "react";
import { escapeString, unescapeString } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { Segmented } from "../../components/tool-bits";

type Mode = "json" | "html" | "shell" | "url";
type Dir = "escape" | "unescape";

export default function StringEscape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("json");
  const [dir, setDir] = useState<Dir>("escape");

  const run = useCallback(async (val: string, m: Mode, d: Dir) => {
    if (!val) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const result =
        d === "escape" ? await escapeString(val, m) : await unescapeString(val, m);
      setOutput(result);
      setError("");
    } catch (e) {
      setError(String(e));
      setOutput("");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Toolbar
        left={
          <>
            <Segmented<Mode>
              value={mode}
              options={[
                { value: "json", label: "JSON" },
                { value: "html", label: "HTML" },
                { value: "shell", label: "SHELL" },
                { value: "url", label: "URL" },
              ]}
              onChange={(m) => {
                setMode(m);
                run(input, m, dir);
              }}
              ariaLabel="Mode"
            />
            <ToolbarSeparator />
            <Segmented<Dir>
              value={dir}
              options={[
                { value: "escape", label: "Escape" },
                { value: "unescape", label: "Unescape" },
              ]}
              onChange={(d) => {
                setDir(d);
                run(input, mode, d);
              }}
              ariaLabel="Direction"
            />
            {error && (
              <>
                <ToolbarSeparator />
                <span style={{ fontSize: 12, color: "var(--color-error)" }}>
                  {error}
                </span>
              </>
            )}
          </>
        }
      />
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {[
          { label: "INPUT", val: input, ro: false },
          { label: "OUTPUT", val: output, ro: true },
        ].map(({ label, val, ro }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight:
                label === "INPUT" ? "1px solid var(--color-border)" : undefined,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <PaneHeader label={label} bytes={new Blob([val]).size} />
            <textarea
              value={val}
              onChange={(e) => {
                if (!ro) {
                  setInput(e.target.value);
                  run(e.target.value, mode, dir);
                }
              }}
              readOnly={ro}
              style={{
                flex: 1,
                resize: "none",
                background: "var(--color-bg)",
                border: "none",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                lineHeight: 1.55,
                padding: 12,
                outline: "none",
              }}
              placeholder={ro ? "Escaped/unescaped output…" : "Paste text here…"}
              className="selectable"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
