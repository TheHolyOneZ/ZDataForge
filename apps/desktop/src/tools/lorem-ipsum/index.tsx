import { useState, useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { loremIpsum } from "../../lib/ipc";
import { Toolbar, ToolbarSeparator } from "../../components/toolbar";
import { Button } from "../../components/button";
import { CopyButton } from "../../components/tool-bits";

export default function LoremIpsum() {
  const [output, setOutput] = useState("");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(5);

  const generate = useCallback(async (p: number, s: number) => {
    try {
      setOutput(await loremIpsum(p, s));
    } catch {

    }
  }, []);

  useEffect(() => {
    generate(paragraphs, sentences);

  }, []);

  const numberInputStyle: React.CSSProperties = {
    width: 56,
    height: 26,
    background: "var(--color-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: 4,
    color: "var(--color-text-primary)",
    fontSize: 12,
    padding: "0 8px",
    outline: "none",
    fontFamily: "var(--font-mono)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Toolbar
        left={
          <>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            >
              Paragraphs
              <input
                type="number"
                value={paragraphs}
                min={1}
                max={20}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setParagraphs(v);
                  generate(v, sentences);
                }}
                style={numberInputStyle}
              />
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            >
              Sentences/para
              <input
                type="number"
                value={sentences}
                min={1}
                max={15}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSentences(v);
                  generate(paragraphs, v);
                }}
                style={numberInputStyle}
              />
            </label>
            <ToolbarSeparator />
            <Button
              variant="primary"
              onClick={() => generate(paragraphs, sentences)}
              icon={<RefreshCw size={13} />}
            >
              Generate
            </Button>
          </>
        }
        right={<CopyButton value={output} disabled={!output} />}
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 24,
          lineHeight: 1.8,
          color: "var(--color-text-secondary)",
          fontSize: 14,
          whiteSpace: "pre-wrap",
        }}
        className="selectable"
      >
        {output || (
          <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>
            Click Generate to produce lorem ipsum text
          </span>
        )}
      </div>
    </div>
  );
}
