import { useCallback, useState } from "react";
import { ConvertTool } from "../shared/ConvertTool";
import { yamlToJson, jsonToYaml } from "../../lib/ipc";
import { DirectionToggle } from "../shared/DirectionToggle";

const SAMPLE_YAML = `user:
  id: 42
  name: Alice Chen
  email: alice@example.com
  verified: true
tags:
  - admin
  - beta
preferences:
  theme: dark
  notifications: null
createdAt: 2024-03-15T09:23:01Z`;

const SAMPLE_JSON = `{
  "user": { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  "tags": ["admin", "beta"],
  "preferences": { "theme": "dark", "notifications": null },
  "createdAt": "2024-03-15T09:23:01Z"
}`;

export default function YamlJson() {
  const [direction, setDirection] = useState<"yaml2json" | "json2yaml">("yaml2json");

  const convert = useCallback(
    async (input: string) => {
      const res =
        direction === "yaml2json" ? await yamlToJson(input) : await jsonToYaml(input);
      return { output: res.output, elapsed_ms: res.elapsed_ms };
    },
    [direction],
  );

  const isYamlToJson = direction === "yaml2json";

  return (
    <ConvertTool
      key={direction }
      inputLabel="Input"
      outputLabel="Output"
      inputBadge={isYamlToJson ? "YAML" : "JSON"}
      outputBadge={isYamlToJson ? "JSON" : "YAML"}
      inputLanguage={isYamlToJson ? "text" : "json"}
      outputLanguage={isYamlToJson ? "json" : "text"}
      inputPlaceholder={isYamlToJson ? "name: Alice\nage: 30" : '{"name":"Alice"}'}
      outputPlaceholder="Output…"
      sample={isYamlToJson ? SAMPLE_YAML : SAMPLE_JSON}
      convert={convert}
      rerunKey={direction}
      emptyHint={isYamlToJson ? "Paste YAML" : "Paste JSON"}
      toolbarLeft={
        <DirectionToggle
          leftLabel="YAML"
          rightLabel="JSON"
          reversed={!isYamlToJson}
          onToggle={() =>
            setDirection((d) => (d === "yaml2json" ? "json2yaml" : "yaml2json"))
          }
        />
      }
    />
  );
}
