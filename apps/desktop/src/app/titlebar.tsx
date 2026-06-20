import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Minimize2, Maximize2, X } from "lucide-react";
import appIcon from "../assets/icon.png";
import { IS_MAC } from "../lib/platform";

export function TitleBar() {
  const win = getCurrentWebviewWindow();

  return (
    <div
      data-tauri-drag-region
      style={
        {
          height: 36,
          display: "flex",
          alignItems: "center",
          background: "var(--color-panel)",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          WebkitAppRegion: "drag",
        } as React.CSSProperties
      }
    >
      {IS_MAC && (
        <div
          style={
            {
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              WebkitAppRegion: "no-drag",
            } as React.CSSProperties
          }
        >
          <MacBtn
            color="#FF5F57"
            onClick={() => win.hide()}
            title="Hide (stays in tray)"
            ariaLabel="Hide to tray"
          />
          <MacBtn
            color="#FEBC2E"
            onClick={() => win.minimize()}
            title="Minimize"
            ariaLabel="Minimize window"
          />
          <MacBtn
            color="#28C840"
            onClick={() => win.toggleMaximize()}
            title="Maximize"
            ariaLabel="Maximize window"
          />
        </div>
      )}


      <div
        style={
          {
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            WebkitAppRegion: "drag",
          } as React.CSSProperties
        }
      >
        <img
          src={appIcon}
          alt=""
          width={18}
          height={18}
          style={{
            borderRadius: 4,
            display: "block",

            ...({ WebkitUserDrag: "none" } as React.CSSProperties),
          }}
          draggable={false}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            letterSpacing: "0.05em",
          }}
        >
          ZDATAFORGE
        </span>
      </div>

      <div style={{ flex: 1 }} data-tauri-drag-region />


      {!IS_MAC && (
        <div style={{ display: "flex", WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <WinBtn onClick={() => win.minimize()} title="Minimize" ariaLabel="Minimize window">
            <Minimize2 size={12} />
          </WinBtn>
          <WinBtn onClick={() => win.toggleMaximize()} title="Maximize" ariaLabel="Maximize window">
            <Maximize2 size={12} />
          </WinBtn>
          <WinBtn onClick={() => win.hide()} title="Hide (stays in tray)" ariaLabel="Hide to tray" danger>
            <X size={12} />
          </WinBtn>
        </div>
      )}
    </div>
  );
}

function MacBtn({
  color,
  onClick,
  title,
  ariaLabel,
}: {
  color: string;
  onClick: () => void;
  title: string;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={
        {
          width: 12,
          height: 12,
          padding: 0,
          borderRadius: "50%",
          background: color,
          border: "1px solid rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          display: "block",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties
      }
    />
  );
}

function WinBtn({
  onClick,
  title,
  ariaLabel,
  danger,
  children,
}: {
  onClick: () => void;
  title: string;
  ariaLabel: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={
        {
          width: 40,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          WebkitAppRegion: "no-drag",
          transition: "background 150ms, color 150ms",
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = danger ? "#FF4B4B22" : "var(--color-elevated)";
        if (danger) btn.style.color = "#FF4B4B";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = "none";
        btn.style.color = "var(--color-text-muted)";
      }}
    >
      {children}
    </button>
  );
}
