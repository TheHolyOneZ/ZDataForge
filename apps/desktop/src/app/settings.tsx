import { X, Palette, Lock, Keyboard, Check, Settings as SettingsIcon } from "lucide-react";
import { useAppStore, type Theme, type Density } from "../lib/store";
import { modKey, GLOBAL_HOTKEY_DISPLAY } from "../lib/platform";

interface SettingsProps {
  onClose: () => void;
}

const ACCENT_PRESETS = [
  { name: "Violet", value: "#7C5CFF" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Green", value: "#22C55E" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Rose", value: "#F43F5E" },
];

export function Settings({ onClose }: SettingsProps) {
  const store = useAppStore();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 24px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <SettingsIcon size={16} strokeWidth={1.5} style={{ color: "var(--color-accent)" }} />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            flex: 1,
            letterSpacing: "-0.005em",
          }}
        >
          Settings
        </span>
        <button
          onClick={onClose}
          title="Close (Esc)"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
          }}
        >
          <X size={14} />
        </button>
      </div>


      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "28px 24px 48px",
          }}
        >

          <Section
            icon={<Palette size={13} strokeWidth={1.5} />}
            label="Appearance"
            description="Theme, accent color, and information density."
          >
            <Field label="Theme" help="Window chrome and panel colors.">
              <select
                value={store.theme}
                onChange={(e) => store.setTheme(e.target.value as Theme)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">Match system</option>
              </select>
            </Field>

            <Divider />

            <Field
              label="Density"
              help="Compact packs more onto the screen; comfortable adds breathing room."
            >
              <select
                value={store.density}
                onChange={(e) => store.setDensity(e.target.value as Density)}
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
              </select>
            </Field>

            <Divider />

            <Field
              label="Accent color"
              help="Used for highlights, focus rings, and active states."
              align="flex-start"
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {ACCENT_PRESETS.map((p) => {
                  const selected =
                    store.accentColor.toLowerCase() === p.value.toLowerCase();
                  return (
                    <button
                      key={p.value}
                      title={p.name}
                      onClick={() => store.setAccentColor(p.value)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: p.value,
                        border: selected
                          ? "2px solid var(--color-text-primary)"
                          : "2px solid transparent",
                        boxShadow: selected ? `0 0 0 2px ${p.value}55` : "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        transition: "transform var(--duration-fast) var(--ease-out)",
                      }}
                    >
                      {selected && <Check size={12} color="white" strokeWidth={3} />}
                    </button>
                  );
                })}

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginLeft: 4,
                    cursor: "pointer",
                  }}
                  title="Custom color"
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1px dashed var(--color-border-strong)",
                      background: `conic-gradient(from 0deg, #ff4b4b, #f59e0b, #22c55e, #06b6d4, #7c5cff, #f43f5e, #ff4b4b)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <input
                      type="color"
                      value={store.accentColor}
                      onChange={(e) => store.setAccentColor(e.target.value)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {store.accentColor.toUpperCase()}
                  </span>
                </label>
              </div>
            </Field>
          </Section>


          <Section
            icon={<Lock size={13} strokeWidth={1.5} />}
            label="Privacy & History"
            description="Everything stays on your machine. History is strictly opt-in."
          >
            <Field
              label="Input history"
              help="Persist recent inputs per-tool to a local file. Off by default."
            >
              <Toggle
                checked={store.historyEnabled}
                onChange={store.setHistoryEnabled}
                label={store.historyEnabled ? "Enabled" : "Disabled"}
              />
            </Field>

            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: 4,
                  fontSize: 12,
                }}
              >
                What gets stored?
              </div>
              All inputs and outputs live in RAM and vanish on close. The only things
              persisted between sessions are the settings on this page (and your history
              file, if enabled). Nothing ever leaves your machine.
            </div>
          </Section>


          <Section
            icon={<Keyboard size={13} strokeWidth={1.5} />}
            label="Keyboard"
            description="Global shortcuts for launching the workbench."
          >
            <Field label="Global hotkey" help="Show or hide ZDataForge from anywhere.">
              <Kbd>{GLOBAL_HOTKEY_DISPLAY}</Kbd>
            </Field>

            <Divider />

            <Field label="Command palette" help="Search and jump to any tool.">
              <Kbd>{modKey("K")}</Kbd>
            </Field>

            <Divider />

            <Field label="Close current tab" help="Closes the focused workspace tab.">
              <Kbd>{modKey("W")}</Kbd>
            </Field>

            <Divider />

            <Field label="Open settings" help="Bring up this panel.">
              <Kbd>{modKey(",")}</Kbd>
            </Field>
          </Section>
        </div>
      </div>
    </div>
  );
}


function Section({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span style={{ color: "var(--color-accent)", display: "flex" }}>{icon}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.005em",
          }}
        >
          {label}
        </span>
      </div>
      {description && (
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
      <div
        style={{
          background: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "4px 16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  help,
  children,
  align = "center",
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
  align?: "center" | "flex-start";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: align,
        gap: 16,
        padding: "14px 0",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: help ? 2 : 0,
          }}
        >
          {label}
        </div>
        {help && (
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              lineHeight: 1.4,
            }}
          >
            {help}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--color-border)" }} />;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        style={{
          width: 34,
          height: 20,
          borderRadius: 999,
          background: checked ? "var(--color-accent)" : "var(--color-elevated)",
          border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-border-strong)"}`,
          position: "relative",
          transition: "background var(--duration-fast) var(--ease-out)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: checked ? 15 : 1,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "white",
            transition: "left var(--duration-fast) var(--ease-out)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        />
      </span>
      {label && (
        <span
          style={{
            fontSize: 12,
            color: checked ? "var(--color-text-primary)" : "var(--color-text-muted)",
            minWidth: 56,
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--color-text-secondary)",
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border-strong)",
        borderRadius: "var(--radius-sm)",
        padding: "3px 8px",
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </span>
  );
}
