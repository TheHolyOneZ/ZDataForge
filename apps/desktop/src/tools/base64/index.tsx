import { useState, useCallback } from "react";
import { base64Encode, base64Decode } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { Segmented } from "../../components/tool-bits";
import { StatusBar } from "../../components/status-bar";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);

  const run = useCallback(async (val: string, m: Mode, u: boolean) => {
    if (!val) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const result =
        m === "encode" ? await base64Encode(val, u) : await base64Decode(val, u);
      setOutput(result);
      setError("");
    } catch (e) {
      setError(String(e));
      setOutput("");
    }
  }, []);

  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;

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
                { value: "encode", label: "Encode" },
                { value: "decode", label: "Decode" },
              ]}
              onChange={(m) => {
                setMode(m);
                run(input, m, urlSafe);
              }}
              ariaLabel="Mode"
            />
            <ToolbarSeparator />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => {
                  setUrlSafe(e.target.checked);
                  run(input, mode, e.target.checked);
                }}
                style={{ accentColor: "var(--color-accent)" }}
              />
              URL-safe
            </label>
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
            <PaneHeader
              label={label}
              bytes={label === "INPUT" ? inputBytes : outputBytes}
            />
            <textarea
              value={val}
              onChange={(e) => {
                if (!ro) {
                  setInput(e.target.value);
                  run(e.target.value, mode, urlSafe);
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
              placeholder={
                ro
                  ? "Output appears here…"
                  : mode === "encode"
                    ? "Plain text to encode…"
                    : "Base64 string to decode…"
              }
              className="selectable"
            />
          </div>
        ))}
      </div>
      <StatusBar inputBytes={inputBytes} outputBytes={outputBytes} />
    </div>
  );
}
