

function detectMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  return /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X|Macintosh/i.test(ua);
}

export const IS_MAC = detectMac();


export const MOD_KEY = IS_MAC ? "\u2318" : "Ctrl";


export function modKey(key: string): string {
  return IS_MAC ? `\u2318${key}` : `Ctrl+${key}`;
}


export const GLOBAL_HOTKEY_DISPLAY = IS_MAC
  ? "\u2318+Shift+Space"
  : "Ctrl+Shift+Space";
