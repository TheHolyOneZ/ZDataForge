import { useState, useCallback, useEffect } from "react";
import { generateQrSvg } from "../../lib/ipc";
import { saveText } from "../../lib/download";

const EC_LEVELS = ["L", "M", "Q", "H"] as const;

export default function QrGenerator() {
  const [data, setData] = useState("https://zdataforge.app");
  const [ecLevel, setEcLevel] = useState<typeof EC_LEVELS[number]>("H");
  const [size] = useState(200);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  const run = useCallback(async (val: string, ec: string, s: number) => {
    if (!val.trim()) { setSvg(""); return; }
    try { setSvg(await generateQrSvg(val, ec, s)); setError(""); }
    catch (e) { setError(String(e)); setSvg(""); }
  }, []);

  useEffect(() => { run(data, ecLevel, size); }, [data, ecLevel, size, run]);

  const download = async () => {
    try {
      await saveText(svg, "qr-code.svg", [{ name: "SVG", extensions: ["svg"] }]);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
        <input value={data} onChange={e => { setData(e.target.value); run(e.target.value, ecLevel, size); }}
          placeholder="Text or URL to encode…"
          style={{ width: "100%", background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "var(--color-text-primary)", fontSize: 14, padding: "8px 12px", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
          className="selectable"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Error correction:</label>
          <div style={{ display: "flex", gap: 4 }}>
            {EC_LEVELS.map(l => (
              <button key={l} onClick={() => { setEcLevel(l); run(data, l, size); }}
                style={{ background: ecLevel === l ? "var(--color-accent-muted)" : "var(--color-elevated)", border: `1px solid ${ecLevel === l ? "var(--color-accent)" : "var(--color-border)"}`, borderRadius: 4, color: ecLevel === l ? "var(--color-accent)" : "var(--color-text-muted)", fontSize: 12, padding: "2px 10px", cursor: "pointer" }}>
                {l}
              </button>
            ))}
          </div>
          {svg && (
            <button onClick={download}
              style={{ marginLeft: "auto", background: "none", border: "1px solid var(--color-border)", borderRadius: 4, color: "var(--color-text-muted)", fontSize: 12, padding: "3px 10px", cursor: "pointer" }}>
              Download SVG
            </button>
          )}
        </div>
        {error && <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-error)" }}>{error}</div>}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        {svg ? (
          <div style={{ background: "white", padding: 16, borderRadius: "var(--radius-lg)" }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Enter text or URL to generate QR code</div>
        )}
      </div>
    </div>
  );
}
