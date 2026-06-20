import { useCallback } from "react";
import { ConvertTool } from "../shared/ConvertTool";
import { formatSql } from "../../lib/ipc";

export default function SqlFormatter() {
  const convert = useCallback(async (input: string) => {
    const output = await formatSql(input, 2);
    return { output, elapsedMs: 0 };
  }, []);
  return (
    <ConvertTool
      inputLanguage="text"
      outputLanguage="text"
      inputPlaceholder="SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.name ORDER BY count DESC"
      outputPlaceholder="Formatted SQL…"
      convert={convert}
      inputLabel="SQL INPUT"
      outputLabel="FORMATTED SQL"
    />
  );
}
