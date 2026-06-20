import { useState, useEffect } from "react";
import { httpStatusInfo, type HttpStatusInfo } from "../../lib/ipc";

const ALL_CODES = [
  100, 101, 200, 201, 202, 204, 206, 301, 302, 304, 307, 308, 400, 401, 403, 404,
  405, 408, 409, 410, 413, 415, 422, 429, 500, 501, 502, 503, 504,
];
const CATEGORY_COLORS: Record<string, string> = {
  Informational: "var(--color-text-muted)",
  Success: "var(--color-success)",
  Redirection: "var(--color-warning)",
  "Client Error": "#fb923c",
  "Server Error": "var(--color-error)",
};

export default function HttpStatus() {
  const [search, setSearch] = useState("");

  const filtered = ALL_CODES.filter((c) => c.toString().includes(search.trim()));

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
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code…"
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontSize: 13,
            height: 32,
            padding: "0 12px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "var(--font-mono)",
          }}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((code) => (
          <StatusRow key={code} code={code} />
        ))}
      </div>
    </div>
  );
}

function StatusRow({ code }: { code: number }) {
  const [info, setInfo] = useState<HttpStatusInfo | null>(null);
  useEffect(() => {
    httpStatusInfo(code).then(setInfo);
  }, [code]);
  const color = CATEGORY_COLORS[info?.category ?? ""] ?? "var(--color-text-muted)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "1px solid var(--color-border)",
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          fontWeight: 600,
          color,
          width: 48,
          flexShrink: 0,
          letterSpacing: 0.2,
        }}
      >
        {code}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-primary)",
            fontWeight: 500,
          }}
        >
          {info?.name ?? "Unknown"}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            letterSpacing: 0.2,
          }}
        >
          {info?.category}
        </div>
      </div>
    </div>
  );
}
