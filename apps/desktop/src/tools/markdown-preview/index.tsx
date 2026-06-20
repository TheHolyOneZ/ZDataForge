import { useState, useCallback, useEffect } from "react";
import { markdownToHtml } from "../../lib/ipc";
import { PaneHeader } from "../../components/pane-header";

const SAMPLE = `# ZDataForge

**Offline developer workbench** — no data leaves your machine.

## Features

- JSON formatter, minifier, validator
- Regex tester with live highlights
- JWT decoder + verifier
- Hex viewer
- Code generation (Rust, C#, TypeScript, Go)

\`\`\`rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Example {
    pub id: u64,
    pub name: String,
}
\`\`\`

> Everything stays in RAM. Zero bytes touch the internet.`;

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE);
  const [html, setHtml] = useState("");

  const run = useCallback(async (val: string) => {
    try {
      setHtml(await markdownToHtml(val));
    } catch {

    }
  }, []);

  useEffect(() => {
    run(SAMPLE);

  }, []);

  const inputBytes = new Blob([input]).size;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--color-border)",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <PaneHeader label="MARKDOWN" bytes={inputBytes} />
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            run(e.target.value);
          }}
          style={{
            flex: 1,
            resize: "none",
            background: "var(--color-bg)",
            border: "none",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.55,
            padding: 16,
            outline: "none",
          }}
          className="selectable"
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <PaneHeader label="PREVIEW" />
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            color: "var(--color-text-primary)",
            lineHeight: 1.7,
            fontSize: 14,
            background: "var(--color-bg)",
          }}
          className="selectable markdown-preview-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
