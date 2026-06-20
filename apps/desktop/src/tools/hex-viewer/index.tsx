import { useState, useCallback, useEffect } from "react";
import { hexDump, type HexDumpLine } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { Segmented } from "../../components/tool-bits";

const SAMPLE =
  "Hello, ZDataForge! This is a hex dump example.\n\x00\x01\x02\x03\x7F\xFF";

export default function HexViewer() {
  const [input, setInput] = useState(SAMPLE);
  const [dump, setDump] = useState<HexDumpLine[]>([]);
  const [bytesPerRow, setBytesPerRow] = useState<8 | 16 | 32>(16);

  const run = useCallback(async (val: string, bpr: number) => {
    hexDump(val, bpr)
      .then(setDump)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    run(SAMPLE, 16);
  }, [run]);

  const bytes = new Blob([input]).size;

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
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                fontWeight: 600,
              }}
            >
              Bytes/row
            </span>
            <Segmented<8 | 16 | 32>
              value={bytesPerRow}
              options={[
                { value: 8, label: "8" },
                { value: 16, label: "16" },
                { value: 32, label: "32" },
              ]}
              onChange={(v) => {
                setBytesPerRow(v);
                run(input, v);
              }}
              ariaLabel="Bytes per row"
            />
            <ToolbarSeparator />
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {dump.length * bytesPerRow} bytes shown
            </span>
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
          <PaneHeader label="INPUT" bytes={bytes} />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              run(e.target.value, bytesPerRow);
            }}
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
            placeholder="Paste text to view as hex dump…"
            className="selectable"
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader label="HEX DUMP" />
          <div
            style={{
              flex: 1,
              overflow: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              lineHeight: 1.7,
              padding: "8px 0",
            }}
            className="selectable"
          >
            {dump.map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "0 12px",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    flexShrink: 0,
                    minWidth: 64,
                  }}
                >
                  {line.offset}
                </span>
                <span
                  style={{
                    color: "var(--color-text-primary)",
                    flex: 1,
                    letterSpacing: 0.2,
                  }}
                >
                  {line.hex_bytes.join(" ")}
                  {line.hex_bytes.length < bytesPerRow &&
                    " ".repeat((bytesPerRow - line.hex_bytes.length) * 3)}
                </span>
                <span
                  style={{
                    color: "var(--color-accent)",
                    flexShrink: 0,
                  }}
                >
                  {line.ascii}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
