import { useCallback, useState } from "react";
import { ConvertTool } from "../shared/ConvertTool";
import { csvToJson, jsonToCsv } from "../../lib/ipc";
import { DirectionToggle } from "../shared/DirectionToggle";
import { ToolbarSeparator } from "../../components/toolbar";
import { Segmented } from "../../components/tool-bits";

const SAMPLE_CSV = `id,name,email,verified
42,Alice Chen,alice@example.com,true
43,Bob Singh,bob@example.com,false
44,Carla Diaz,carla@example.com,true`;

const SAMPLE_JSON = `[
  { "id": 42, "name": "Alice Chen", "email": "alice@example.com", "verified": true },
  { "id": 43, "name": "Bob Singh",  "email": "bob@example.com",   "verified": false },
  { "id": 44, "name": "Carla Diaz", "email": "carla@example.com", "verified": true }
]`;

type Delimiter = "," | ";" | "\t";

export default function CsvJson() {
  const [direction, setDirection] = useState<"csv2json" | "json2csv">("csv2json");
  const [header, setHeader] = useState(true);
  const [delimiter, setDelimiter] = useState<Delimiter>(",");

  const preprocessCsv = useCallback(
    (raw: string): string => {
      let working = raw;

      if (delimiter !== ",") {
        working = working.replace(new RegExp(escapeRe(delimiter), "g"), ",");
      }

      if (!header) {
        const firstLine = working.split(/\r?\n/, 1)[0] ?? "";
        const cols = firstLine.split(",").length;
        const synth = Array.from({ length: cols }, (_, i) => `col${i + 1}`).join(",");
        working = `${synth}\n${working}`;
      }
      return working;
    },
    [delimiter, header],
  );

  const convert = useCallback(
    async (input: string) => {
      if (direction === "csv2json") {
        const res = await csvToJson(preprocessCsv(input));
        return { output: res.output, elapsed_ms: res.elapsed_ms };
      }
      const res = await jsonToCsv(input);
      return { output: res.output, elapsed_ms: res.elapsed_ms };
    },
    [direction, preprocessCsv],
  );

  const isCsvToJson = direction === "csv2json";

  return (
    <ConvertTool
      key={direction}
      inputLabel="Input"
      outputLabel="Output"
      inputBadge={isCsvToJson ? "CSV" : "JSON"}
      outputBadge={isCsvToJson ? "JSON" : "CSV"}
      inputLanguage={isCsvToJson ? "text" : "json"}
      outputLanguage={isCsvToJson ? "json" : "text"}
      inputPlaceholder={isCsvToJson ? "name,age\nAlice,30" : '[{"name":"Alice","age":30}]'}
      outputPlaceholder="Output…"
      sample={isCsvToJson ? SAMPLE_CSV : SAMPLE_JSON}
      convert={convert}
      rerunKey={`${direction}|${header}|${delimiter}`}
      emptyHint={isCsvToJson ? "Paste CSV" : "Paste JSON"}
      toolbarLeft={
        <>
          <DirectionToggle
            leftLabel="CSV"
            rightLabel="JSON"
            reversed={!isCsvToJson}
            onToggle={() =>
              setDirection((d) => (d === "csv2json" ? "json2csv" : "csv2json"))
            }
          />
          {isCsvToJson && (
            <>
              <ToolbarSeparator />
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={header}
                  onChange={(e) => setHeader(e.target.checked)}
                  style={{ accentColor: "var(--color-accent)" }}
                />
                Header row
              </label>
              <ToolbarSeparator />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  fontWeight: 600,
                }}
              >
                Delimiter
              </span>
              <Segmented<Delimiter>
                value={delimiter}
                onChange={setDelimiter}
                options={[
                  { value: ",", label: "," },
                  { value: ";", label: ";" },
                  { value: "\t", label: "Tab" },
                ]}
                ariaLabel="Delimiter"
              />
            </>
          )}
        </>
      }
    />
  );
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
