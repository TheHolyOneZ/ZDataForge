import { useState, useCallback } from "react";
import { ShieldAlert } from "lucide-react";
import { aesEncrypt, aesDecrypt } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { Segmented } from "../../components/tool-bits";

type Mode = "encrypt" | "decrypt";

export default function AesTool() {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [input, setInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const run = useCallback(async (val: string, pass: string, m: Mode) => {
    if (!val || !pass) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const result =
        m === "encrypt" ? await aesEncrypt(val, pass) : await aesDecrypt(val, pass);
      setOutput(result);
      setError("");
    } catch (e) {
      setError(String(e));
      setOutput("");
    }
  }, []);

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
            <Segmented<Mode>
              value={mode}
              options={[
                { value: "encrypt", label: "Encrypt" },
                { value: "decrypt", label: "Decrypt" },
              ]}
              onChange={(m) => {
                setMode(m);
                run(input, passphrase, m);
              }}
              ariaLabel="Mode"
            />
            <ToolbarSeparator />
            <input
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                run(input, e.target.value, mode);
              }}
              type="password"
              placeholder="Passphrase (AES-256-GCM key derivation)…"
              style={{
                flex: 1,
                minWidth: 240,
                height: 28,
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                color: "var(--color-text-primary)",
                fontSize: 12,
                padding: "0 10px",
                outline: "none",
                fontFamily: "var(--font-mono)",
              }}
            />
            {error && (
              <span style={{ fontSize: 12, color: "var(--color-error)" }}>
                {error}
              </span>
            )}
          </>
        }
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "rgba(245, 166, 35, 0.08)",
          borderBottom: "1px solid rgba(245, 166, 35, 0.2)",
          fontSize: 11,
          color: "var(--color-warning)",
          flexShrink: 0,
        }}
      >
        <ShieldAlert size={12} />
        Educational tool — key derived via SHA-256 of passphrase, not PBKDF2. Do
        not use for production secrets.
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
        {[
          {
            label: mode === "encrypt" ? "PLAINTEXT" : "CIPHERTEXT (base64)",
            val: input,
            ro: false,
          },
          {
            label: mode === "encrypt" ? "CIPHERTEXT (base64)" : "PLAINTEXT",
            val: output,
            ro: true,
          },
        ].map(({ label, val, ro }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight: !ro ? "1px solid var(--color-border)" : undefined,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <PaneHeader label={label} bytes={new Blob([val]).size} />
            <textarea
              value={val}
              onChange={(e) => {
                if (!ro) {
                  setInput(e.target.value);
                  run(e.target.value, passphrase, mode);
                }
              }}
              readOnly={ro}
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
                ro
                  ? "Output appears here…"
                  : mode === "encrypt"
                    ? "Text to encrypt…"
                    : "Base64 ciphertext to decrypt…"
              }
              className="selectable"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
