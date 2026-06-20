import { type ReactNode, useEffect } from "react";
import { useAppStore } from "../lib/store";

interface Props {
  children: ReactNode;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (expanded.length !== 6) return hex;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveTheme(theme: "dark" | "light" | "system"): "dark" | "light" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function Providers({ children }: Props) {
  const accentColor = useAppStore((s) => s.accentColor);
  const theme = useAppStore((s) => s.theme);
  const density = useAppStore((s) => s.density);


  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", accentColor);
    root.style.setProperty("--color-accent-muted", hexToRgba(accentColor, 0.15));
  }, [accentColor]);


  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme);
    };
    apply();
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [theme]);


  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  return <>{children}</>;
}
