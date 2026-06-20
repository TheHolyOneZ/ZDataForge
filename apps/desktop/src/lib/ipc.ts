import { invoke } from "@tauri-apps/api/core";

export interface FormatJsonRequest {
  input: string;
  indent?: number;
}

export interface FormatJsonResponse {
  output: string;
  byte_count: number;
  elapsed_ms: number;
}

export async function formatJson(input: string, indent = 2): Promise<FormatJsonResponse> {
  return invoke<FormatJsonResponse>("format_json", { req: { input, indent } });
}

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}


export interface CodegenRequest {
  input: string;
  rootName?: string;
}

export interface CodegenResponse {
  output: string;
  elapsed_ms: number;
}

export interface JsonDiffLine {
  kind: "added" | "removed" | "unchanged";
  content: string;
}

export interface JsonDiffResponse {
  diff: JsonDiffLine[];
  elapsed_ms: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value_type?: string;
}


export async function validateJson(input: string): Promise<ValidationResult> {
  return invoke<ValidationResult>("validate_json", { input });
}

export async function sortJsonKeys(input: string): Promise<FormatJsonResponse> {
  return invoke<FormatJsonResponse>("sort_json_keys", { input });
}

export async function jsonDiff(left: string, right: string): Promise<JsonDiffResponse> {
  return invoke<JsonDiffResponse>("json_diff", { left, right });
}


export type CodegenCasing = "PascalCase" | "camelCase" | "snake_case";

export interface CodegenExtras {
  casing?: CodegenCasing;
  toggles?: Record<string, boolean>;
}

export async function jsonToRust(
  input: string,
  rootName = "Root",
  extras: CodegenExtras = {},
): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_rust", {
    req: { input, rootName, casing: extras.casing, toggles: extras.toggles ?? {} },
  });
}

export async function jsonToCsharp(
  input: string,
  rootName = "Root",
  extras: CodegenExtras = {},
): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_csharp", {
    req: { input, rootName, casing: extras.casing, toggles: extras.toggles ?? {} },
  });
}

export async function jsonToTypescript(
  input: string,
  rootName = "Root",
  extras: CodegenExtras = {},
): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_typescript", {
    req: { input, rootName, casing: extras.casing, toggles: extras.toggles ?? {} },
  });
}

export async function jsonToGo(
  input: string,
  rootName = "Root",
  extras: CodegenExtras = {},
): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_go", {
    req: { input, rootName, casing: extras.casing, toggles: extras.toggles ?? {} },
  });
}


export async function yamlToJson(input: string): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("yaml_to_json", { input });
}

export async function jsonToYaml(input: string): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_yaml", { input });
}

export async function tomlToJson(input: string): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("toml_to_json", { input });
}

export async function jsonToToml(input: string): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_toml", { input });
}

export async function csvToJson(input: string): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("csv_to_json", { input });
}

export async function jsonToCsv(input: string): Promise<CodegenResponse> {
  return invoke<CodegenResponse>("json_to_csv", { input });
}


export interface CaseConvertResponse {
  snake: string;
  camel: string;
  pascal: string;
  kebab: string;
  screaming: string;
  title: string;
  train: string;
}

export interface TextStats {
  chars: number;
  chars_no_space: number;
  words: number;
  lines: number;
  bytes: number;
  reading_time_sec: number;
}

export interface RegexMatch {
  start: number;
  end: number;
  text: string;
  groups: (string | null)[];
}

export interface RegexResult {
  matches: RegexMatch[];
  match_count: number;
  replaced: string | null;
  elapsed_ms: number;
}

export interface DiffLine {
  kind: string;
  content: string;
}

export interface CronResult {
  description: string;
  next_firings: string[];
}

export async function convertCase(input: string): Promise<CaseConvertResponse> {
  return invoke("convert_case", { input });
}

export async function sortLines(input: string, descending = false): Promise<string> {
  return invoke("sort_lines", { input, descending });
}

export async function deduplicateLines(input: string, caseSensitive = true): Promise<string> {
  return invoke("deduplicate_lines", { input, caseSensitive });
}

export async function reverseLines(input: string): Promise<string> {
  return invoke("reverse_lines", { input });
}

export async function numberLines(input: string, start = 1): Promise<string> {
  return invoke("number_lines", { input, start });
}

export async function trimLines(input: string, mode = "both"): Promise<string> {
  return invoke("trim_lines", { input, mode });
}

export async function filterLines(
  input: string,
  pattern: string,
  invert = false,
): Promise<string> {
  return invoke("filter_lines", { input, pattern, invert });
}

export async function countText(input: string): Promise<TextStats> {
  return invoke("count_text", { input });
}

export async function testRegex(
  pattern: string,
  flags: string,
  input: string,
  replacement?: string,
): Promise<RegexResult> {
  return invoke("test_regex", { pattern, flags, input, replacement });
}

export async function textDiff(left: string, right: string): Promise<DiffLine[]> {
  return invoke("text_diff", { left, right });
}

export async function escapeString(input: string, mode: string): Promise<string> {
  return invoke("escape_string", { input, mode });
}

export async function unescapeString(input: string, mode: string): Promise<string> {
  return invoke("unescape_string", { input, mode });
}

export async function loremIpsum(paragraphs = 3, sentencesPerPara = 5): Promise<string> {
  return invoke("lorem_ipsum", { paragraphs, sentencesPerPara });
}

export async function generateSlug(input: string, separator = "-"): Promise<string> {
  return invoke("generate_slug", { input, separator });
}

export async function parseCron(expression: string): Promise<CronResult> {
  return invoke("parse_cron", { expression });
}

export async function markdownToHtml(input: string): Promise<string> {
  return invoke("markdown_to_html", { input });
}


export interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha384: string;
  sha512: string;
  blake3: string;
}

export interface UuidInfo {
  value: string;
  version: number;
  variant: string;
  timestamp_ms: number | null;
}

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature_b64: string;
  is_expired: boolean | null;
  exp_ts: number | null;
  iat_ts: number | null;
  nbf_ts: number | null;
  verified: boolean | null;
  verify_error: string | null;
}

export interface KeypairResult {
  private_key_pem: string;
  public_key_pem: string;
  algorithm: string;
  key_size: number | null;
}

export async function base64Encode(input: string, urlSafe = false): Promise<string> {
  return invoke("base64_encode", { input, urlSafe });
}

export async function base64Decode(input: string, urlSafe = false): Promise<string> {
  return invoke("base64_decode", { input, urlSafe });
}

export async function hashText(input: string): Promise<HashResult> {
  return invoke("hash_text", { input });
}

export async function hmacSign(key: string, message: string, algorithm: string): Promise<string> {
  return invoke("hmac_sign", { key, message, algorithm });
}

export async function generateUuid(version: 4 | 7 = 4): Promise<string> {
  return invoke("generate_uuid", { version });
}

export async function inspectUuid(s: string): Promise<UuidInfo> {
  return invoke("inspect_uuid", { s });
}

export async function generateUlid(): Promise<string> {
  return invoke("generate_ulid");
}

export async function decodeJwt(token: string): Promise<JwtParts> {
  return invoke("decode_jwt", { token });
}

export async function argon2Hash(password: string): Promise<string> {
  return invoke("argon2_hash", { password });
}

export async function argon2Verify(password: string, hash: string): Promise<boolean> {
  return invoke("argon2_verify", { password, hash });
}

export async function bcryptHash(password: string, cost = 10): Promise<string> {
  return invoke("bcrypt_hash", { password, cost });
}

export async function bcryptVerify(password: string, hash: string): Promise<boolean> {
  return invoke("bcrypt_verify", { password, hash });
}

export async function aesEncrypt(plaintext: string, passphrase: string): Promise<string> {
  return invoke("aes_encrypt", { plaintext, passphrase });
}

export async function aesDecrypt(ciphertext: string, passphrase: string): Promise<string> {
  return invoke("aes_decrypt", { ciphertext, passphrase });
}

export async function generateRsaKeypair(bits: 2048 | 4096 = 2048): Promise<KeypairResult> {
  return invoke("generate_rsa_keypair", { bits });
}


export interface HexDumpLine { offset: string; hex_bytes: string[]; ascii: string; }
export interface BinaryInspect {
  hex: string; binary: string; decimal_u8: number; ascii: string;
  u16_be: number|null; i16_be: number|null; u32_be: number|null; i32_be: number|null; f32_be: number|null;
  u64_be: number|null; i64_be: number|null; f64_be: number|null;
  u16_le: number|null; i16_le: number|null; u32_le: number|null; i32_le: number|null; f32_le: number|null;
  u64_le: number|null; i64_le: number|null; f64_le: number|null;
}
export interface BaseConvResult { binary: string; octal: string; decimal: string; hex: string; }
export interface TimestampInfo { unix_seconds: number; unix_ms: number; utc_iso: string; utc_rfc2822: string; local_display: string; relative: string; tz_name: string; }
export interface DurationBreakdown { days: number; hours: number; minutes: number; seconds: number; }
export interface DurationInfo { total_seconds: number; human: string; iso8601: string; breakdown: DurationBreakdown; }
export interface RgbColor { r: number; g: number; b: number; }
export interface HslColor { h: number; s: number; l: number; }
export interface OklchColor { l: number; c: number; h: number; }
export interface ColorInfo { hex: string; hex_alpha: string|null; rgb: RgbColor; hsl: HslColor; oklch: OklchColor; wcag_luminance: number; contrast_on_white: number; contrast_on_black: number; aa_normal: boolean; aa_large: boolean; aaa_normal: boolean; }

export async function hexDump(input: string, bytesPerRow = 16): Promise<HexDumpLine[]> { return invoke("hex_dump", { input, bytesPerRow }); }
export async function hexToUtf8(hexStr: string): Promise<string> { return invoke("hex_to_utf8", { hexStr }); }
export async function utf8ToHex(input: string): Promise<string> { return invoke("utf8_to_hex", { input }); }
export async function hexToBase64(hexStr: string): Promise<string> { return invoke("hex_to_base64", { hexStr }); }
export async function base64ToHex(b64: string): Promise<string> { return invoke("base64_to_hex", { b64 }); }
export async function inspectBytes(hexStr: string): Promise<BinaryInspect> { return invoke("inspect_bytes", { hexStr }); }
export async function convertBase(input: string, fromBase: number): Promise<BaseConvResult> { return invoke("convert_base", { input, fromBase }); }
export async function formatNumber(n: number, localeSep: boolean, ordinal: boolean, sci: boolean): Promise<string> { return invoke("format_number", { n, localeSep, ordinal, sci }); }
export async function humanizeBytes(bytes: number): Promise<string> { return invoke("humanize_bytes", { bytes }); }
export async function unixToInfo(unixSecs: number, tzName: string): Promise<TimestampInfo> { return invoke("unix_to_info", { unixSecs, tzName }); }
export async function isoToUnix(iso: string): Promise<number> { return invoke("iso_to_unix", { iso }); }
export async function nowUnix(): Promise<number> { return invoke("now_unix"); }
export async function parseDuration(input: string): Promise<DurationInfo> { return invoke("parse_duration", { input }); }
export async function parseColor(input: string): Promise<ColorInfo> { return invoke("parse_color", { input }); }


export interface IpInfo {
  address: string; version: number; network: string|null; netmask: string|null;
  broadcast: string|null; host_min: string|null; host_max: string|null; host_count: number|null;
  prefix_len: number|null; is_private: boolean; is_loopback: boolean; is_multicast: boolean;
  is_link_local: boolean; class: string|null;
}
export interface UrlInfo {
  scheme: string; host: string|null; port: number|null; path: string;
  query: string|null; query_params: [string, string][]; fragment: string|null; username: string|null;
}
export interface HttpStatusInfo { code: number; name: string|null; category: string|null; }
export interface MimeInfo { mime: string|null; extension: string|null; }
export interface UaInfo { browser: string|null; browser_version: string|null; os: string|null; os_version: string|null; device_type: string; raw: string; }

export async function parseIp(input: string): Promise<IpInfo> { return invoke("parse_ip", { input }); }
export async function lookupMacOui(mac: string): Promise<[string, string|null]> { return invoke("lookup_mac_oui", { mac }); }
export async function parseUrlTool(input: string): Promise<UrlInfo> { return invoke("parse_url_tool", { input }); }
export async function httpStatusInfo(code: number): Promise<HttpStatusInfo> { return invoke("http_status_info", { code }); }
export async function lookupMime(input: string): Promise<MimeInfo> { return invoke("lookup_mime", { input }); }
export async function generateQrSvg(data: string, ecLevel = "H", size = 200): Promise<string> { return invoke("generate_qr_svg", { data, ecLevel, size }); }
export async function formatSql(input: string, indent = 2): Promise<string> { return invoke("format_sql", { input, indent }); }
export async function parseUa(ua: string): Promise<UaInfo> { return invoke("parse_ua", { ua }); }


export interface ImageInfo {
  format: string;
  width: number;
  height: number;
  colorMode: string;
  bitDepth: number;
  fileSize: number;
  hasExif: boolean;
}

export interface SvgOptResult {
  output: string;
  originalSize: number;
  optimizedSize: number;
  savingsPct: number;
}

export interface Asn1Node {
  tag: string;
  tagNum: number;
  constructed: boolean;
  length: number;
  children: Asn1Node[];
  value: string | null;
}

export interface CertInfo {
  subject: string;
  issuer: string;
  serial: string;
  notBefore: string;
  notAfter: string;
  daysRemaining: number;
  keyAlgorithm: string;
  sigAlgorithm: string;
  sans: string[];
  isCa: boolean;
  fingerprintSha256: string;
}

export interface ProtoField {
  fieldNumber: number;
  wireType: string;
  value: string;
}

export async function detectImage(base64Data: string): Promise<ImageInfo> {
  return invoke("detect_image_cmd", { base64Data });
}

export async function stripExif(base64Data: string): Promise<string> {
  return invoke("strip_exif_cmd", { base64Data });
}

export async function optimizeSvg(input: string, removeMetadata = false): Promise<SvgOptResult> {
  return invoke("optimize_svg_cmd", { input, removeMetadata });
}

export async function decodeAsn1(input: string): Promise<Asn1Node> {
  return invoke("decode_asn1_cmd", { input });
}

export async function inspectX509(input: string): Promise<CertInfo> {
  return invoke("inspect_x509_cmd", { input });
}

export async function decodeProto(input: string): Promise<ProtoField[]> {
  return invoke("decode_proto_cmd", { input });
}

export async function msgpackToJson(input: string): Promise<string> {
  return invoke("msgpack_to_json_cmd", { input });
}

export async function jsonToMsgpack(json: string): Promise<string> {
  return invoke("json_to_msgpack_cmd", { json });
}
