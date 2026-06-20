import { useState, useCallback } from "react";
import { argon2Hash, argon2Verify, bcryptHash, bcryptVerify } from "../../lib/ipc";
import { Copy, Loader2 } from "lucide-react";

type Algo = "argon2" | "bcrypt";

export default function PasswordHash() {
  const [algo, setAlgo] = useState<Algo>("argon2");
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const result =
        algo === "argon2" ? await argon2Hash(password) : await bcryptHash(password, 10);
      setHash(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [password, algo]);

  const verify = useCallback(async () => {
    if (!password || !verifyHash) return;
    setLoading(true);
    setError("");
    try {
      const ok =
        algo === "argon2"
          ? await argon2Verify(password, verifyHash)
          : await bcryptVerify(password, verifyHash);
      setVerifyResult(ok);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [password, verifyHash, algo]);

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {(["argon2", "bcrypt"] as Algo[]).map((a) => (
          <button
            key={a}
            onClick={() => setAlgo(a)}
            style={{
              background: algo === a ? "var(--color-accent-muted)" : "var(--color-elevated)",
              border: `1px solid ${algo === a ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: 4,
              color: algo === a ? "var(--color-accent)" : "var(--color-text-muted)",
              fontSize: 12,
              padding: "4px 14px",
              cursor: "pointer",
            }}
          >
            {a === "argon2" ? "Argon2id" : "bcrypt"}
          </button>
        ))}
      </div>
      <div>
        <label
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            display: "block",
            marginBottom: 6,
          }}
        >
          PASSWORD
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password…"
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontSize: 13,
            padding: "8px 12px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <button
        onClick={generate}
        disabled={!password || loading}
        style={{
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--color-accent)",
          border: "none",
          borderRadius: "var(--radius-md)",
          color: "#fff",
          fontSize: 13,
          padding: "7px 16px",
          cursor: password && !loading ? "pointer" : "not-allowed",
          opacity: !password || loading ? 0.6 : 1,
        }}
      >
        {loading && (
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
        )}{" "}
        Hash Password
      </button>
      {hash && (
        <div>
          <label
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            HASH OUTPUT
          </label>
          <div
            style={{
              display: "flex",
              gap: 8,
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
            }}
          >
            <span
              style={{
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-text-primary)",
                wordBreak: "break-all",
              }}
              className="selectable"
            >
              {hash}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(hash)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                flexShrink: 0,
                display: "flex",
              }}
            >
              <Copy size={13} />
            </button>
          </div>
        </div>
      )}
      {error && <div style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</div>}
      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 10 }}>
          VERIFY
        </div>
        <input
          value={verifyHash}
          onChange={(e) => setVerifyHash(e.target.value)}
          placeholder="Paste hash to verify against…"
          style={{
            width: "100%",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            padding: "8px 12px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 8,
          }}
          className="selectable"
        />
        <button
          onClick={verify}
          disabled={!password || !verifyHash || loading}
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            padding: "6px 14px",
            cursor: "pointer",
          }}
        >
          Verify
        </button>
        {verifyResult !== null && (
          <span
            style={{
              marginLeft: 12,
              fontSize: 13,
              color: verifyResult ? "var(--color-success)" : "var(--color-error)",
            }}
          >
            {verifyResult ? "✓ Match" : "✗ No match"}
          </span>
        )}
      </div>
    </div>
  );
}
