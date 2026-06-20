import { useEffect, useMemo, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  WifiOff,
  Cpu,
  Package,
  ShieldCheck,
  KeyRound,
  Layers,
  Scale,
  Github,
  Globe,
  Download,
  User,
  Link as LinkIcon,
  ExternalLink,
  Apple,
} from "lucide-react";
import appIcon from "../../assets/icon.png";

type Os = "macos" | "windows" | "linux" | "unknown";

function detectOs(): Os {
  const ua = navigator.userAgent.toLowerCase();
  const platform = (
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
      ?.platform || navigator.platform
  ).toLowerCase();
  if (platform.includes("mac") || ua.includes("mac os")) return "macos";
  if (platform.includes("win") || ua.includes("windows")) return "windows";
  if (platform.includes("linux") || ua.includes("linux")) return "linux";
  return "unknown";
}

const OS_LABEL: Record<Os, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  unknown: "your platform",
};

function downloadUrlFor(os: Os): string {


  const base = "https://zsync.eu/zdataforge/";
  return os === "unknown" ? base : `${base}#${os}`;
}

async function openExternal(url: string) {
  try {
    await openUrl(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

const FEATURES: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <WifiOff size={16} strokeWidth={1.5} />,
    title: "Zero network",
    description: "No outbound requests, ever. Every byte stays on your machine.",
  },
  {
    icon: <Cpu size={16} strokeWidth={1.5} />,
    title: "Native Rust core",
    description: "Sub-millisecond responses on inputs measured in megabytes.",
  },
  {
    icon: <Package size={16} strokeWidth={1.5} />,
    title: "46+ tools",
    description: "JSON, regex, JWT, crypto, codegen, binary, time, network.",
  },
  {
    icon: <ShieldCheck size={16} strokeWidth={1.5} />,
    title: "RAM by default",
    description: "Inputs and outputs vanish on close. History is opt-in.",
  },
  {
    icon: <KeyRound size={16} strokeWidth={1.5} />,
    title: "Keystroke-first",
    description: "Palette-driven, every action reachable in ≤2 keys.",
  },
  {
    icon: <Scale size={16} strokeWidth={1.5} />,
    title: "GPL v3 licensed",
    description: "Free software. Audit, fork, and redistribute the source.",
  },
];

const STACK_CORE = [
  { name: "Rust", color: "#f74c00", note: "backend & tool engines" },
  { name: "Tauri v2", color: "#ffc131", note: "native shell" },
  { name: "React 18", color: "#61dafb", note: "UI runtime" },
  { name: "TypeScript", color: "#3178c6", note: "type-safe IPC" },
  { name: "Vite 6", color: "#a259ff", note: "dev server & bundler" },
  { name: "Tailwind v4", color: "#38bdf8", note: "design tokens" },
];

const STACK_LIBS = [
  { name: "serde_json", color: "#cdb380" },
  { name: "regex", color: "#cdb380" },
  { name: "jsonwebtoken", color: "#cdb380" },
  { name: "chrono / chrono-tz", color: "#cdb380" },
  { name: "sha2 / blake3 / argon2", color: "#cdb380" },
  { name: "ipnetwork", color: "#cdb380" },
  { name: "qrcode", color: "#cdb380" },
  { name: "mermaid", color: "#cdb380" },
  { name: "CodeMirror 6", color: "#cdb380" },
  { name: "Zustand", color: "#cdb380" },
  { name: "lucide-react", color: "#cdb380" },
];

export default function About() {
  const [version, setVersion] = useState<string>("…");
  const os = useMemo(detectOs, []);

  useEffect(() => {
    getVersion()
      .then(setVersion)
      .catch(() => setVersion("0.1.0"));
  }, []);

  const downloadIcon =
    os === "macos" ? (
      <Apple size={14} strokeWidth={1.8} />
    ) : (
      <Download size={14} strokeWidth={1.8} />
    );

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 28px 48px",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src={appIcon}
            alt="ZDataForge"
            width={88}
            height={88}
            draggable={false}
            style={{
              display: "block",
              margin: "0 auto 18px",
              borderRadius: 20,
              boxShadow: "0 8px 32px var(--color-accent-muted)",
            }}
          />

          <h2
            style={{
              margin: "0 0 6px",
              fontSize: 30,
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            ZDataForge
          </h2>

          <p
            style={{
              margin: "0 0 6px",
              fontSize: 14,
              color: "var(--color-text-secondary)",
            }}
          >
            The offline developer&rsquo;s data workbench
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            v{version}
          </p>
        </div>


        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 18px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.65,
              color: "var(--color-text-secondary)",
            }}
          >
            ZDataForge replaces the dozens of sketchy &ldquo;paste your data here&rdquo;
            websites developers reach for daily &mdash; JSON formatters, regex testers,
            JWT decoders, hash calculators, encoders, codegen, and more &mdash; with a
            single native desktop app. Everything runs locally in Rust. Nothing is
            uploaded, logged, or phoned home. It&rsquo;s designed to be the last data
            utility you install.
          </p>
        </div>


        <SectionLabel icon={<LinkIcon size={12} strokeWidth={1.5} />}>
          Project
        </SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <LinkCard
            onClick={() => openExternal(downloadUrlFor(os))}
            icon={downloadIcon}
            title={`Download for ${OS_LABEL[os]}`}
            subtitle="zsync.eu/zdataforge"
            accent
          />
          <LinkCard
            onClick={() =>
              openExternal("https://github.com/TheHolyOneZ/ZDataForge")
            }
            icon={<Github size={14} strokeWidth={1.8} />}
            title="Source on GitHub"
            subtitle="TheHolyOneZ/ZDataForge"
          />
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 28,
          }}
        >
          {FEATURES.map(({ icon, title, description }) => (
            <div
              key={title}
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "12px 14px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: "var(--color-accent)", marginTop: 1, flexShrink: 0 }}>
                {icon}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 2,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.45,
                  }}
                >
                  {description}
                </div>
              </div>
            </div>
          ))}
        </div>


        <SectionLabel icon={<Layers size={12} strokeWidth={1.5} />}>Core stack</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {STACK_CORE.map(({ name, color, note }) => (
            <div
              key={name}
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 8px ${color}88`,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--color-text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {note}
                </div>
              </div>
            </div>
          ))}
        </div>


        <SectionLabel icon={<Package size={12} strokeWidth={1.5} />}>
          Powered by
        </SectionLabel>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {STACK_LIBS.map(({ name, color }) => (
            <span
              key={name}
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
                background: "var(--color-elevated)",
                border: `1px solid ${color}33`,
                borderRadius: 4,
                padding: "3px 8px",
              }}
            >
              {name}
            </span>
          ))}
        </div>


        <SectionLabel icon={<User size={12} strokeWidth={1.5} />}>
          Crafted by
        </SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <LinkCard
            onClick={() => openExternal("https://zsync.eu")}
            icon={<Globe size={14} strokeWidth={1.8} />}
            title="zsync.eu"
            subtitle="More projects by the same author"
          />
          <LinkCard
            onClick={() => openExternal("https://github.com/TheHolyOneZ")}
            icon={<Github size={14} strokeWidth={1.8} />}
            title="@TheHolyOneZ"
            subtitle="GitHub profile"
          />
        </div>


        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
            }}
          >
            Released under the{" "}
            <span
              style={{
                color: "var(--color-text-secondary)",
                fontWeight: 600,
              }}
            >
              GNU General Public License v3.0
            </span>
            . You may use, study, modify, and redistribute the source under the same
            terms.
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              padding: "3px 8px",
              whiteSpace: "nowrap",
            }}
          >
            GPL-3.0-or-later
          </span>
        </div>
      </div>
    </div>
  );
}

function LinkCard({
  onClick,
  icon,
  title,
  subtitle,
  accent,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: accent ? "var(--color-accent-muted)" : "var(--color-elevated)",
        border: `1px solid ${accent ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
        color: "var(--color-text-primary)",
        font: "inherit",
        transition:
          "border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = accent
          ? "var(--color-accent)"
          : "var(--color-border)";
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-md)",
          background: accent
            ? "var(--color-accent)"
            : "var(--color-panel)",
          color: accent ? "#fff" : "var(--color-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {title}
          <ExternalLink
            size={10}
            strokeWidth={1.8}
            style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 2,
          }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10,
        fontWeight: 600,
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 10,
      }}
    >
      <span style={{ display: "flex", color: "var(--color-text-muted)" }}>{icon}</span>
      {children}
    </div>
  );
}
