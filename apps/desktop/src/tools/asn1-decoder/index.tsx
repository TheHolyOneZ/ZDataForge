import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { decodeAsn1, type Asn1Node } from "../../lib/ipc";
import { PaneHeader } from "../../components/pane-header";
import { Button } from "../../components/button";

const SAMPLE_HEX = "300d06092a864886f70d010101050003050030";

interface NodeProps {
  node: Asn1Node;
  depth: number;
}

function Asn1NodeView({ node, depth }: NodeProps) {
  const [open, setOpen] = useState(depth < 3);
  const isConstructed = node.constructed && node.children.length > 0;
  const indent = depth * 18;

  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
      <div
        onClick={() => isConstructed && setOpen(!open)}
        style={{
          paddingLeft: indent + 10,
          paddingRight: 10,
          paddingTop: 4,
          paddingBottom: 4,
          cursor: isConstructed ? "pointer" : "default",
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          color: "var(--color-text-primary)",
          userSelect: "none",
          transition: "background var(--duration-base) var(--ease-out)",
        }}
        onMouseEnter={(e) => {
          if (isConstructed)
            (e.currentTarget as HTMLDivElement).style.background =
              "var(--color-elevated)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        {isConstructed ? (
          open ? (
            <ChevronDown size={11} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          ) : (
            <ChevronRight size={11} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          )
        ) : (
          <span style={{ width: 11, flexShrink: 0 }} />
        )}
        <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
          {node.tag}
        </span>
        <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
          [len={node.length}]
        </span>
        {node.value !== null && (
          <span
            style={{
              color: "var(--color-text-secondary)",
              wordBreak: "break-all",
            }}
          >
            {node.value}
          </span>
        )}
      </div>
      {isConstructed && open && (
        <div>
          {node.children.map((child, i) => (
            <Asn1NodeView key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Asn1Decoder() {
  const [input, setInput] = useState(SAMPLE_HEX);
  const [result, setResult] = useState<Asn1Node | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDecode() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const node = await decodeAsn1(input.trim());
      setResult(node);
    } catch (e) {
      setError(String(e));
      setResult(null);
    } finally {
      setLoading(false);
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
          {loading ? "Decoding…" : "Decode ASN.1"}
        </Button>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Accepts PEM (-----BEGIN...) or hex-encoded DER
        </span>
      </div>

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
          <PaneHeader label="INPUT (PEM or HEX DER)" />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
              setError(null);
            }}
            style={{
              flex: 1,
              resize: "none",
              background: "var(--color-bg)",
              border: "none",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              lineHeight: 1.55,
              padding: 12,
              outline: "none",
            }}
            placeholder="Paste PEM block or hex-encoded DER bytes…"
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
          <PaneHeader label="ASN.1 TREE" />
          <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
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
            {result && <Asn1NodeView node={result} depth={0} />}
            {!result && !error && (
              <div
                style={{
                  padding: 24,
                  color: "var(--color-text-muted)",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Enter DER/PEM data and click Decode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
