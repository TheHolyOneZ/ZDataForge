import { useState } from "react";
import { inspectX509, type CertInfo } from "../../lib/ipc";
import { PaneHeader } from "../../components/pane-header";
import { Button } from "../../components/button";

const SAMPLE_CERT = `-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBQLF29amygykE
MDmFZpxM1O0dOb/bLmIUGp+JNRVFQKYHCnFliXnuBFCmNkE14Z9JnnnFkqEZPnO7
-----END CERTIFICATE-----`;

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          minWidth: 180,
          color: "var(--color-text-muted)",
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "var(--color-text-primary)",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          wordBreak: "break-all",
        }}
        className="selectable"
      >
        {String(value)}
      </span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "var(--color-accent)",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.6,
      }}
    >
      {children}
    </div>
  );
}

export default function X509Inspector() {
  const [input, setInput] = useState("");
  const [cert, setCert] = useState<CertInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleInspect() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await inspectX509(input.trim());
      setCert(result);
    } catch (e) {
      setError(String(e));
      setCert(null);
    } finally {
      setLoading(false);
    }
  }

  function daysColor(days: number): string {
    if (days < 30) return "var(--color-error)";
    if (days < 90) return "var(--color-warning)";
    return "var(--color-success)";
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
          onClick={handleInspect}
          disabled={loading || !input.trim()}
        >
          {loading ? "Parsing…" : "Inspect Certificate"}
        </Button>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Accepts PEM or DER (hex/base64)
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
          <PaneHeader label="CERTIFICATE INPUT" />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setCert(null);
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
            placeholder={`Paste PEM certificate:\n${SAMPLE_CERT}`}
            className="selectable"
            spellCheck={false}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            padding: 16,
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(255,75,75,0.08)",
                border: "1px solid rgba(255,75,75,0.25)",
                borderRadius: 6,
                padding: 10,
                color: "var(--color-text-primary)",
                fontSize: 12,
                marginBottom: 12,
                fontFamily: "var(--font-mono)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error}
            </div>
          )}
          {cert && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <section>
                <SectionHeading>Identity</SectionHeading>
                <Field label="Subject" value={cert.subject} />
                <Field label="Issuer" value={cert.issuer} />
                <Field label="Serial" value={cert.serial} />
                <Field label="Is CA" value={cert.isCa ? "Yes" : "No"} />
              </section>

              <section>
                <SectionHeading>Validity</SectionHeading>
                <Field label="Not Before" value={cert.notBefore} />
                <Field label="Not After" value={cert.notAfter} />
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      minWidth: 180,
                      color: "var(--color-text-muted)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      flexShrink: 0,
                    }}
                  >
                    Days Remaining
                  </span>
                  <span
                    style={{
                      color: daysColor(cert.daysRemaining),
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                    }}
                  >
                    {cert.daysRemaining < 0
                      ? `EXPIRED ${Math.abs(cert.daysRemaining)} days ago`
                      : `${cert.daysRemaining} days`}
                  </span>
                </div>
              </section>

              <section>
                <SectionHeading>Cryptography</SectionHeading>
                <Field label="Key Algorithm" value={cert.keyAlgorithm} />
                <Field label="Signature Algorithm" value={cert.sigAlgorithm} />
                <Field label="SHA-256 Fingerprint" value={cert.fingerprintSha256} />
              </section>

              {cert.sans.length > 0 && (
                <section>
                  <SectionHeading>
                    Subject Alternative Names ({cert.sans.length})
                  </SectionHeading>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {cert.sans.map((san, i) => (
                      <div
                        key={i}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--color-text-primary)",
                          padding: "6px 0",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                        className="selectable"
                      >
                        {san}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
          {!cert && !error && (
            <div
              style={{
                color: "var(--color-text-muted)",
                fontSize: 12,
                textAlign: "center",
                paddingTop: 40,
              }}
            >
              Paste a PEM or DER certificate and click "Inspect Certificate"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
