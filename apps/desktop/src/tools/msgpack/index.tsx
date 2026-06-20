import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { msgpackToJson, jsonToMsgpack } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { Button } from "../../components/button";
import { Segmented } from "../../components/tool-bits";

const SAMPLE_JSON = `{
  "name": "ZDataForge",
  "version": 7,
  "active": true,
  "tags": ["rust", "tauri", "react"]
}`;


const SAMPLE_MSGPACK_HEX =
  "84a46e616d65ab5a44617461466f726765a776657273696f6e07a6616374697665c3a47461677394a472757374a574617572 69a57265616374";

type Direction = "json-to-msgpack" | "msgpack-to-json";

export default function MsgpackTool() {
  const [direction, setDirection] = useState<Direction>("json-to-msgpack");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (direction === "json-to-msgpack") {
        const hex = await jsonToMsgpack(input.trim());
        setOutput(hex);
      } else {
        const json = await msgpackToJson(input.trim());
        setOutput(json);
      }
    } catch (e) {
      setError(String(e));
      setOutput("");
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() {
    const newDir: Direction =
      direction === "json-to-msgpack" ? "msgpack-to-json" : "json-to-msgpack";
    setDirection(newDir);
    setInput(
      output || (newDir === "msgpack-to-json" ? SAMPLE_MSGPACK_HEX : SAMPLE_JSON),
    );
    setOutput("");
    setError(null);
  }

  const inputLabel =
    direction === "json-to-msgpack" ? "JSON INPUT" : "MSGPACK HEX INPUT";
  const outputLabel =
    direction === "json-to-msgpack" ? "MSGPACK HEX OUTPUT" : "JSON OUTPUT";

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes =
    direction === "json-to-msgpack"
      ? Math.floor(output.replace(/\s/g, "").length / 2)
      : new TextEncoder().encode(output).length;

  const ratio =
    inputBytes > 0 && outputBytes > 0
      ? outputBytes < inputBytes
        ? `-${((1 - outputBytes / inputBytes) * 100).toFixed(1)}%`
        : `+${((outputBytes / inputBytes - 1) * 100).toFixed(1)}%`
      : null;

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
            <Segmented<Direction>
              value={direction}
              options={[
                { value: "json-to-msgpack", label: "JSON → MessagePack" },
                { value: "msgpack-to-json", label: "MessagePack → JSON" },
              ]}
              onChange={(d) => {
                setDirection(d);
                setInput(d === "json-to-msgpack" ? SAMPLE_JSON : SAMPLE_MSGPACK_HEX);
                setOutput("");
                setError(null);
              }}
              ariaLabel="Direction"
            />
            <ToolbarSeparator />
            <Button
              variant="primary"
              onClick={handleConvert}
              disabled={loading || !input.trim()}
            >
              {loading ? "Converting…" : "Convert"}
            </Button>
            {output && (
              <Button
                variant="secondary"
                onClick={handleSwap}
                icon={<ArrowLeftRight size={13} />}
                title="Swap input/output and flip direction"
              >
                Swap
              </Button>
            )}
          </>
        }
        right={
          output ? (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Input: {inputBytes} bytes → Output: {outputBytes} bytes
              {ratio && (
                <span
                  style={{
                    color:
                      outputBytes < inputBytes
                        ? "var(--color-success)"
                        : "var(--color-warning)",
                    marginLeft: 8,
                  }}
                >
                  ({ratio})
                </span>
              )}
            </span>
          ) : null
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
          <PaneHeader label={inputLabel} />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput("");
              setError(null);
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
            placeholder={
              direction === "json-to-msgpack"
                ? "Paste JSON here…"
                : "Paste hex-encoded MessagePack bytes (spaces allowed)…"
            }
            className="selectable"
            spellCheck={false}
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
          <PaneHeader label={outputLabel} />
          {error ? (
            <div
              style={{
                margin: 12,
                padding: 10,
                background: "rgba(255,75,75,0.08)",
                border: "1px solid rgba(255,75,75,0.25)",
                borderRadius: 6,
                color: "var(--color-text-primary)",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
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
              placeholder="Output will appear here after conversion…"
              className="selectable"
            />
          )}
        </div>
      </div>
    </div>
  );
}
