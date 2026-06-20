import { useCallback, useState } from "react";
import { ConvertTool } from "../shared/ConvertTool";
import { tomlToJson, jsonToToml } from "../../lib/ipc";
import { DirectionToggle } from "../shared/DirectionToggle";

const SAMPLE_TOML = `title = "ZDataForge config"

[user]
id = 42
name = "Alice Chen"
verified = true

[preferences]
theme = "dark"
tags = ["admin", "beta"]`;

const SAMPLE_JSON = `{
  "title": "ZDataForge config",
  "user": { "id": 42, "name": "Alice Chen", "verified": true },
  "preferences": { "theme": "dark", "tags": ["admin", "beta"] }
}`;

export default function TomlJson() {
  const [direction, setDirection] = useState<"toml2json" | "json2toml">("toml2json");

  const convert = useCallback(
    async (input: string) => {
      const res =
        direction === "toml2json" ? await tomlToJson(input) : await jsonToToml(input);
      return { output: res.output, elapsed_ms: res.elapsed_ms };
    },
    [direction],
  );

  const isTomlToJson = direction === "toml2json";

  return (
    <ConvertTool
      key={direction}
      inputLabel="Input"
      outputLabel="Output"
      inputBadge={isTomlToJson ? "TOML" : "JSON"}
      outputBadge={isTomlToJson ? "JSON" : "TOML"}
      inputLanguage={isTomlToJson ? "text" : "json"}
      outputLanguage={isTomlToJson ? "json" : "text"}
      inputPlaceholder={
        isTomlToJson ? '[package]\nname = "myapp"' : '{"package":{"name":"myapp"}}'
      }
      outputPlaceholder="Output…"
      sample={isTomlToJson ? SAMPLE_TOML : SAMPLE_JSON}
      convert={convert}
      rerunKey={direction}
      emptyHint={isTomlToJson ? "Paste TOML" : "Paste JSON"}
      toolbarLeft={
        <DirectionToggle
          leftLabel="TOML"
          rightLabel="JSON"
          reversed={!isTomlToJson}
          onToggle={() =>
            setDirection((d) => (d === "toml2json" ? "json2toml" : "toml2json"))
          }
        />
      }
    />
  );
}
