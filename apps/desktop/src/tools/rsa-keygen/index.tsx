import { useState, useCallback } from "react";
import { generateRsaKeypair, type KeypairResult } from "../../lib/ipc";
import { Loader2 } from "lucide-react";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { Button } from "../../components/button";
import { Segmented, CopyButton } from "../../components/tool-bits";

export default function RsaKeygen() {
  const [bits, setBits] = useState<2048 | 4096>(2048);
  const [result, setResult] = useState<KeypairResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await generateRsaKeypair(bits));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [bits]);

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
              Key size
            </span>
            <Segmented<2048 | 4096>
              value={bits}
              options={[
                { value: 2048, label: "2048" },
                { value: 4096, label: "4096" },
              ]}
              onChange={setBits}
              ariaLabel="Key size"
            />
            <ToolbarSeparator />
            <Button
              variant="primary"
              onClick={generate}
              disabled={loading}
              icon={
                loading ? (
                  <Loader2
                    size={13}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : undefined
              }
            >
              Generate RSA Keypair
            </Button>
            {error && (
              <>
                <ToolbarSeparator />
                <span style={{ fontSize: 12, color: "var(--color-error)" }}>
                  {error}
                </span>
              </>
            )}
          </>
        }
      />
      {loading && !result && (
        <div
          style={{
            padding: 24,
            color: "var(--color-text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          Generating {bits}-bit RSA keypair… (this may take a few seconds)
        </div>
      )}
      {result && (
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {(
            [
              ["PRIVATE KEY", result.private_key_pem],
              ["PUBLIC KEY", result.public_key_pem],
            ] as [string, string][]
          ).map(([label, pem]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRight:
                  label === "PRIVATE KEY"
                    ? "1px solid var(--color-border)"
                    : undefined,
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <PaneHeader
                label={label}
                bytes={new Blob([pem]).size}
                right={<CopyButton value={pem} variant="ghost" />}
              />
              <textarea
                readOnly
                value={pem}
                style={{
                  flex: 1,
                  resize: "none",
                  background: "var(--color-bg)",
                  border: "none",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  lineHeight: 1.5,
                  padding: 12,
                  outline: "none",
                }}
                className="selectable"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
