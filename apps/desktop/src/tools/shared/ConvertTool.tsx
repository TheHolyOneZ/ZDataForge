import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Editor } from "../../components/editor";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { StatusBar } from "../../components/status-bar";
import {
  CopyButton,
  PasteButton,
  ClearButton,
  SampleButton,
  ErrorBanner,
  EmptyHint,
} from "../../components/tool-bits";

interface ConvertToolProps {
  inputLabel?: string;
  outputLabel?: string;
  inputBadge?: string;
  outputBadge?: string;
  inputLanguage?: "json" | "text";
  outputLanguage?: "json" | "text";
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  sample?: string;
  convert: (input: string) => Promise<{ output: string; elapsed_ms?: number }>;

  toolbarLeft?: ReactNode;

  toolbarRight?: ReactNode;

  emptyHint?: string;

  rerunKey?: unknown;
}

export function ConvertTool({
  inputLabel = "Input",
  outputLabel = "Output",
  inputBadge,
  outputBadge,
  inputLanguage = "text",
  outputLanguage = "json",
  inputPlaceholder = "Paste input here…",
  outputPlaceholder = "Output appears here…",
  sample,
  convert,
  toolbarLeft,
  toolbarRight,
  emptyHint,
  rerunKey,
}: ConvertToolProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);

  const run = useCallback(
    async (val: string) => {
      if (!val.trim()) {
        setOutput("");
        setError("");
        setElapsed(null);
        return;
      }
      try {
        const res = await convert(val);
        setOutput(res.output);
        setError("");
        setElapsed(res.elapsed_ms ?? null);
      } catch (e) {
        setError(String(e));
        setOutput("");
        setElapsed(null);
      }
    },
    [convert],
  );


  useEffect(() => {
    if (input.trim()) run(input);

  }, [rerunKey]);

  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Toolbar
        left={
          <>
            {toolbarLeft}
            {toolbarLeft && (toolbarRight || sample || true) && <ToolbarSeparator />}
          </>
        }
        right={
          <>
            {toolbarRight}
            {toolbarRight && <ToolbarSeparator />}
            <PasteButton onPaste={(t) => { setInput(t); run(t); }} />
            <CopyButton value={output} label="Copy" />
            <ClearButton
              onClick={() => { setInput(""); setOutput(""); setError(""); setElapsed(null); }}
              disabled={!input && !output}
            />
            {sample && (
              <SampleButton
                onClick={() => {
                  setInput(sample);
                  run(sample);
                }}
                label="Load Sample"
              />
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader label={inputLabel} badge={inputBadge} bytes={inputBytes} />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <Editor
              value={input}
              onChange={(v) => {
                setInput(v);
                run(v);
              }}
              language={inputLanguage}
              placeholder={inputPlaceholder}
            />
            {!input && <EmptyHint text={emptyHint ?? "Paste content"} />}
          </div>
        </div>


        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <PaneHeader label={outputLabel} badge={outputBadge} bytes={outputBytes} />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {error && <ErrorBanner message={error} />}
            <div
              style={{
                position: error ? "absolute" : "relative",
                inset: 0,
                opacity: error ? 0.3 : 1,
                transition: "opacity var(--duration-base) var(--ease-out)",
                overflow: "hidden",
                zIndex: error ? 0 : 1,
              }}
            >
              <Editor
                value={output}
                language={outputLanguage}
                readOnly
                placeholder={outputPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>

      <StatusBar
        latencyMs={elapsed ?? undefined}
        inputBytes={inputBytes}
        outputBytes={outputBytes}
      />
    </div>
  );
}
