import { useState, useRef } from "react";
import { detectImage, stripExif, type ImageInfo } from "../../lib/ipc";
import { saveBinary, base64ToBytes } from "../../lib/download";

export default function ImageInspector() {
  const [b64Input, setB64Input] = useState("");
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleanB64, setCleanB64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;

        const b64 = result.split(",")[1] ?? result;
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await readFileAsBase64(file);
    setB64Input(b64);
    setCleanB64(null);
    setInfo(null);
    setError(null);
  }

  async function handleDetect() {
    if (!b64Input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await detectImage(b64Input.trim());
      setInfo(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleStripExif() {
    if (!b64Input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const clean = await stripExif(b64Input.trim());
      setCleanB64(clean);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!cleanB64 || !info) return;
    const ext = info.format.toLowerCase();
    try {
      await saveBinary(base64ToBytes(cleanB64), `clean-image.${ext}`, [
        { name: info.format, extensions: [ext] },
      ]);
    } catch (e) {
      setError(String(e));
    }
  }

  const rows: [string, string][] = info
    ? [
        ["Format", info.format],
        ["Dimensions", `${info.width} × ${info.height} px`],
        ["Color Mode", info.colorMode],
        ["Bit Depth", `${info.bitDepth}-bit`],
        ["File Size", `${(info.fileSize / 1024).toFixed(2)} KB (${info.fileSize} bytes)`],
        ["EXIF Data", info.hasExif ? "Yes (detected)" : "No"],
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-border)", flexShrink: 0, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => fileRef.current?.click()}
          style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: 4, color: "var(--color-text-primary)", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
        >
          Load Image File
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button
          onClick={handleDetect}
          disabled={loading || !b64Input.trim()}
          style={{ background: "var(--color-accent-muted)", border: "1px solid var(--color-accent)", borderRadius: 4, color: "var(--color-accent)", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
        >
          {loading ? "Analyzing…" : "Detect & Analyze"}
        </button>
        <button
          onClick={handleStripExif}
          disabled={loading || !b64Input.trim()}
          style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: 4, color: "var(--color-text-primary)", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
        >
          Strip EXIF
        </button>
        {cleanB64 && (
          <button
            onClick={handleDownload}
            style={{ background: "var(--color-elevated)", border: "1px solid var(--color-accent)", borderRadius: 4, color: "var(--color-accent)", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
          >
            Download Clean Image
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-border)", overflow: "hidden" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", padding: "5px 12px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
            BASE64 INPUT
          </div>
          <textarea
            value={b64Input}
            onChange={(e) => { setB64Input(e.target.value); setInfo(null); setCleanB64(null); setError(null); }}
            style={{ flex: 1, resize: "none", background: "var(--color-panel)", border: "none", color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", fontSize: 11, padding: 12, outline: "none" }}
            placeholder="Paste base64-encoded image data here, or use 'Load Image File' button above.&#10;&#10;To get base64 from a file:&#10;  base64 /path/to/image.jpg"
            className="selectable"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", overflow: "auto", padding: 16 }}>
          {error && (
            <div style={{ background: "var(--color-error-muted)", border: "1px solid var(--color-error)", borderRadius: 6, padding: "8px 12px", color: "var(--color-error)", fontSize: 12, marginBottom: 12 }}>
              {error}
            </div>
          )}
          {cleanB64 && (
            <div style={{ background: "var(--color-success-muted)", border: "1px solid var(--color-success)", borderRadius: 6, padding: "8px 12px", color: "var(--color-success)", fontSize: 12, marginBottom: 12 }}>
              EXIF stripped successfully. Click "Download Clean Image" to save.
            </div>
          )}
          {info && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "8px 12px", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", fontSize: 11, whiteSpace: "nowrap" }}>{label}</td>
                    <td style={{ padding: "8px 12px", color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!info && !error && (
            <div style={{ color: "var(--color-text-muted)", fontSize: 12, textAlign: "center", paddingTop: 40 }}>
              Load an image file or paste base64 data, then click "Detect & Analyze"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
