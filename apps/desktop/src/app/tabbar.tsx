import { useState } from "react";
import { X, Plus, Wrench, type LucideProps } from "lucide-react";
import {
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
  Settings,
} from "lucide-react";
import { type Tool } from "../lib/registry";
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
  Settings,
  Wrench,
};

function ToolIcon({ name, size = 12 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Wrench;
  return <Icon size={size} strokeWidth={1.5} />;
}

interface TabBarProps {
  tabs: (Tool & { id: string })[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onOpenPalette: () => void;
}

export function TabBar({ tabs, activeId, onSelect, onClose, onOpenPalette }: TabBarProps) {
  return (
    <div
      style={{
        height: 36,
        background: "var(--color-panel)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          overflowX: "auto",
          overflowY: "hidden",
          flex: 1,

          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeId === tab.id}
            onSelect={() => onSelect(tab.id)}
            onClose={() => onClose(tab.id)}
          />
        ))}
      </div>


      <button
        onClick={onOpenPalette}
        title={`Open tool (${modKey("K")})`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          flexShrink: 0,
          background: "none",
          border: "none",
          borderLeft: "1px solid var(--color-border)",
          cursor: "pointer",
          color: "var(--color-text-muted)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--color-elevated)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
          (e.currentTarget as HTMLButtonElement).style.background = "none";
        }}
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function TabItem({
  tab,
  isActive,
  onSelect,
  onClose,
}: {
  tab: Tool & { id: string };
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="tab"
      aria-selected={isActive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "0 10px 0 10px",
        minWidth: 100,
        maxWidth: 180,
        flexShrink: 0,
        borderRight: "1px solid var(--color-border)",
        cursor: "pointer",
        position: "relative",
        background: isActive ? "var(--color-bg)" : hovered ? "var(--color-elevated)" : "none",
        borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
        boxSizing: "border-box",
      }}
    >

      <button
        onClick={onSelect}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
          color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          minWidth: 0,
        }}
      >
        <span
          style={{
            color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <ToolIcon name={tab.icon} size={12} />
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: isActive ? 500 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tab.title}
        </span>
      </button>


      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title={`Close tab (${modKey("W")})`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          flexShrink: 0,
          background: "none",
          border: "none",
          borderRadius: 3,
          cursor: "pointer",
          color: "var(--color-text-muted)",
          opacity: hovered || isActive ? 1 : 0,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--color-elevated)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "none";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
        }}
      >
        <X size={11} strokeWidth={2} />
      </button>
    </div>
  );
}
