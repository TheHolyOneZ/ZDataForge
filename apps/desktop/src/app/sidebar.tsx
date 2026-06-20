import { useState } from "react";
import { type LucideProps } from "lucide-react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Settings,
  Shield,
  Braces,
  GitCompare,
  Code2,
  ArrowLeftRight,
  Table,
  Regex,
  CaseSensitive,
  AlignLeft,
  BarChart2,
  FileText,
  Link,
  Clock,
  Slash,
  KeyRound,
  Binary,
  Hash,
  ShieldCheck,
  Fingerprint,
  Lock,
  ShieldAlert,
  Key,
  MonitorDot,
  Calendar,
  Timer,
  Palette,
  Network,
  Globe,
  ServerCrash,
  FileType,
  QrCode,
  Database,
  Monitor,
  Image,
  Minimize2,
  GitBranch,
  Layers,
  Package,
  Info,
  Wrench,
} from "lucide-react";
import { TOOLS, type Tool, type Category } from "../lib/registry";
import { useAppStore } from "../lib/store";
import { modKey } from "../lib/platform";


const ICON_MAP: Record<string, React.ComponentType<LucideProps | any>> = {
  Braces,
  GitCompare,
  Code2,
  ArrowLeftRight,
  Table,
  Regex,
  CaseSensitive,
  AlignLeft,
  BarChart2,
  FileText,
  Link,
  Clock,
  Slash,
  KeyRound,
  Binary,
  Hash,
  ShieldCheck,
  Fingerprint,
  Lock,
  ShieldAlert,
  Key,
  MonitorDot,
  Calendar,
  Timer,
  Palette,
  Network,
  Globe,
  ServerCrash,
  FileType,
  QrCode,
  Database,
  Monitor,
  Image,
  Minimize2,
  GitBranch,
  Layers,
  Package,
  Info,
  Shield,
  Wrench,
};

function ToolIcon({ name, size = 13 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Wrench;
  return <Icon size={size} strokeWidth={1.5} />;
}

const CATEGORY_ORDER: Category[] = [
  "JSON",
  "Text",
  "Encoding",
  "Crypto",
  "Binary",
  "Time",
  "Network",
  "Niche",
];

interface SidebarProps {
  onSelectTool: (id: string) => void;
  onOpenPalette: () => void;
}

export function Sidebar({ onSelectTool, onOpenPalette }: SidebarProps) {
  const { activeToolId } = useAppStore();


  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const cat of CATEGORY_ORDER) {
      init[cat] = cat !== "JSON";
    }
    return init;
  });

  function toggleCategory(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }


  const byCategory: Record<string, Tool[]> = {};
  for (const cat of CATEGORY_ORDER) {
    byCategory[cat] = TOOLS.filter((t) => t.category === cat);
  }

  const settingsTools = TOOLS.filter((t) => t.category === "Settings");

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        height: "100%",
        background: "var(--color-panel)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >

      <button
        onClick={onOpenPalette}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "8px 8px 4px",
          padding: "6px 10px",
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          cursor: "pointer",
          color: "var(--color-text-muted)",
          fontSize: 12,
          flexShrink: 0,
          textAlign: "left",
        }}
      >
        <Search size={13} strokeWidth={1.5} />
        <span style={{ flex: 1 }}>Search tools…</span>
        <kbd
          style={{
            fontSize: 10,
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: 3,
            padding: "1px 4px",
            color: "var(--color-text-muted)",
          }}
        >
          {modKey("K")}
        </kbd>
      </button>


      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {CATEGORY_ORDER.map((cat) => {
          const tools = byCategory[cat] ?? [];
          const isCollapsed = collapsed[cat];
          return (
            <div key={cat}>

              <button
                onClick={() => toggleCategory(cat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  width: "100%",
                  padding: "4px 8px 4px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  textAlign: "left",
                }}
              >
                {isCollapsed ? (
                  <ChevronRight size={11} strokeWidth={2} />
                ) : (
                  <ChevronDown size={11} strokeWidth={2} />
                )}
                {cat}
              </button>


              {!isCollapsed &&
                tools.map((tool) => {
                  const isActive = activeToolId === tool.id;
                  return (
                    <ToolRow
                      key={tool.id}
                      tool={tool}
                      isActive={isActive}
                      onClick={() => onSelectTool(tool.id)}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>


      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "4px 0",
          flexShrink: 0,
        }}
      >

        <ToolRow
          tool={{
            id: "__settings__",
            title: "Settings",
            icon: "Settings",
            category: "Settings",
            keywords: [],
            description: "",
            component: () => null,
          }}
          isActive={activeToolId === "__settings__"}
          onClick={() => onSelectTool("__settings__")}
          iconOverride={<Settings size={13} strokeWidth={1.5} />}
        />
        {settingsTools.map((tool) => {
          const isActive = activeToolId === tool.id;
          return (
            <ToolRow
              key={tool.id}
              tool={tool}
              isActive={isActive}
              onClick={() => onSelectTool(tool.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ToolRow({
  tool,
  isActive,
  onClick,
  iconOverride,
}: {
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
  iconOverride?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={tool.description || tool.title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        width: "100%",
        height: 32,
        padding: "0 8px 0 22px",
        background: isActive
          ? "var(--color-accent-muted)"
          : hovered
          ? "var(--color-elevated)"
          : "none",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
        fontSize: 12,
        textAlign: "left",
        transition: "background 100ms, color 100ms",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {iconOverride ?? <ToolIcon name={tool.icon} size={13} />}
      </span>
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: isActive ? 500 : 400,
        }}
      >
        {tool.title}
      </span>
    </button>
  );
}
