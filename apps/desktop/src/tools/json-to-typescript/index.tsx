import { useCallback } from "react";
import { CodegenTool, type CodegenOptions } from "../shared/CodegenTool";
import { jsonToTypescript } from "../../lib/ipc";

const SAMPLE = `{
  "user": { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  "tags": ["admin", "beta"],
  "preferences": { "theme": "dark", "notifications": null },
  "createdAt": "2024-03-15T09:23:01Z"
}`;

export default function JsonToTypescript() {
  const convert = useCallback(async (input: string, opts: CodegenOptions) => {
    const res = await jsonToTypescript(input, opts.rootName, {
      casing: opts.casing,
      toggles: opts.toggles,
    });
    return { output: res.output, elapsed_ms: res.elapsed_ms };
  }, []);

  return (
    <CodegenTool
      language="TypeScript"
      outputBadge="TS"
      sample={SAMPLE}
      defaultCasing="camelCase"
      casings={["camelCase", "PascalCase"]}
      toggles={[
        { id: "use-type-alias", label: "Use type alias (vs interface)" },
        { id: "readonly", label: "Readonly fields" },
      ]}
      convert={convert}
      outputPlaceholder="TypeScript interface output…"
    />
  );
}
