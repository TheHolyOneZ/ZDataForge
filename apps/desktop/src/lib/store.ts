import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GLOBAL_HOTKEY_DISPLAY } from "./platform";

export type Theme = "dark" | "light" | "system";
export type Density = "compact" | "comfortable";

interface AppState {

  theme: Theme;
  density: Density;
  accentColor: string;
  historyEnabled: boolean;
  hotkey: string;


  paletteOpen: boolean;
  activeToolId: string | null;
  openToolIds: string[];
  recentToolIds: string[];


  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setAccentColor: (color: string) => void;
  setHistoryEnabled: (enabled: boolean) => void;
  setPaletteOpen: (open: boolean) => void;
  setActiveToolId: (id: string | null) => void;
  openTool: (id: string) => void;
  closeTool: (id: string) => void;
  pushRecentTool: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      density: "compact",
      accentColor: "#7C5CFF",
      historyEnabled: false,
      hotkey: GLOBAL_HOTKEY_DISPLAY,
      paletteOpen: false,
      activeToolId: null,
      openToolIds: [],
      recentToolIds: [],
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setAccentColor: (color) => set({ accentColor: color }),
      setHistoryEnabled: (enabled) => set({ historyEnabled: enabled }),
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      setActiveToolId: (id) => set({ activeToolId: id }),
      openTool: (id) =>
        set((s) => ({
          openToolIds: s.openToolIds.includes(id) ? s.openToolIds : [...s.openToolIds, id],
          activeToolId: id,
          recentToolIds: [id, ...s.recentToolIds.filter((r) => r !== id)].slice(0, 8),
        })),
      closeTool: (id) =>
        set((s) => {
          const idx = s.openToolIds.indexOf(id);
          const next = s.openToolIds.filter((t) => t !== id);
          let nextActive: string | null = s.activeToolId;
          if (s.activeToolId === id) {

            if (next.length === 0) {
              nextActive = null;
            } else if (idx > 0) {
              nextActive = next[idx - 1];
            } else {
              nextActive = next[0];
            }
          }
          return { openToolIds: next, activeToolId: nextActive };
        }),
      pushRecentTool: (id) =>
        set((s) => ({
          recentToolIds: [id, ...s.recentToolIds.filter((r) => r !== id)].slice(0, 8),
        })),
    }),
    {
      name: "zdataforge-settings",
      partialize: (s) => ({
        theme: s.theme,
        density: s.density,
        accentColor: s.accentColor,
        historyEnabled: s.historyEnabled,
        hotkey: s.hotkey,
        recentToolIds: s.recentToolIds,

      }),
    }
  )
);
