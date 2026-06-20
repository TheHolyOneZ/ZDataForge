import { useState, useCallback } from "react";
import { parseIp, type IpInfo } from "../../lib/ipc";
import { Button } from "../../components/button";
import { CopyButton } from "../../components/tool-bits";

const EXAMPLES = [
  "192.168.1.0/24",
  "10.0.0.1/8",
  "2001:db8::/32",
  "172.16.0.0/12",
  "8.8.8.8",
];

export default function IpCalculator() {
  const [input, setInput] = useState("192.168.1.0/24");
  const [result, setResult] = useState<IpInfo | null>(null);
  const [error, setError] = useState("");

  const run = useCallback(async (val: string) => {
    if (!val.trim()) {
      setResult(null);
      setError("");
      return;
    }
    try {
      setResult(await parseIp(val));
      setError("");
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }, []);

  const fields: [string, string][] = result
    ? ([
        ["Address", result.address],
        ["Version", `IPv${result.version}`],
        result.prefix_len != null
          ? ["Prefix Length", `/${result.prefix_len}`]
          : null,
        result.netmask ? ["Netmask", result.netmask] : null,
        result.network ? ["Network", result.network] : null,
        result.broadcast ? ["Broadcast", result.broadcast] : null,
        result.host_min ? ["Host Min", result.host_min] : null,
        result.host_max ? ["Host Max", result.host_max] : null,
        result.host_count != null
          ? ["Host Count", result.host_count.toLocaleString()]
          : null,
        result.class ? ["Class", result.class] : null,
        ["Private", result.is_private ? "Yes" : "No"],
        ["Loopback", result.is_loopback ? "Yes" : "No"],
        ["Multicast", result.is_multicast ? "Yes" : "No"],
      ].filter(Boolean) as [string, string][])
    : [];

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
          padding: 12,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {EXAMPLES.map((e) => (
            <Button
              key={e}
              variant="secondary"
              active={input === e}
              onClick={() => {
                setInput(e);
                run(e);
              }}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {e}
            </Button>
          ))}
        </div>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            run(e.target.value);
          }}
          placeholder="IP address or CIDR (e.g. 192.168.1.0/24)"
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: `1px solid ${
              error ? "var(--color-error)" : "var(--color-border)"
            }`,
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            height: 32,
            padding: "0 12px",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color var(--duration-base) var(--ease-out)",
          }}
          className="selectable"
        />
        {error && (
          <div style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {fields.map(([label, val]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderBottom: "1px solid var(--color-border)",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 140,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 0.2,
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
    </div>
  );
}
