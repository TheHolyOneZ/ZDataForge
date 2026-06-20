import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../lib/store";
import { Shield, CheckCircle, XCircle, HardDrive, Wifi } from "lucide-react";

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: "var(--color-elevated)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      padding: "16px 20px",
      marginBottom: 12,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        color: "var(--color-text-primary)",
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {icon}
      {title}
    </div>
    {children}
  </div>
);

const BulletItem = ({
  text,
  accent = false,
}: {
  text: string;
  accent?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      marginBottom: 6,
      fontSize: 12,
      color: accent ? "var(--color-text-primary)" : "var(--color-text-secondary)",
      lineHeight: 1.5,
    }}
  >
    <span
      style={{
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "var(--color-accent)",
        marginTop: 6,
        flexShrink: 0,
      }}
    />
    {text}
  </div>
);

export default function PrivacyPanel() {
  const { historyEnabled, setHistoryEnabled } = useAppStore();
  const [wiping, setWiping] = useState(false);
  const [wiped, setWiped] = useState(false);

  async function handleWipeHistory() {
    setWiping(true);
    try {
      await invoke("wipe_history");
      setWiped(true);
      setTimeout(() => setWiped(false), 3000);
    } catch (e) {
      console.error("wipe_history failed:", e);
    } finally {
      setWiping(false);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 32px",
        maxWidth: 680,
        margin: "0 auto",
        width: "100%",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Shield size={28} strokeWidth={1.5} style={{ color: "var(--color-accent)" }} />
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Privacy &amp; Data
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
            ZDataForge is 100% offline. Here&rsquo;s exactly what it does with your data.
          </div>
        </div>
      </div>


      <Section
        title="What stays in RAM only"
        icon={<CheckCircle size={14} strokeWidth={1.5} style={{ color: "#22c55e" }} />}
      >
        <BulletItem text="All tool inputs and outputs — never written to disk" />
        <BulletItem text="Paste buffer and clipboard contents" />
        <BulletItem text="Regex patterns and test strings" />
        <BulletItem text="JWT tokens, decoded claims, and header payloads" />
        <BulletItem text="Cryptographic material: keys, hashes, encrypted ciphertext" />
        <BulletItem text="All data is wiped when the app closes" />
      </Section>


      <Section
        title="What touches disk"
        icon={<HardDrive size={14} strokeWidth={1.5} style={{ color: "#f59e0b" }} />}
      >
        <BulletItem
          text="Settings file (theme, hotkey, density, accent color) — stored in the OS app-data directory"
          accent
        />
        <BulletItem
          text="History entries — only if you explicitly enable history in Settings (off by default)"
          accent
        />
      </Section>


      <Section
        title="What never happens"
        icon={<XCircle size={14} strokeWidth={1.5} style={{ color: "#ef4444" }} />}
      >
        <BulletItem text="No network requests — ever. Zero DNS lookups, zero HTTP calls." />
        <BulletItem text="No telemetry or analytics" />
        <BulletItem text="No crash reporting uploads" />
        <BulletItem text="No auto-update checks (updater is opt-in and off by default)" />
        <BulletItem text="No cloud sync" />
      </Section>


      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "var(--radius-md)",
          marginBottom: 24,
          fontSize: 12,
          color: "#22c55e",
        }}
      >
        <Wifi size={14} strokeWidth={1.5} />
        Network access is not declared in the Tauri capabilities manifest — the app cannot make network
        requests even if it tried.
      </div>


      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Enable History
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
              When disabled (default), nothing is persisted between sessions
            </div>
          </div>
          <button
            onClick={() => setHistoryEnabled(!historyEnabled)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: historyEnabled ? "var(--color-accent)" : "var(--color-border-strong)",
              position: "relative",
              transition: "background 200ms",
              flexShrink: 0,
            }}
            aria-label={historyEnabled ? "Disable history" : "Enable history"}
            aria-checked={historyEnabled}
            role="switch"
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: historyEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "white",
                transition: "left 200ms",
              }}
            />
          </button>
        </div>


        <button
          onClick={handleWipeHistory}
          disabled={wiping}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid #ef4444",
            background: wiped ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)",
            color: wiped ? "#22c55e" : "#ef4444",
            cursor: wiping ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            transition: "all 200ms",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {wiping ? "Wiping…" : wiped ? "History wiped" : "Wipe History"}
        </button>
      </div>
    </div>
  );
}
