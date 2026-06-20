import { Suspense } from "react";
import { type Tool } from "../lib/registry";

interface WorkspaceProps {
  tool: Tool;
}

export function Workspace({ tool }: WorkspaceProps) {
  const ToolComponent = tool.component;

  return (
    <div
      role="main"
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          background: "var(--color-panel)",
        }}
      >
        <h1
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
            flex: 1,
          }}
        >
          {tool.title}
        </h1>
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
          }}
        >
          {tool.description}
        </span>
      </div>


      <div
        style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <Suspense
          fallback={
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                fontSize: 13,
              }}
            >
              Loading…
            </div>
          }
        >
          <ToolComponent />
        </Suspense>
      </div>


      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "4px 16px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-panel)",
          fontSize: 11,
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
      >
        <span style={{ marginLeft: "auto" }}>{tool.category}</span>
      </div>
    </div>
  );
}
