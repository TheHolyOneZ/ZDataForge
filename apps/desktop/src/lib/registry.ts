import { lazy, type ComponentType } from "react";

export interface Tool {
  id: string;
  title: string;
  category: Category;
  keywords: string[];
  icon: string;
  description: string;
  component: ComponentType;
}

export type Category =
  | "JSON"
  | "Text"
  | "Encoding"
  | "Crypto"
  | "Binary"
  | "Time"
  | "Network"
  | "Niche"
  | "Settings";

export const TOOLS: Tool[] = [
  {
    id: "json-formatter",
    title: "JSON Formatter",
    category: "JSON",
    keywords: ["json", "format", "pretty", "minify", "validate", "parse", "beautify"],
    icon: "Braces",
    description: "Format, minify, and validate JSON",
    component: lazy(() => import("../tools/json-formatter/index")),
  },
  {
    id: "json-diff",
    title: "JSON Diff",
    category: "JSON",
    keywords: ["json", "diff", "compare", "difference", "delta"],
    icon: "GitCompare",
    description: "Compare two JSON documents side by side",
    component: lazy(() => import("../tools/json-diff")),
  },
  {
    id: "json-to-rust",
    title: "JSON → Rust Struct",
    category: "JSON",
    keywords: ["json", "rust", "struct", "serde", "codegen", "generate"],
    icon: "Code2",
    description: "Generate Rust structs with serde from JSON",
    component: lazy(() => import("../tools/json-to-rust")),
  },
  {
    id: "json-to-csharp",
    title: "JSON → C# Class",
    category: "JSON",
    keywords: ["json", "csharp", "c#", "class", "dotnet", "codegen"],
    icon: "Code2",
    description: "Generate C# classes from JSON",
    component: lazy(() => import("../tools/json-to-csharp")),
  },
  {
    id: "json-to-typescript",
    title: "JSON → TypeScript",
    category: "JSON",
    keywords: ["json", "typescript", "ts", "interface", "type", "codegen"],
    icon: "Code2",
    description: "Generate TypeScript interfaces from JSON",
    component: lazy(() => import("../tools/json-to-typescript")),
  },
  {
    id: "json-to-go",
    title: "JSON → Go Struct",
    category: "JSON",
    keywords: ["json", "go", "golang", "struct", "codegen"],
    icon: "Code2",
    description: "Generate Go structs from JSON",
    component: lazy(() => import("../tools/json-to-go")),
  },
  {
    id: "yaml-json",
    title: "YAML ↔ JSON",
    category: "JSON",
    keywords: ["yaml", "json", "convert", "yml"],
    icon: "ArrowLeftRight",
    description: "Convert between YAML and JSON",
    component: lazy(() => import("../tools/yaml-json")),
  },
  {
    id: "toml-json",
    title: "TOML ↔ JSON",
    category: "JSON",
    keywords: ["toml", "json", "convert", "config"],
    icon: "ArrowLeftRight",
    description: "Convert between TOML and JSON",
    component: lazy(() => import("../tools/toml-json")),
  },
  {
    id: "csv-json",
    title: "CSV ↔ JSON",
    category: "JSON",
    keywords: ["csv", "json", "convert", "spreadsheet", "table"],
    icon: "Table",
    description: "Convert between CSV and JSON",
    component: lazy(() => import("../tools/csv-json")),
  },

  {
    id: "regex-tester",
    title: "Regex Tester",
    category: "Text",
    keywords: ["regex", "regexp", "regular expression", "pattern", "match", "replace", "capture"],
    icon: "Regex",
    description: "Live regex testing with match highlights and capture groups",
    component: lazy(() => import("../tools/regex-tester")),
  },
  {
    id: "text-diff",
    title: "Text Diff",
    category: "Text",
    keywords: ["diff", "compare", "difference", "text", "lines"],
    icon: "GitCompare",
    description: "Compare two text blocks line by line",
    component: lazy(() => import("../tools/text-diff")),
  },
  {
    id: "case-converter",
    title: "Case Converter",
    category: "Text",
    keywords: ["case", "snake", "camel", "pascal", "kebab", "screaming", "title", "convert"],
    icon: "CaseSensitive",
    description: "Convert between snake_case, camelCase, PascalCase, kebab-case, and more",
    component: lazy(() => import("../tools/case-converter")),
  },
  {
    id: "line-tools",
    title: "Line Tools",
    category: "Text",
    keywords: ["lines", "sort", "dedupe", "reverse", "number", "trim", "filter"],
    icon: "AlignLeft",
    description: "Sort, deduplicate, reverse, number, trim, and filter lines",
    component: lazy(() => import("../tools/line-tools")),
  },
  {
    id: "text-counter",
    title: "Text Counter",
    category: "Text",
    keywords: ["count", "words", "chars", "bytes", "lines", "reading time"],
    icon: "BarChart2",
    description: "Count words, characters, lines, bytes, and reading time",
    component: lazy(() => import("../tools/text-counter")),
  },
  {
    id: "lorem-ipsum",
    title: "Lorem Ipsum",
    category: "Text",
    keywords: ["lorem", "ipsum", "placeholder", "dummy", "text"],
    icon: "FileText",
    description: "Generate lorem ipsum placeholder text",
    component: lazy(() => import("../tools/lorem-ipsum")),
  },
  {
    id: "slug-generator",
    title: "Slug Generator",
    category: "Text",
    keywords: ["slug", "url", "permalink", "dash", "kebab"],
    icon: "Link",
    description: "Convert text to URL-friendly slugs",
    component: lazy(() => import("../tools/slug-generator")),
  },
  {
    id: "cron-parser",
    title: "Cron Parser",
    category: "Text",
    keywords: ["cron", "schedule", "expression", "timing"],
    icon: "Clock",
    description: "Parse cron expressions and show next firing times",
    component: lazy(() => import("../tools/cron-parser")),
  },
  {
    id: "string-escape",
    title: "String Escape",
    category: "Text",
    keywords: ["escape", "unescape", "json", "html", "shell", "url", "encode"],
    icon: "Slash",
    description: "Escape and unescape strings (JSON, HTML, shell, URL)",
    component: lazy(() => import("../tools/string-escape")),
  },

  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    category: "Encoding",
    keywords: ["jwt", "json web token", "decode", "verify", "auth", "bearer", "claims"],
    icon: "KeyRound",
    description: "Decode and inspect JWT tokens, verify signatures",
    component: lazy(() => import("../tools/jwt-decoder")),
  },
  {
    id: "base64",
    title: "Base64",
    category: "Encoding",
    keywords: ["base64", "encode", "decode", "b64"],
    icon: "Binary",
    description: "Base64 encode and decode (standard and URL-safe)",
    component: lazy(() => import("../tools/base64")),
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    category: "Crypto",
    keywords: ["hash", "md5", "sha", "sha256", "sha512", "blake3", "checksum"],
    icon: "Hash",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512, and BLAKE3 hashes",
    component: lazy(() => import("../tools/hash-generator")),
  },
  {
    id: "hmac-generator",
    title: "HMAC Generator",
    category: "Crypto",
    keywords: ["hmac", "hash", "mac", "signature", "sha", "key"],
    icon: "ShieldCheck",
    description: "Generate HMAC signatures (SHA-1, SHA-256, SHA-384, SHA-512)",
    component: lazy(() => import("../tools/hmac-generator")),
  },
  {
    id: "uuid-generator",
    title: "UUID / ULID Generator",
    category: "Encoding",
    keywords: ["uuid", "ulid", "guid", "unique", "id", "v4", "v7"],
    icon: "Fingerprint",
    description: "Generate and inspect UUID v4/v7 and ULID",
    component: lazy(() => import("../tools/uuid-generator")),
  },
  {
    id: "password-hash",
    title: "Password Hash",
    category: "Crypto",
    keywords: ["password", "hash", "argon2", "bcrypt", "verify"],
    icon: "Lock",
    description: "Hash and verify passwords with Argon2id or bcrypt",
    component: lazy(() => import("../tools/password-hash")),
  },
  {
    id: "aes-tool",
    title: "AES Encrypt / Decrypt",
    category: "Crypto",
    keywords: ["aes", "encrypt", "decrypt", "gcm", "symmetric", "cipher"],
    icon: "ShieldAlert",
    description: "AES-256-GCM encrypt and decrypt (educational)",
    component: lazy(() => import("../tools/aes-tool")),
  },
  {
    id: "rsa-keygen",
    title: "RSA Keypair Generator",
    category: "Crypto",
    keywords: ["rsa", "keypair", "private key", "public key", "pem", "asymmetric"],
    icon: "Key",
    description: "Generate RSA 2048/4096-bit keypairs in PEM format",
    component: lazy(() => import("../tools/rsa-keygen")),
  },

  {
    id: "hex-viewer",
    title: "Hex Viewer",
    category: "Binary",
    keywords: ["hex", "hexdump", "binary", "bytes", "ascii", "offset"],
    icon: "MonitorDot",
    description: "Canonical hex dump with offset, hex, and ASCII columns",
    component: lazy(() => import("../tools/hex-viewer")),
  },
  {
    id: "base-converter",
    title: "Base Converter",
    category: "Binary",
    keywords: ["base", "binary", "octal", "decimal", "hex", "convert", "radix"],
    icon: "ArrowLeftRight",
    description: "Convert between binary, octal, decimal, and hexadecimal",
    component: lazy(() => import("../tools/base-converter")),
  },
  {
    id: "timestamp",
    title: "Unix Timestamp",
    category: "Time",
    keywords: ["unix", "timestamp", "epoch", "time", "date", "iso", "convert", "timezone"],
    icon: "Calendar",
    description: "Convert Unix timestamps to/from ISO 8601, RFC 2822, and local time",
    component: lazy(() => import("../tools/timestamp")),
  },
  {
    id: "duration-parser",
    title: "Duration Parser",
    category: "Time",
    keywords: ["duration", "time", "hours", "minutes", "seconds", "iso8601"],
    icon: "Timer",
    description: "Parse human-readable durations and convert to ISO 8601",
    component: lazy(() => import("../tools/duration-parser")),
  },
  {
    id: "color-converter",
    title: "Color Converter",
    category: "Binary",
    keywords: ["color", "colour", "hex", "rgb", "hsl", "oklch", "wcag", "contrast"],
    icon: "Palette",
    description: "Convert colors between hex, RGB, HSL, OKLCh with WCAG contrast checker",
    component: lazy(() => import("../tools/color-converter")),
  },

  {
    id: "ip-calculator",
    title: "IP / CIDR Calculator",
    category: "Network",
    keywords: ["ip", "cidr", "subnet", "netmask", "network", "ipv4", "ipv6"],
    icon: "Network",
    description: "Parse IP addresses and CIDR notation, calculate subnet ranges",
    component: lazy(() => import("../tools/ip-calculator")),
  },
  {
    id: "url-parser",
    title: "URL Parser",
    category: "Network",
    keywords: ["url", "uri", "parse", "scheme", "host", "path", "query", "fragment"],
    icon: "Globe",
    description: "Parse and inspect URL components including query parameters",
    component: lazy(() => import("../tools/url-parser")),
  },
  {
    id: "http-status",
    title: "HTTP Status Codes",
    category: "Network",
    keywords: ["http", "status", "code", "200", "404", "500", "rest"],
    icon: "ServerCrash",
    description: "HTTP status code reference with descriptions and categories",
    component: lazy(() => import("../tools/http-status")),
  },
  {
    id: "mime-lookup",
    title: "MIME Type Lookup",
    category: "Network",
    keywords: ["mime", "content-type", "extension", "media type"],
    icon: "FileType",
    description: "Look up MIME types by file extension or vice versa",
    component: lazy(() => import("../tools/mime-lookup")),
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    category: "Network",
    keywords: ["qr", "qrcode", "barcode", "offline", "svg"],
    icon: "QrCode",
    description: "Generate offline QR codes as SVG (no internet required)",
    component: lazy(() => import("../tools/qr-generator")),
  },
  {
    id: "sql-formatter",
    title: "SQL Formatter",
    category: "Network",
    keywords: ["sql", "format", "pretty", "query", "database"],
    icon: "Database",
    description: "Format and beautify SQL queries",
    component: lazy(() => import("../tools/sql-formatter")),
  },
  {
    id: "ua-parser",
    title: "User-Agent Parser",
    category: "Network",
    keywords: ["user-agent", "ua", "browser", "device", "os"],
    icon: "Monitor",
    description: "Parse User-Agent strings to identify browser, OS, and device",
    component: lazy(() => import("../tools/ua-parser")),
  },

  {
    id: "image-inspector",
    title: "Image Inspector",
    category: "Niche",
    keywords: ["image", "exif", "png", "jpeg", "detect", "strip", "metadata"],
    icon: "Image",
    description: "Detect image format, dimensions, color mode; strip EXIF metadata",
    component: lazy(() => import("../tools/image-inspector")),
  },
  {
    id: "svg-optimizer",
    title: "SVG Optimizer",
    category: "Niche",
    keywords: ["svg", "optimize", "minify", "compress", "vector"],
    icon: "Minimize2",
    description: "Minify SVG: remove comments, compact numbers, strip metadata",
    component: lazy(() => import("../tools/svg-optimizer")),
  },
  {
    id: "mermaid-preview",
    title: "Mermaid Preview",
    category: "Niche",
    keywords: ["mermaid", "diagram", "flowchart", "sequence", "graph"],
    icon: "GitBranch",
    description: "Render Mermaid diagrams live in the browser",
    component: lazy(() => import("../tools/mermaid-preview")),
  },
  {
    id: "asn1-decoder",
    title: "ASN.1 Decoder",
    category: "Niche",
    keywords: ["asn1", "der", "pem", "certificate", "decode", "ber"],
    icon: "Binary",
    description: "Parse DER/PEM ASN.1 data and display the tree structure",
    component: lazy(() => import("../tools/asn1-decoder")),
  },
  {
    id: "x509-inspector",
    title: "X.509 Inspector",
    category: "Niche",
    keywords: ["x509", "certificate", "tls", "ssl", "pem", "san"],
    icon: "ShieldCheck",
    description: "Parse X.509 certificates — subject, issuer, SANs, validity, fingerprint",
    component: lazy(() => import("../tools/x509-inspector")),
  },
  {
    id: "proto-decoder",
    title: "Protobuf Decoder",
    category: "Niche",
    keywords: ["protobuf", "proto", "grpc", "binary", "decode", "wire"],
    icon: "Layers",
    description: "Schema-less proto3 wire format decoder — decode fields by wire type",
    component: lazy(() => import("../tools/proto-decoder")),
  },
  {
    id: "msgpack",
    title: "MessagePack",
    category: "Niche",
    keywords: ["msgpack", "messagepack", "binary", "json", "serialize", "encode"],
    icon: "Package",
    description: "Bidirectional JSON ↔ MessagePack conversion",
    component: lazy(() => import("../tools/msgpack")),
  },

  {
    id: "privacy-panel",
    title: "Privacy & Data",
    category: "Settings",
    keywords: ["privacy", "data", "history", "wipe", "forget", "ram", "security"],
    icon: "Shield",
    description: "Data privacy info, history wipe, and forget-on-close toggle",
    component: lazy(() => import("../tools/privacy-panel/index")),
  },
  {
    id: "about",
    title: "About ZDataForge",
    category: "Settings",
    keywords: ["about", "version", "info"],
    icon: "Info",
    description: "App version, feature overview, and tech stack",
    component: lazy(() => import("../tools/about/index")),
  },
];

export function searchTools(query: string, tools: Tool[] = TOOLS): Tool[] {
  if (!query.trim()) return tools;
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q)) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  );
}

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
