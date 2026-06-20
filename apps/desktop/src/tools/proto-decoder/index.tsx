import { useState } from "react";
import { decodeProto, type ProtoField } from "../../lib/ipc";
import { PaneHeader } from "../../components/pane-header";
import { Button } from "../../components/button";


const SAMPLE_HEX = "08960112077465737469 6e67";

export default function ProtoDecoder() {
  const [input, setInput] = useState(SAMPLE_HEX);
  const [fields, setFields] = useState<ProtoField[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDecode() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await decodeProto(input.trim());
      setFields(result);
    } catch (e) {
      setError(String(e));
      setFields(null);
    } finally {
      setLoading(false);
    }
  }

  function wireTypeColor(wt: string): string {
    switch (wt) {
      case "varint":
        return "#60a5fa";
      case "64-bit":
        return "#a78bfa";
      case "length-delimited":
        return "#34d399";
      case "32-bit":
        return "#fb923c";
      default:
        return "var(--color-text-muted)";
    }
  }

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
          padding: "0 12px",
          height: 40,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          flexShrink: 0,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Button
          variant="primary"
          onClick={handleDecode}
          disabled={loading || !input.trim()}
        >
          {loading ? "Decoding…" : "Decode Protobuf"}
        </Button>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Accepts hex or base64 encoded proto3 wire format bytes
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "45% 55%",
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
          <PaneHeader label="INPUT (HEX OR BASE64)" />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setFields(null);
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
            placeholder="Paste hex bytes (spaces allowed) or base64 encoded protobuf…"
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
          <PaneHeader
            label="DECODED FIELDS"
            right={
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  fontStyle: "italic",
                }}
              >
                (schema-less — field names not available without .proto file)
              </span>
            }
          />
          <div style={{ flex: 1, overflow: "auto" }}>
            {error && (
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
            )}
            {fields && fields.length > 0 && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: "var(--color-panel)",
                    }}
                  >
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: "var(--color-text-muted)",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      Field #
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: "var(--color-text-muted)",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      Wire Type
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: "var(--color-text-muted)",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-primary)",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {f.fieldNumber}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <span
                          style={{
                            color: wireTypeColor(f.wireType),
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "var(--color-elevated)",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          {f.wireType}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-secondary)",
                          wordBreak: "break-all",
                        }}
                      >
                        {f.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {fields && fields.length === 0 && (
              <div
                style={{
                  padding: 16,
                  color: "var(--color-text-muted)",
                  fontSize: 12,
                }}
              >
                No fields decoded (empty message?)
              </div>
            )}
            {!fields && !error && (
              <div
                style={{
                  padding: 24,
                  color: "var(--color-text-muted)",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Paste hex or base64 protobuf bytes and click Decode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
