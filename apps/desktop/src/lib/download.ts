import { save } from "@tauri-apps/plugin-dialog";
import { writeFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface SaveFilter {
  name: string;
  extensions: string[];
}

export async function saveBinary(
  bytes: Uint8Array,
  defaultName: string,
  filters: SaveFilter[],
): Promise<string | null> {
  const path = await save({ defaultPath: defaultName, filters });
  if (!path) return null;
  await writeFile(path, bytes);
  return path;
}

export async function saveText(
  text: string,
  defaultName: string,
  filters: SaveFilter[],
): Promise<string | null> {
  const path = await save({ defaultPath: defaultName, filters });
  if (!path) return null;
  await writeTextFile(path, text);
  return path;
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
