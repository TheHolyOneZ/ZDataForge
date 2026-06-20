import { useEffect, useCallback, useState } from "react";
import { Providers } from "./app/providers";
import { Palette } from "./app/palette";
import { Workspace } from "./app/workspace";
import { Settings } from "./app/settings";
import { TitleBar } from "./app/titlebar";
import { Sidebar } from "./app/sidebar";
import { TabBar } from "./app/tabbar";
import { ShortcutsOverlay } from "./components/shortcuts-overlay";
import { useAppStore } from "./lib/store";
import { getToolById, type Tool } from "./lib/registry";
import { modKey } from "./lib/platform";
import { listen } from "@tauri-apps/api/event";
import { LayoutGrid } from "lucide-react";

function AppShell() {
  const {
    paletteOpen,
    setPaletteOpen,
    activeToolId,
    setActiveToolId,
    openToolIds,
    openTool,
    closeTool,
  } = useAppStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const activeTool = activeToolId
    ? activeToolId === "__settings__"
      ? null
      : (getToolById(activeToolId) ?? null)
    : null;
  const isSettings = activeToolId === "__settings__";


  const openTabs = openToolIds
    .map((id) => {
      if (id === "__settings__") {
        return {
          id: "__settings__",
          title: "Settings",
          icon: "Settings",
          category: "Settings" as const,
          keywords: [],
          description: "",
          component: () => null,
        } as Tool & { id: string };
      }
      return getToolById(id) ?? null;
    })
    .filter(Boolean) as (Tool & { id: string })[];

  const openPalette = useCallback(() => setPaletteOpen(true), [setPaletteOpen]);

  const handleSidebarSelect = useCallback(
    (id: string) => {
      openTool(id);
    },
    [openTool]
  );

  const handlePaletteSelect = useCallback(
    (tool: Tool) => {
      openTool(tool.id);
    },
    [openTool]
  );

  const handleCloseTab = useCallback(
    (id: string) => {
      closeTool(id);
    },
    [closeTool]
  );

  const handleTabSelect = useCallback(
    (id: string) => {
      setActiveToolId(id);
    },
    [setActiveToolId]
  );


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (meta && e.key === "w") {
        e.preventDefault();
        if (activeToolId) closeTool(activeToolId);
      }
      if (meta && e.key === ",") {
        e.preventDefault();
        openTool("__settings__");
      }
      if (e.key === "Escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
        } else if (paletteOpen) {
          setPaletteOpen(false);
        }
      }
      if (
        e.key === "?" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setShortcutsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeToolId, paletteOpen, shortcutsOpen, closeTool, openTool, setPaletteOpen]);


  useEffect(() => {
    const unlistenPromise = listen<string>("navigate", (event) => {
      if (event.payload === "settings") openTool("__settings__");
    });
    return () => {
      unlistenPromise.then((f) => f());
    };
  }, [openTool]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      <TitleBar />

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "row" }}>

        <Sidebar onSelectTool={handleSidebarSelect} onOpenPalette={openPalette} />


        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TabBar
            tabs={openTabs}
            activeId={activeToolId}
            onSelect={handleTabSelect}
            onClose={handleCloseTab}
            onOpenPalette={openPalette}
          />


          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {isSettings ? (
              <Settings onClose={() => closeTool("__settings__")} />
            ) : activeTool ? (
              <Workspace tool={activeTool} />
            ) : (
              <EmptyState onOpenPalette={openPalette} />
            )}
          </div>
        </div>
      </div>

      {paletteOpen && <Palette onSelectTool={handlePaletteSelect} />}
      {shortcutsOpen && <ShortcutsOverlay onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}

function EmptyState({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        gap: 16,
      }}
    >
      <LayoutGrid size={40} strokeWidth={1} style={{ opacity: 0.3 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)" }}>
          Pick a tool from the sidebar or press{" "}
          <kbd
            onClick={onOpenPalette}
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              padding: "1px 6px",
              fontSize: 12,
              cursor: "pointer",
              color: "var(--color-accent)",
            }}
          >
            {modKey("K")}
          </kbd>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <AppShell />
    </Providers>
  );
}
