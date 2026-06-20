import { useState, useCallback, useEffect } from "react";
import { optimizeSvg, type SvgOptResult } from "../../lib/ipc";
import { PaneHeader } from "../../components/pane-header";

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <!-- This is a sample SVG -->
  <title>Sample Circle</title>
  <desc>A simple circle example for optimization</desc>
  <metadata>Created with SVG Editor</metadata>
  <circle cx="50.000000" cy="50.000000" r="40.123456789" fill="#ff0000" stroke="" opacity="1.0"/>
  <rect x="10.000" y="10.000" width="80.0000" height="80.00000" fill="none" stroke="#000000" stroke-width="2.000000"/>
</svg>`;

export default function SvgOptimizer() {
  const [input, setInput] = useState(SAMPLE);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [result, setResult] = useState<SvgOptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (svg: string, rm: boolean) => {
    if (!svg.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    try {
      const r = await optimizeSvg(svg, rm);
      setResult(r);
      setError(null);
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }, []);

  useEffect(() => {
    run(SAMPLE, true);
  }, [run]);

  const previewSrc = result
    ? `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(result.output)))}`
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
      <div
        style={{
          padding: "0 12px",
          height: 40,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          flexShrink: 0,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
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
            checked={removeMetadata}
            onChange={(e) => {
              setRemoveMetadata(e.target.checked);
              run(input, e.target.checked);
            }}
            style={{ accentColor: "var(--color-accent)" }}
          />
          Remove metadata / title / desc
        </label>
        {result && (
          <span
            style={{
              fontSize: 12,
              color:
                result.savingsPct > 0
                  ? "var(--color-success)"
                  : "var(--color-text-muted)",
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
            }}
          >
            Saved {result.savingsPct.toFixed(1)}% ({result.originalSize} →{" "}
            {result.optimizedSize} bytes)
          </span>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 220px",
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
          <PaneHeader label="INPUT SVG" bytes={new Blob([input]).size} />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              run(e.target.value, removeMetadata);
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
            placeholder="Paste SVG markup here…"
            className="selectable"
          />
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
            label="OPTIMIZED OUTPUT"
            bytes={result ? result.optimizedSize : undefined}
          />
          {error ? (
            <div
              style={{
                margin: 12,
                padding: 10,
                color: "var(--color-text-primary)",
                fontSize: 12,
                background: "rgba(255,75,75,0.08)",
                border: "1px solid rgba(255,75,75,0.25)",
                borderRadius: 6,
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
              value={result?.output ?? ""}
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
              className="selectable"
            />
          )}
        </div>


        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader label="PREVIEW" />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 12,
              background:
                "repeating-conic-gradient(#1a1a24 0% 25%, #111118 0% 50%) 50% / 16px 16px",
            }}
          >
            {previewSrc && (
              <img
                src={previewSrc}
                alt="SVG preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  background: "#fff",
                  borderRadius: 4,
                  padding: 6,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
