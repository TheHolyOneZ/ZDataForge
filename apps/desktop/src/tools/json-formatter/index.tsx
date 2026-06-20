import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Editor } from "../../components/editor";
import { formatJson, sortJsonKeys } from "../../lib/ipc";
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
  Segmented,
} from "../../components/tool-bits";
import { Button } from "../../components/button";

const SAMPLE = `{
  "user": { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  "tags": ["admin", "beta"],
  "preferences": { "theme": "dark", "notifications": null },
  "createdAt": "2024-03-15T09:23:01Z"
}`;

type Indent = 2 | 4 | -1 | 0;

function indentValueForApi(i: Indent): number {

  if (i === -1) return 2;
  return i;
}

function parseErrorLocation(err: string): { line?: number; column?: number } {
  const m = err.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (m) return { line: Number(m[1]), column: Number(m[2]) };
  return {};
}

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [indent, setIndent] = useState<Indent>(2);
  const [sortKeys, setSortKeys] = useState(false);

  const run = useCallback(
    async (value: string, ind: Indent, sort: boolean) => {
      if (!value.trim()) {
        setOutput("");
        setError("");
        setElapsed(null);
        return;
      }
      try {
        let working = value;
        let totalElapsed = 0;

        if (sort) {
          const sortRes = await sortJsonKeys(working);
          working = sortRes.output;
          totalElapsed += sortRes.elapsed_ms;
        }

        const formatRes = await formatJson(working, indentValueForApi(ind));
        let finalOutput = formatRes.output;
        totalElapsed += formatRes.elapsed_ms;


        if (ind === -1) {
          finalOutput = finalOutput.replace(/^( {2})+/gm, (m) =>
            "\t".repeat(m.length / 2),
          );
        }

        setOutput(finalOutput);
        setError("");
        setElapsed(totalElapsed);
      } catch (e) {
        setError(String(e));
        setOutput("");
        setElapsed(null);
      }
    },
    [],
  );


  useEffect(() => {
    run(SAMPLE, 2, false);

  }, []);

  const handleInput = useCallback(
    (val: string) => {
      setInput(val);
      run(val, indent, sortKeys);
    },
    [run, indent, sortKeys],
  );

  const handleIndentChange = (v: Indent) => {
    setIndent(v);
    run(input, v, sortKeys);
  };

  const handleSortToggle = () => {
    const next = !sortKeys;
    setSortKeys(next);
    run(input, indent, next);
  };

  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;
  const errLoc = parseErrorLocation(error);
  const isValid = !error && input.trim().length > 0;
  const indentOptions: { value: Indent; label: string }[] = [
    { value: 2, label: "2" },
    { value: 4, label: "4" },
    { value: -1, label: "Tab" },
    { value: 0, label: "Minify" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Toolbar
        left={
          <>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                fontWeight: 600,
              }}
            >
              Indent
            </span>
            <Segmented<Indent>
              value={indent}
              options={indentOptions}
              onChange={handleIndentChange}
              ariaLabel="Indent"
            />
            <ToolbarSeparator />
            <Button
              variant="secondary"
              onClick={handleSortToggle}
              active={sortKeys}
              title="Sort object keys alphabetically"
            >
              Sort keys (A→Z)
            </Button>
          </>
        }
        right={
          <>
            <Button
              variant="primary"
              onClick={() => run(input, indent, sortKeys)}
              disabled={!input.trim()}
            >
              {indent === 0 ? "Minify" : "Format"}
            </Button>
            <ToolbarSeparator />
            <PasteButton onPaste={(t) => { setInput(t); run(t, indent, sortKeys); }} />
            <CopyButton value={output} label="Copy" />
            <ClearButton
              onClick={() => { setInput(""); setOutput(""); setError(""); setElapsed(null); }}
              disabled={!input && !output}
            />
            <SampleButton
              onClick={() => { setInput(SAMPLE); run(SAMPLE, indent, sortKeys); }}
              label="Load Sample"
            />
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
          <PaneHeader label="Input" badge="JSON" bytes={inputBytes} />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <Editor
              value={input}
              onChange={handleInput}
              language="json"
              placeholder="Paste JSON here…"
            />
            {!input && <EmptyHint />}
          </div>
        </div>


        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <PaneHeader
            label="Output"
            badge={indent === 0 ? "MIN" : "JSON"}
            bytes={outputBytes}
          />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {error && (
              <ErrorBanner
                title={errLoc.line ? `Parse error at line ${errLoc.line}, column ${errLoc.column}` : "Parse error"}
                message={error}
              />
            )}
            <div
              style={{
                position: error ? "absolute" : "relative",
                inset: 0,
                opacity: error ? 0.3 : 1,
                overflow: "hidden",
                zIndex: error ? 0 : 1,
              }}
            >
              <Editor
                value={output}
                language="json"
                readOnly
                placeholder="Formatted output appears here…"
              />
            </div>
          </div>
        </div>
      </div>

      <StatusBar
        latencyMs={elapsed ?? undefined}
        inputBytes={inputBytes}
        outputBytes={outputBytes}
        left={
          input.trim() ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {isValid ? (
                <CheckCircle2 size={11} color="var(--color-success)" />
              ) : (
                <XCircle size={11} color="var(--color-error)" />
              )}
              <span style={{ color: isValid ? "var(--color-success)" : "var(--color-error)" }}>
                {isValid ? "Valid" : "Invalid"}
              </span>
            </span>
          ) : undefined
        }
      />
    </div>
  );
}
