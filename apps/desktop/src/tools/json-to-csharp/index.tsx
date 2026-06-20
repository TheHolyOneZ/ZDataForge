import { useCallback } from "react";
import { CodegenTool, type CodegenOptions } from "../shared/CodegenTool";
import { jsonToCsharp } from "../../lib/ipc";

const SAMPLE = `{
  "user": { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  "tags": ["admin", "beta"],
  "preferences": { "theme": "dark", "notifications": null },
  "createdAt": "2024-03-15T09:23:01Z"
}`;

export default function JsonToCsharp() {
  const convert = useCallback(async (input: string, opts: CodegenOptions) => {
    const res = await jsonToCsharp(input, opts.rootName, {
      casing: opts.casing,
      toggles: opts.toggles,
    });
    return { output: res.output, elapsed_ms: res.elapsed_ms };
  }, []);

  return (
    <CodegenTool
      language="C#"
      outputBadge="C#"
      sample={SAMPLE}
      defaultCasing="PascalCase"
      casings={["PascalCase"]}
      toggles={[
        { id: "nullable-annotations", label: "Nullable annotations (?)", defaultOn: true },
        { id: "use-record", label: "Use record instead of class" },
      ]}
      convert={convert}
      outputPlaceholder="C# class output…"
    />
  );
}
