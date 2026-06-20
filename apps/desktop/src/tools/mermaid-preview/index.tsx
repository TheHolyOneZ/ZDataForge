import { useState, useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Done]
    B -->|No| A`;

let mermaidInitialized = false;

function initMermaid() {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });
    mermaidInitialized = true;
  }
}

export default function MermaidPreview() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);

  const render = useCallback(async (src: string) => {
    initMermaid();
    if (!src.trim()) { setSvg(""); setError(null); return; }
    idRef.current += 1;
    const id = `mermaid-${idRef.current}`;
    try {
      const parsed = await mermaid.parse(src, { suppressErrors: true });
      if (!parsed) throw new Error("Invalid Mermaid syntax");
      const { svg: rendered } = await mermaid.render(id, src);
      setSvg(rendered);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.replace(/^Error:\s*/i, ""));
      setSvg("");
    } finally {

      document.querySelectorAll(`#d${id}, #${id}`).forEach((el) => el.remove());
    }
  }, []);

  useEffect(() => { render(DEFAULT_DIAGRAM); }, [render]);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      <div style={{ display: "flex", flexDirection: "column", width: "45%", borderRight: "1px solid var(--color-border)", overflow: "hidden" }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", padding: "5px 12px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>MERMAID SYNTAX</div>
        <textarea
          value={code}
          onChange={(e) => { setCode(e.target.value); render(e.target.value); }}
          style={{ flex: 1, resize: "none", background: "var(--color-panel)", border: "none", color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", fontSize: 13, padding: 12, outline: "none", lineHeight: 1.6 }}
          placeholder="Enter Mermaid diagram syntax…"
          className="selectable"
          spellCheck={false}
        />
      </div>


      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", padding: "5px 12px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>PREVIEW</div>
        <div style={{ flex: 1, overflow: "auto", padding: 16, background: "var(--color-panel)" }}>
          {error ? (
            <div style={{ background: "var(--color-error-muted)", border: "1px solid var(--color-error)", borderRadius: 6, padding: "10px 14px", color: "var(--color-error)", fontSize: 12, fontFamily: "var(--font-mono)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: "100%", overflow: "hidden" }}>
              {error}
            </div>
          ) : svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} style={{ display: "flex", justifyContent: "center" }} />
          ) : (
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, textAlign: "center", paddingTop: 40 }}>
              Enter Mermaid syntax to see the diagram
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
