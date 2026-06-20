import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../lib/store";
import { searchTools, TOOLS, type Tool } from "../lib/registry";
import * as Icons from "lucide-react";
import { Search, X } from "lucide-react";

type LucideIconName = keyof typeof Icons;

function ToolIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = Icons[name as LucideIconName] as
    | React.ComponentType<{ size: number; strokeWidth: number }>
    | undefined;
  if (!Icon) return <Icons.Wrench size={size} strokeWidth={1.5} />;
  return <Icon size={size} strokeWidth={1.5} />;
}

interface PaletteProps {
  onSelectTool: (tool: Tool) => void;
}

export function Palette({ onSelectTool }: PaletteProps) {
  const { paletteOpen, setPaletteOpen, recentToolIds } = useAppStore();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? searchTools(query)
    : [
        ...(recentToolIds
          .map((id) => TOOLS.find((t) => t.id === id))
          .filter(Boolean) as Tool[]),
        ...TOOLS.filter((t) => !recentToolIds.includes(t.id)),
      ];

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [paletteOpen]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      if (results[cursor]) {
        select(results[cursor]);
      }
    } else if (e.key === "Escape") {
      setPaletteOpen(false);
    }
  }

  function select(tool: Tool) {
    setPaletteOpen(false);
    onSelectTool(tool);
  }

  if (!paletteOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
      }}
      onClick={() => setPaletteOpen(false)}
    >
      <div
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        style={{
          width: 560,
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-border)",
            gap: 10,
          }}
        >
          <Search
            size={16}
            strokeWidth={1.5}
            style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search tools…"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="palette-listbox"
            aria-autocomplete="list"
            aria-activedescendant={results[cursor] ? `palette-option-${results[cursor].id}` : undefined}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--color-text-primary)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          )}
          <kbd
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              padding: "1px 6px",
            }}
          >
            esc
          </kbd>
        </div>


        <div id="palette-listbox" role="listbox" aria-label="Tools" style={{ maxHeight: 360, overflowY: "auto" }}>
          {results.length === 0 && (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: 13,
              }}
            >
              No tools match &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((tool, i) => (
            <button
              key={tool.id}
              id={`palette-option-${tool.id}`}
              role="option"
              aria-selected={i === cursor}
              onClick={() => select(tool)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                background: i === cursor ? "var(--color-accent-muted)" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                borderLeft:
                  i === cursor
                    ? "2px solid var(--color-accent)"
                    : "2px solid transparent",
              }}
            >
              <span
                style={{
                  color:
                    i === cursor
                      ? "var(--color-accent)"
                      : "var(--color-text-secondary)",
                  display: "flex",
                }}
              >
                <ToolIcon name={tool.icon} size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {tool.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginTop: 1,
                  }}
                >
                  {tool.description}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  background: "var(--color-panel)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                {tool.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
