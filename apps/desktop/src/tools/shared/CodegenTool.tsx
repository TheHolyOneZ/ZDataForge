import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Editor } from "../../components/editor";
import { Toolbar } from "../../components/toolbar";
import { PaneHeader } from "../../components/pane-header";
import { StatusBar } from "../../components/status-bar";
import {
  CopyButton,
  PasteButton,
  ClearButton,
  SampleButton,
  ErrorBanner,
  EmptyHint,
} from "../../components/tool-bits";

type Casing = "PascalCase" | "camelCase" | "snake_case";

export interface CodegenOptions {
  rootName: string;
  casing: Casing;

  toggles: Record<string, boolean>;
}

interface ToggleSpec {
  id: string;
  label: string;
  defaultOn?: boolean;
  hint?: string;
}

interface CodegenToolProps {
  language: string;

  outputBadge: string;

  outputIcon?: ReactNode;

  sample: string;

  casings?: Casing[];
  defaultCasing: Casing;

  toggles?: ToggleSpec[];

  convert: (input: string, opts: CodegenOptions) => Promise<{ output: string; elapsed_ms?: number }>;
  outputPlaceholder?: string;
}

const CASING_OPTIONS: { value: Casing; label: string }[] = [
  { value: "PascalCase", label: "PascalCase" },
  { value: "camelCase", label: "camelCase" },
  { value: "snake_case", label: "snake_case" },
];

export function CodegenTool({
  language,
  outputBadge,
  outputIcon,
  sample,
  casings = ["PascalCase", "camelCase", "snake_case"],
  defaultCasing,
  toggles = [],
  convert,
  outputPlaceholder = "Generated code appears here…",
}: CodegenToolProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);

  const initialToggles = toggles.reduce<Record<string, boolean>>((acc, t) => {
    acc[t.id] = !!t.defaultOn;
    return acc;
  }, {});
  const [opts, setOpts] = useState<CodegenOptions>({
    rootName: "Root",
    casing: defaultCasing,
    toggles: initialToggles,
  });

  const latestInputRef = useRef(input);
  latestInputRef.current = input;
  const latestOptsRef = useRef(opts);
  latestOptsRef.current = opts;

  const run = useCallback(
    async (val: string, o: CodegenOptions) => {
      if (!val.trim()) {
        setOutput("");
        setError("");
        setElapsed(null);
        return;
      }
      try {
        const res = await convert(val, o);
        setOutput(res.output);
        setError("");
        setElapsed(res.elapsed_ms ?? null);
      } catch (e) {
        setError(String(e));
        setOutput("");
        setElapsed(null);
      }
    },
    [convert],
  );


  useEffect(() => {
    if (latestInputRef.current.trim()) {
      run(latestInputRef.current, opts);
    }

  }, [opts.rootName, opts.casing, JSON.stringify(opts.toggles)]);

  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;
  const availableCasings = CASING_OPTIONS.filter((c) => casings.includes(c.value));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Toolbar
        left={
          <span
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            JSON → {language}
          </span>
        }
        right={
          <>
            <PasteButton
              onPaste={(t) => {
                setInput(t);
                run(t, opts);
              }}
            />
            <CopyButton value={output} label="Copy code" />
            <ClearButton
              onClick={() => {
                setInput("");
                setOutput("");
                setError("");
                setElapsed(null);
              }}
              disabled={!input && !output}
            />
            <SampleButton
              onClick={() => {
                setInput(sample);
                run(sample, opts);
              }}
              label="Load Sample"
            />
          </>
        }
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: optionsOpen ? "1fr 1fr 240px" : "1fr 1fr 32px",
          overflow: "hidden",
          minHeight: 0,
          transition: "grid-template-columns var(--duration-base) var(--ease-out)",
        }}
      >

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader label="JSON Input" badge="JSON" bytes={inputBytes} />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <Editor
              value={input}
              onChange={(v) => {
                setInput(v);
                run(v, opts);
              }}
              language="json"
              placeholder={`{"name":"Alice","age":30}`}
            />
            {!input && <EmptyHint text="Paste JSON" />}
          </div>
        </div>


        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--color-border)",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <PaneHeader
            label={`${language} Output`}
            badge={outputBadge}
            bytes={outputBytes}
            right={outputIcon}
          />
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {error && <ErrorBanner message={error} />}
            <div
              style={{
                position: error ? "absolute" : "relative",
                inset: 0,
                opacity: error ? 0.3 : 1,
                overflow: "hidden",
                zIndex: error ? 0 : 1,
              }}
            >
              <Editor
                value={output}
                language="text"
                readOnly
                placeholder={outputPlaceholder}
              />
            </div>
          </div>
        </div>


        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--color-panel)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 28,
              padding: "0 8px 0 6px",
              borderBottom: "1px solid var(--color-border)",
              cursor: "pointer",
              userSelect: "none",
              color: "var(--color-text-secondary)",
              fontSize: 12,
            }}
            onClick={() => setOptionsOpen((v) => !v)}
            role="button"
            aria-expanded={optionsOpen}
          >
            {optionsOpen ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            )}
            {optionsOpen && (
              <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                Options
              </span>
            )}
          </div>
          {optionsOpen && (
            <div
              style={{
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                overflow: "auto",
              }}
            >
              <Field label="Root type name">
                <input
                  type="text"
                  value={opts.rootName}
                  onChange={(e) =>
                    setOpts((s) => ({ ...s, rootName: e.target.value || "Root" }))
                  }
                  style={{
                    height: 26,
                    background: "var(--color-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 4,
                    color: "var(--color-text-primary)",
                    fontSize: 12,
                    padding: "0 8px",
                    fontFamily: "var(--font-mono)",
                    width: "100%",
                  }}
                />
              </Field>

              {availableCasings.length > 1 && (
                <Field label="Naming">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: 2,
                      background: "var(--color-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 4,
                      gap: 1,
                    }}
                  >
                    {availableCasings.map((c) => {
                      const active = opts.casing === c.value;
                      return (
                        <button
                          key={c.value}
                          onClick={() => setOpts((s) => ({ ...s, casing: c.value }))}
                          style={{
                            textAlign: "left",
                            background: active
                              ? "var(--color-accent-muted)"
                              : "transparent",
                            color: active
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                            border: "none",
                            borderRadius: 3,
                            padding: "5px 8px",
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            cursor: "pointer",
                          }}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}

              {toggles.length > 0 && (
                <Field label="Generation">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {toggles.map((t) => (
                      <label
                        key={t.id}
                        title={t.hint}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "var(--color-text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={opts.toggles[t.id] ?? false}
                          onChange={(e) =>
                            setOpts((s) => ({
                              ...s,
                              toggles: { ...s.toggles, [t.id]: e.target.checked },
                            }))
                          }
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </Field>
              )}
            </div>
          )}
        </div>
      </div>

      <StatusBar
        latencyMs={elapsed ?? undefined}
        inputBytes={inputBytes}
        outputBytes={outputBytes}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: "var(--color-text-muted)",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
