import { useCallback } from "react";
import { CodegenTool, type CodegenOptions } from "../shared/CodegenTool";
import { jsonToRust } from "../../lib/ipc";

const SAMPLE = `{
  "user": { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  "tags": ["admin", "beta"],
  "preferences": { "theme": "dark", "notifications": null },
  "createdAt": "2024-03-15T09:23:01Z"
}`;

export default function JsonToRust() {
  const convert = useCallback(async (input: string, opts: CodegenOptions) => {
    const res = await jsonToRust(input, opts.rootName, {
      casing: opts.casing,
      toggles: opts.toggles,
    });
    return { output: res.output, elapsed_ms: res.elapsed_ms };
  }, []);

  return (
    <CodegenTool
      language="Rust"
      outputBadge="RUST"
      sample={SAMPLE}
      defaultCasing="PascalCase"
      casings={["PascalCase"]}
      toggles={[
        { id: "derive-debug-clone", label: "#[derive(Debug, Clone)]", defaultOn: true },
        { id: "derive-serde", label: "derive Serialize/Deserialize", defaultOn: true },
        { id: "use-option", label: "Use Option<T> for nullable", defaultOn: true },
      ]}
      convert={convert}
      outputPlaceholder="Rust struct output…"
    />
  );
}
