import { useState, useCallback } from "react";
import { generateUuid, generateUlid, inspectUuid, type UuidInfo } from "../../lib/ipc";
import { RefreshCw, Copy } from "lucide-react";

export default function UuidGenerator() {
  const [version, setVersion] = useState<4 | 7>(4);
  const [values, setValues] = useState<string[]>([]);
  const [inspect, setInspect] = useState("");
  const [info, setInfo] = useState<UuidInfo | null>(null);
  const [infoError, setInfoError] = useState("");
  const [useUlid, setUseUlid] = useState(false);

  const generate = useCallback(
    async (count = 5) => {
      try {
        if (useUlid) {
          const results = await Promise.all(Array.from({ length: count }, () => generateUlid()));
          setValues(results);
        } else {
          const results = await Promise.all(
            Array.from({ length: count }, () => generateUuid(version)),
          );
          setValues(results);
        }
      } catch {

      }
    },
    [version, useUlid],
  );

  const runInspect = useCallback(async (s: string) => {
    if (!s.trim()) {
      setInfo(null);
      setInfoError("");
      return;
    }
    try {
      setInfo(await inspectUuid(s));
      setInfoError("");
    } catch (e) {
      setInfoError(String(e));
      setInfo(null);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          flexWrap: "wrap",
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
            checked={useUlid}
            onChange={(e) => setUseUlid(e.target.checked)}
          />{" "}
          ULID
        </label>
        {!useUlid && (
          <div style={{ display: "flex", gap: 4 }}>
            {([4, 7] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                style={{
                  background:
                    version === v ? "var(--color-accent-muted)" : "var(--color-elevated)",
                  border: `1px solid ${version === v ? "var(--color-accent)" : "var(--color-border)"}`,
                  borderRadius: 4,
                  color: version === v ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontSize: 12,
                  padding: "3px 10px",
                  cursor: "pointer",
                }}
              >
                v{v}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => generate(10)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--color-accent)",
            border: "none",
            borderRadius: 4,
            color: "#fff",
            fontSize: 12,
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Generate 10
        </button>
      </div>
      <div
        style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              padding: "5px 12px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            GENERATED
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {values.map((v, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--color-text-primary)",
                  }}
                  className="selectable"
                >
                  {v}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(v)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                    display: "flex",
                  }}
                >
                  <Copy size={12} />
                </button>
              </div>
            ))}
            {values.length === 0 && (
              <div style={{ padding: 16, color: "var(--color-text-muted)", fontSize: 13 }}>
                Click Generate to create UUIDs
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              padding: "5px 12px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            INSPECT UUID
          </div>
          <div style={{ padding: 12 }}>
            <input
              value={inspect}
              onChange={(e) => {
                setInspect(e.target.value);
                runInspect(e.target.value);
              }}
              placeholder="Paste a UUID to inspect…"
              style={{
                width: "100%",
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                padding: "6px 10px",
                outline: "none",
                boxSizing: "border-box",
              }}
              className="selectable"
            />
            {infoError && (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-error)" }}>
                {infoError}
              </div>
            )}
            {info && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {(
                  [
                    ["Format", info.variant === "ULID" ? "ULID" : `UUID v${info.version}`],
                    ["Variant", info.variant],
                    [
                      "Timestamp",
                      info.timestamp_ms != null
                        ? new Date(info.timestamp_ms).toISOString()
                        : "—",
                    ],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <span
                      style={{
                        color: "var(--color-text-muted)",
                        width: 80,
                        flexShrink: 0,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
