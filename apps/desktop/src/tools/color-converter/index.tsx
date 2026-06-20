import { useState, useEffect } from "react";
import { parseColor, type ColorInfo } from "../../lib/ipc";
import { CopyButton } from "../../components/tool-bits";

const PRESETS = [
  "#7C5CFF",
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#000000",
  "#FFFFFF",
  "#FF6B6B",
];

export default function ColorConverter() {
  const [input, setInput] = useState("#7C5CFF");
  const [result, setResult] = useState<ColorInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      setError("");
      return;
    }
    parseColor(input)
      .then((r) => {
        setResult(r);
        setError("");
      })
      .catch((e) => {
        setError(String(e));
        setResult(null);
      });
  }, [input]);

  const contrastColor = result
    ? result.contrast_on_white >= result.contrast_on_black
      ? "white"
      : "black"
    : "white";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >

      <div
        style={{
          height: 96,
          background: result?.hex ?? "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderBottom: "1px solid var(--color-border)",
          transition: "background var(--duration-base) var(--ease-out)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 20,
            fontWeight: 600,
            color: contrastColor,
            letterSpacing: "0.06em",
            textShadow:
              contrastColor === "white"
                ? "0 1px 2px rgba(0,0,0,0.4)"
                : "0 1px 2px rgba(255,255,255,0.4)",
          }}
        >
          {result?.hex ?? input}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              title={p}
              style={{
                width: 26,
                height: 26,
                background: p,
                borderRadius: "50%",
                border:
                  input.toUpperCase() === p
                    ? "2px solid var(--color-text-primary)"
                    : "1px solid var(--color-border-strong)",
                cursor: "pointer",
                padding: 0,
                transition: "transform var(--duration-base) var(--ease-out)",
              }}
            />
          ))}
          <input
            type="color"
            value={result?.hex ?? "#000000"}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: 32,
              height: 28,
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              background: "var(--color-elevated)",
              cursor: "pointer",
              padding: 2,
            }}
          />
        </div>


        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#hex, rgb(r,g,b), hsl(h,s%,l%)"
          style={{
            background: "var(--color-elevated)",
            border: `1px solid ${
              error ? "var(--color-error)" : "var(--color-border)"
            }`,
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            height: 32,
            padding: "0 12px",
            outline: "none",
            transition: "border-color var(--duration-base) var(--ease-out)",
          }}
          className="selectable"
        />
        {error && (
          <div style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</div>
        )}

        {result && (
          <>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {(
                [
                  ["HEX", result.hex],
                  ["RGB", `rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`],
                  [
                    "HSL",
                    `hsl(${result.hsl.h}°, ${(result.hsl.s * 100).toFixed(1)}%, ${(
                      result.hsl.l * 100
                    ).toFixed(1)}%)`,
                  ],
                  [
                    "OKLCh",
                    `oklch(${result.oklch.l} ${result.oklch.c} ${result.oklch.h}°)`,
                  ],
                ] as [string, string][]
              ).map(([label, val], i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 14px",
                    gap: 12,
                    borderBottom:
                      i === arr.length - 1
                        ? "none"
                        : "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      width: 60,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.4,
                      color: "var(--color-text-muted)",
                      flexShrink: 0,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--color-text-primary)",
                    }}
                    className="selectable"
                  >
                    {val}
                  </span>
                  <CopyButton value={val} variant="ghost" />
                </div>
              ))}
            </div>


            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  color: "var(--color-text-muted)",
                  marginBottom: 8,
                }}
              >
                WCAG CONTRAST
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {(
                  [
                    ["on white", result.contrast_on_white],
                    ["on black", result.contrast_on_black],
                  ] as [string, number][]
                ).map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      background: "var(--color-panel)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {val}:1
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      {(
                        [
                          ["AA", result.aa_normal],
                          ["AA Large", result.aa_large],
                          ["AAA", result.aaa_normal],
                        ] as [string, boolean][]
                      ).map(([badge, pass]) => (
                        <span
                          key={badge}
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: pass
                              ? "rgba(34, 211, 107, 0.12)"
                              : "rgba(255, 75, 75, 0.12)",
                            color: pass
                              ? "var(--color-success)"
                              : "var(--color-error)",
                            border: `1px solid ${
                              pass
                                ? "rgba(34, 211, 107, 0.3)"
                                : "rgba(255, 75, 75, 0.3)"
                            }`,
                            fontWeight: 500,
                          }}
                        >
                          {pass ? "✓" : "✗"} {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
