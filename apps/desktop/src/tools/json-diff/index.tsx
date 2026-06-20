import { useState, useCallback, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Editor } from "../../components/editor";
import { jsonDiff, type JsonDiffLine } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { StatusBar } from "../../components/status-bar";
import {
  PasteButton,
  ClearButton,
  SampleButton,
  ErrorBanner,
  EmptyHint,
} from "../../components/tool-bits";
import { Button } from "../../components/button";

const SAMPLE_LEFT = `{
  "user": { "id": 42, "name": "Alice Chen", "verified": true },
  "tags": ["admin", "beta"],
  "theme": "dark"
}`;

const SAMPLE_RIGHT = `{
  "user": { "id": 42, "name": "Alice Chen", "verified": false, "role": "owner" },
  "tags": ["admin"],
  "theme": "dark"
}`;

export default function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<JsonDiffLine[]>([]);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);

  const run = useCallback(async (l: string, r: string) => {
    if (!l.trim() || !r.trim()) {
      setDiff([]);
      setError("");
      setElapsed(null);
      return;
    }
    try {
      const res = await jsonDiff(l, r);
      setDiff(res.diff);
      setError("");
      setElapsed(res.elapsed_ms);
    } catch (e) {
      setError(String(e));
      setElapsed(null);
    }
  }, []);

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
    run(right, left);
  };

  const loadSample = () => {
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
    run(SAMPLE_LEFT, SAMPLE_RIGHT);
  };

  const clearAll = () => {
    setLeft("");
    setRight("");
    setDiff([]);
    setError("");
    setElapsed(null);
  };

  const counts = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    for (const d of diff) {
      if (d.kind === "added") added++;
      else if (d.kind === "removed") removed++;
      else unchanged++;
    }
    return { added, removed, unchanged };
  }, [diff]);

  const leftBytes = new Blob([left]).size;
  const rightBytes = new Blob([right]).size;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Toolbar
        left={
          <span
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Original</span>
            <ArrowLeftRight size={12} />
            <span>Changed</span>
          </span>
        }
        right={
          <>
            <Button
              variant="secondary"
              onClick={handleSwap}
              disabled={!left && !right}
              icon={<ArrowLeftRight size={13} />}
            >
              Swap
            </Button>
            <ToolbarSeparator />
            <ClearButton onClick={clearAll} disabled={!left && !right} />
            <SampleButton onClick={loadSample} label="Load Sample" />
          </>
        }
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
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
          <PaneHeader
            label="Original"
            badge="JSON"
            bytes={leftBytes}
            right={
              <PasteButton
                onPaste={(t) => {
                  setLeft(t);
                  run(t, right);
                }}
              />
            }
          />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <Editor
              value={left}
              onChange={(v) => {
                setLeft(v);
                run(v, right);
              }}
              language="json"
              placeholder="Original JSON…"
            />
            {!left && <EmptyHint />}
          </div>
        </div>


        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader
            label="Changed"
            badge="JSON"
            bytes={rightBytes}
            right={
              <PasteButton
                onPaste={(t) => {
                  setRight(t);
                  run(left, t);
                }}
              />
            }
          />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <Editor
              value={right}
              onChange={(v) => {
                setRight(v);
                run(left, v);
              }}
              language="json"
              placeholder="Modified JSON…"
            />
            {!right && <EmptyHint />}
          </div>
        </div>


        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <PaneHeader
            label="Diff"
            right={
              diff.length > 0 ? (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                    display: "inline-flex",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "var(--color-success)" }}>+{counts.added}</span>
                  <span style={{ color: "var(--color-error)" }}>-{counts.removed}</span>
                  <span>{counts.unchanged}=</span>
                </span>
              ) : undefined
            }
          />
          <div
            style={{
              flex: 1,
              overflow: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              lineHeight: 1.55,
              position: "relative",
            }}
            className="selectable"
          >
            {error && <ErrorBanner message={error} />}
            {!error && diff.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--color-text-muted)",
                  fontSize: 12,
                }}
              >
                Paste JSON in both panes to diff
              </div>
            )}
            {diff.map((line, i) => (
              <DiffRow key={i} line={line} index={i + 1} />
            ))}
          </div>
        </div>
      </div>

      <StatusBar
        latencyMs={elapsed ?? undefined}
        inputBytes={leftBytes + rightBytes}
        outputBytes={undefined}
        right={
          diff.length > 0 ? (
            <span style={{ color: "var(--color-text-muted)" }}>
              <span style={{ color: "var(--color-success)" }}>{counts.added} added</span>
              {" · "}
              <span style={{ color: "var(--color-error)" }}>{counts.removed} removed</span>
              {" · "}
              {counts.unchanged} unchanged
            </span>
          ) : undefined
        }
      />
    </div>
  );
}

function DiffRow({ line, index }: { line: JsonDiffLine; index: number }) {
  const isAdded = line.kind === "added";
  const isRemoved = line.kind === "removed";

  let bg = "transparent";
  let bar = "transparent";
  let color: string = "var(--color-text-secondary)";
  let prefix = " ";
  if (isAdded) {
    bg = "rgba(34,211,107,0.06)";
    bar = "var(--color-success)";
    color = "var(--color-text-primary)";
    prefix = "+";
  } else if (isRemoved) {
    bg = "rgba(255,75,75,0.06)";
    bar = "var(--color-error)";
    color = "var(--color-text-primary)";
    prefix = "-";
  } else {
    color = "var(--color-text-muted)";
  }

  return (
    <div
      style={{
        display: "flex",
        background: bg,
        borderLeft: `3px solid ${bar}`,
        padding: "2px 0",
        minHeight: 19,
      }}
    >
      <span
        style={{
          width: 36,
          flexShrink: 0,
          textAlign: "right",
          padding: "0 8px 0 4px",
          color: "var(--color-text-muted)",
          fontSize: 10.5,
          userSelect: "none",
        }}
      >
        {index}
      </span>
      <span
        style={{
          width: 16,
          flexShrink: 0,
          textAlign: "center",
          color: isAdded
            ? "var(--color-success)"
            : isRemoved
              ? "var(--color-error)"
              : "var(--color-text-muted)",
          userSelect: "none",
        }}
      >
        {prefix}
      </span>
      <span
        style={{
          flex: 1,
          color,
          whiteSpace: "pre",
          paddingRight: 8,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {line.content}
      </span>
    </div>
  );
}
