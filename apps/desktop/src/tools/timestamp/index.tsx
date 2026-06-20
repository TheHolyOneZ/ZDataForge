import { useState, useEffect, useCallback } from "react";
import { unixToInfo, isoToUnix, nowUnix, type TimestampInfo } from "../../lib/ipc";
import { Button } from "../../components/button";
import { CopyButton } from "../../components/tool-bits";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.5,
  color: "var(--color-text-muted)",
  display: "block",
  marginBottom: 6,
};

const INPUT_BASE: React.CSSProperties = {
  width: "100%",
  background: "var(--color-elevated)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  height: 32,
  padding: "0 12px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color var(--duration-base) var(--ease-out)",
};

export default function Timestamp() {
  const [unix, setUnix] = useState("");
  const [iso, setIso] = useState("");
  const [tz, setTz] = useState("UTC");
  const [info, setInfo] = useState<TimestampInfo | null>(null);
  const [error, setError] = useState("");

  const runUnix = useCallback(async (val: string, tzName: string) => {
    const n = parseInt(val.trim());
    if (isNaN(n)) {
      setInfo(null);
      setError(val ? "Invalid unix timestamp" : "");
      return;
    }
    try {
      setInfo(await unixToInfo(n, tzName));
      setError("");
    } catch (e) {
      setError(String(e));
      setInfo(null);
    }
  }, []);

  const loadNow = useCallback(async () => {
    const now = await nowUnix();
    setUnix(String(now));
    runUnix(String(now), tz);
  }, [tz, runUnix]);

  const runIso = useCallback(
    async (val: string) => {
      if (!val.trim()) {
        setInfo(null);
        setError("");
        return;
      }
      try {
        const secs = await isoToUnix(val);
        setUnix(String(secs));
        setInfo(await unixToInfo(secs, tz));
        setError("");
      } catch (e) {
        setError(String(e));
        setInfo(null);
      }
    },
    [tz],
  );

  useEffect(() => {
    loadNow();
  }, [loadNow]);

  const rows: [string, string][] = info
    ? [
        ["Unix (seconds)", String(info.unix_seconds)],
        ["Unix (ms)", String(info.unix_ms)],
        ["UTC ISO 8601", info.utc_iso],
        ["RFC 2822", info.utc_rfc2822],
        [`Local (${info.tz_name})`, info.local_display],
        ["Relative", info.relative],
      ]
    : [];

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={FIELD_LABEL}>UNIX TIMESTAMP (seconds)</label>
          <input
            value={unix}
            onChange={(e) => {
              setUnix(e.target.value);
              runUnix(e.target.value, tz);
            }}
            placeholder="e.g. 1716239022"
            style={{
              ...INPUT_BASE,
              border: `1px solid ${
                error ? "var(--color-error)" : "var(--color-border)"
              }`,
            }}
            className="selectable"
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={FIELD_LABEL}>ISO 8601 / RFC 3339</label>
          <input
            value={iso}
            onChange={(e) => {
              setIso(e.target.value);
              runIso(e.target.value);
            }}
            placeholder="e.g. 2024-05-20T10:30:00Z"
            style={{
              ...INPUT_BASE,
              border: "1px solid var(--color-border)",
            }}
            className="selectable"
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <select
          value={tz}
          onChange={(e) => {
            setTz(e.target.value);
            runUnix(unix, e.target.value);
          }}
          style={{ fontSize: 12, height: 28 }}
        >
          {TIMEZONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={loadNow}>
          Now
        </Button>
        {error && (
          <span style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</span>
        )}
      </div>
      {info && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {rows.map(([label, val], i) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                borderBottom:
                  i === rows.length - 1
                    ? "none"
                    : "1px solid var(--color-border)",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 180,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--color-text-primary)",
                  wordBreak: "break-all",
                }}
                className="selectable"
              >
                {val}
              </span>
              <CopyButton value={val} variant="ghost" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
