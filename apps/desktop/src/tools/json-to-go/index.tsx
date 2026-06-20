import { useCallback } from "react";
import { CodegenTool, type CodegenOptions } from "../shared/CodegenTool";
import { jsonToGo } from "../../lib/ipc";

const SAMPLE = `{
  "user": { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  "tags": ["admin", "beta"],
  "preferences": { "theme": "dark", "notifications": null },
  "createdAt": "2024-03-15T09:23:01Z"
}`;

export default function JsonToGo() {
  const convert = useCallback(async (input: string, opts: CodegenOptions) => {
    const res = await jsonToGo(input, opts.rootName, {
      casing: opts.casing,
      toggles: opts.toggles,
    });
    return { output: res.output, elapsed_ms: res.elapsed_ms };
  }, []);

  return (
    <CodegenTool
      language="Go"
      outputBadge="GO"
      sample={SAMPLE}
      defaultCasing="PascalCase"
      casings={["PascalCase"]}
      toggles={[
        { id: "json-tags", label: "Include `json:\"...\"` tags", defaultOn: true },
        { id: "pointer-nullable", label: "Use pointers for nullable" },
      ]}
      convert={convert}
      outputPlaceholder="Go struct output…"
    />
  );
}
