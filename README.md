<div align="center">

<img src="apps/desktop/public/icon.png" width="120" alt="ZDataForge" />

# ZDataForge

**The offline developer's data workbench.**

A native desktop app that replaces the dozens of "paste your data here" websites you reach for every day — JSON formatters, regex testers, JWT decoders, hash calculators, codegen, and more — with a single, fast, fully offline tool.

[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](#license)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#install)
[![100% Offline](https://img.shields.io/badge/100%25-offline-success.svg)](#privacy--offline-guarantee)
[![Tauri v2](https://img.shields.io/badge/tauri-v2-ffc131.svg)](https://tauri.app)
[![Rust](https://img.shields.io/badge/rust-stable-f74c00.svg)](https://www.rust-lang.org)

<a href="https://zsync.eu/zdataforge/"><b>Download</b></a> · <a href="https://github.com/TheHolyOneZ/ZDataForge"><b>Source</b></a> · <a href="https://zsync.eu"><b>More by the author</b></a>

</div>

---

> [!IMPORTANT]
> **Zero network calls. Zero telemetry. Zero data ever leaves your machine.**
> Every tool runs on-device against a pure-Rust core. Inputs live in RAM only and disappear when you close the tab.

---

## Why ZDataForge

You paste a JWT into a random website to "just decode it real quick." You drop a JSON blob into another to format it. A regex into a third. Each one is a black-box service running on someone else's server, logging whatever you give it. Most of the time the data is harmless. Sometimes it isn't.

ZDataForge collapses that whole habit into one native app. Everything runs locally in a Rust core. Nothing is uploaded, nothing is logged, nothing leaves the machine. It launches from a global hotkey into a Raycast-style command palette, every tool is one fuzzy-search away, and the inputs vanish when you close the window.

<div align="center">

<!-- Replace with a real screenshot once available -->
<img src="base.png" width="720" alt="ZDataForge interface" />

</div>

---

## Features

ZDataForge ships **45 tools** organized into seven categories, plus a built-in Privacy & Data panel and About screen. Every tool runs on-device with zero network access.

<details open>
<summary><b>JSON &amp; structured data</b> &nbsp;<sub>(9 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| JSON Formatter | Format, minify, and validate JSON |
| JSON Diff | Compare two JSON documents side by side |
| JSON → Rust Struct | Generate Rust structs with serde from JSON |
| JSON → C# Class | Generate C# classes from JSON |
| JSON → TypeScript | Generate TypeScript interfaces from JSON |
| JSON → Go Struct | Generate Go structs from JSON |
| YAML ↔ JSON | Convert between YAML and JSON |
| TOML ↔ JSON | Convert between TOML and JSON |
| CSV ↔ JSON | Convert between CSV and JSON |

</details>

<details open>
<summary><b>Text &amp; regex</b> &nbsp;<sub>(9 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| Regex Tester | Live regex testing with match highlights and capture groups |
| Text Diff | Compare two text blocks line by line |
| Case Converter | snake_case, camelCase, PascalCase, kebab-case, and more |
| Line Tools | Sort, deduplicate, reverse, number, trim, filter lines |
| Text Counter | Words, characters, lines, bytes, reading time |
| Lorem Ipsum | Generate placeholder text |
| Slug Generator | Convert text into URL-friendly slugs |
| Cron Parser | Parse cron expressions and show next firing times |
| String Escape | Escape and unescape JSON, HTML, shell, and URL strings |

</details>

<details open>
<summary><b>Encoding</b> &nbsp;<sub>(3 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| JWT Decoder | Decode and inspect JWT tokens, verify signatures |
| Base64 | Encode and decode (standard and URL-safe) |
| UUID / ULID Generator | Generate and inspect UUID v4/v7 and ULID |

</details>

<details open>
<summary><b>Crypto</b> &nbsp;<sub>(5 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| Hash Generator | MD5, SHA-1, SHA-256, SHA-512, BLAKE3 |
| HMAC Generator | HMAC-SHA-1/256/384/512 signatures |
| Password Hash | Argon2id and bcrypt hashing and verification |
| AES Encrypt / Decrypt | AES-256-GCM (educational) |
| RSA Keypair Generator | Generate 2048/4096-bit RSA keypairs in PEM |

</details>

<details open>
<summary><b>Binary &amp; numbers</b> &nbsp;<sub>(3 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| Hex Viewer | Canonical hex dump with offset, hex, and ASCII columns |
| Base Converter | Convert between binary, octal, decimal, hexadecimal |
| Color Converter | hex / RGB / HSL / OKLCh with WCAG contrast checker |

</details>

<details open>
<summary><b>Time</b> &nbsp;<sub>(2 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| Unix Timestamp | Convert between Unix epoch, ISO 8601, RFC 2822, local time |
| Duration Parser | Parse human-readable durations, convert to ISO 8601 |

</details>

<details open>
<summary><b>Network &amp; web</b> &nbsp;<sub>(7 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| IP / CIDR Calculator | Parse IPs and CIDR, compute subnet ranges (v4 & v6) |
| URL Parser | Inspect scheme, host, path, query, fragment |
| HTTP Status Codes | Quick reference with descriptions and categories |
| MIME Type Lookup | Look up MIME types by extension or vice versa |
| QR Code Generator | Generate SVG QR codes offline |
| SQL Formatter | Format and beautify SQL queries |
| User-Agent Parser | Identify browser, OS, and device from UA strings |

</details>

<details open>
<summary><b>Niche &amp; specialist</b> &nbsp;<sub>(7 tools)</sub></summary>

<br>

| Tool | Description |
| --- | --- |
| Image Inspector | Detect format, dimensions, color mode; strip EXIF |
| SVG Optimizer | Minify SVG: strip comments, compact numbers, drop metadata |
| Mermaid Preview | Render Mermaid diagrams live |
| ASN.1 Decoder | Parse DER/PEM ASN.1 data into a tree |
| X.509 Inspector | Subject, issuer, SANs, validity, fingerprint |
| Protobuf Decoder | Schema-less proto3 wire format decoder |
| MessagePack | Bidirectional JSON ↔ MessagePack conversion |

</details>

<br>

> [!TIP]
> Forgot a tool name? Just hit the global hotkey and start typing — the fuzzy search matches on title, category, and keywords.

---

## Privacy & offline guarantee

This is the entire point of the product.

> [!NOTE]
> - **Zero network calls** — no telemetry, no analytics, no update pings, no crash reporters.
> - **RAM by default** — inputs and outputs live in volatile memory and disappear when you close the tab. History is **opt-in**.
> - **Local-only settings** — the only thing persisted to disk is your settings file (theme, hotkey, density, accent) in the OS app-data directory. Wipe it from the **Privacy & Data** panel inside the app at any time.
> - **Auditable** — the source is GPL v3. Read it, fork it, build it yourself.

> [!CAUTION]
> If you ever see ZDataForge make a network call you didn't initiate, that's a bug. Open an issue immediately.

---

## Keyboard shortcuts

ZDataForge is keystroke-first. The palette is reachable in one keystroke; every tool is reachable in two.

<table>
<thead>
<tr><th align="left">Shortcut</th><th align="left">Action</th></tr>
</thead>
<tbody>
<tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Space</kbd> <sub>/</sub> <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>Space</kbd></td><td>Show / hide ZDataForge <sub>(system-wide global hotkey)</sub></td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>K</kbd> <sub>/</sub> <kbd>⌘</kbd>+<kbd>K</kbd></td><td>Open command palette</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>W</kbd> <sub>/</sub> <kbd>⌘</kbd>+<kbd>W</kbd></td><td>Close current tool tab</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>,</kbd> <sub>/</sub> <kbd>⌘</kbd>+<kbd>,</kbd></td><td>Open Settings</td></tr>
<tr><td><kbd>↑</kbd> <sub>/</sub> <kbd>↓</kbd></td><td>Navigate palette results</td></tr>
<tr><td><kbd>Enter</kbd></td><td>Select tool</td></tr>
<tr><td><kbd>Esc</kbd></td><td>Close palette / dismiss modal</td></tr>
<tr><td><kbd>?</kbd></td><td>Show the in-app shortcuts overlay</td></tr>
</tbody>
</table>

The global hotkey is configurable from Settings.

---

## Install

Prebuilt binaries are published for every release on the landing page:

<div align="center">

### <a href="https://zsync.eu/zdataforge/">zsync.eu/zdataforge</a>

</div>

| Platform | Format |
| --- | --- |
| Windows x64 | `.msi`, `.exe` <sub>(NSIS installer)</sub> |
| macOS Apple Silicon | `.dmg` |
| macOS Intel x64 | `.dmg` |
| Linux x64 | `.deb`, `.rpm`, `.AppImage` |

SHA-256 checksums are published alongside each release in `SHA256SUMS.txt`.

> [!WARNING]
> macOS builds are currently **ad-hoc signed** (`APPLE_SIGNING_IDENTITY=-`). On first launch you may need to right-click → **Open**, or remove the quarantine attribute manually with:
> ```bash
> xattr -dr com.apple.quarantine /Applications/ZDataForge.app
> ```
> Proper notarization is on the roadmap.

---

## Build from source

### Prerequisites

- **Rust** stable — install via [rustup](https://rustup.rs)
- **Node.js 24** ([download](https://nodejs.org/))
- **pnpm 9+** — `npm install -g pnpm` or via [corepack](https://nodejs.org/api/corepack.html)
- Tauri v2 system dependencies for your platform

<details>
<summary><b>Linux system packages</b> (Debian / Ubuntu)</summary>

<br>

```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libxdo-dev \
  libfuse2 \
  libdbus-1-dev \
  patchelf \
  pkg-config
```

For other distros, see the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/).

</details>

### Clone, install, run

```bash
git clone https://github.com/TheHolyOneZ/ZDataForge.git
cd ZDataForge

# install all JS/TS dependencies (root + workspaces)
pnpm install

# launch the desktop app in dev mode (hot reload for both Rust and React)
pnpm tauri dev
```

> [!NOTE]
> The first `pnpm tauri dev` will download and compile every Rust crate in the workspace. Expect **5–15 minutes** the first time depending on your machine; subsequent runs are incremental and much faster thanks to the build cache.

### Production build

```bash
# produces a signed-or-unsigned native bundle for your host platform
pnpm tauri build
```

Output bundles land under `apps/desktop/src-tauri/target/release/bundle/`:

| Folder | What's inside |
| --- | --- |
| `bundle/msi/`, `bundle/nsis/` | Windows installers |
| `bundle/dmg/` | macOS disk image |
| `bundle/deb/`, `bundle/rpm/`, `bundle/appimage/` | Linux packages |

> [!TIP]
> To target a specific bundle format, pass `--bundles`:
> ```bash
> pnpm tauri build --bundles dmg               # macOS DMG only
> pnpm tauri build --bundles nsis,msi          # Windows installers
> pnpm tauri build --bundles deb,appimage,rpm  # Linux trio
> ```

### Tests & lint

```bash
cargo test --workspace                            # Rust core test suite (256 tests)
cargo clippy --workspace --all-targets -- -D warnings
pnpm --filter @zdataforge/desktop lint            # ESLint
pnpm --filter @zdataforge/desktop test            # Vitest (frontend)
```

---

## Project structure

```
ZDataForge/
├── apps/
│   └── desktop/             # Tauri v2 app (React + TS frontend, Rust shell)
│       ├── src/             # React UI, tool registry, command palette
│       │   ├── tools/       # one folder per shipped tool
│       │   ├── app/         # shell, settings, command palette
│       │   ├── components/  # shared UI
│       │   └── lib/         # registry, store, platform helpers
│       └── src-tauri/       # Tauri Rust shell + IPC commands
├── crates/
│   ├── forge-core/          # tool engines (json, text, crypto, net, …)
│   ├── forge-codegen/       # JSON → struct/class codegen
│   └── forge-ipc/           # Tauri command boundary
├── packages/
│   └── ui-tokens/           # shared design tokens (colors, spacing, radii)
├── .github/workflows/       # CI + multi-platform release builds
├── Cargo.toml               # Rust workspace
└── pnpm-workspace.yaml      # pnpm workspace
```

The Rust core is split into focused modules — `binary`, `color`, `convert`, `crypto`, `files`, `json`, `net`, `numbers`, `text`, `time_tools` — each with its own test suite and benchmarks.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Shell | Tauri v2 |
| Backend / engines | Rust (stable, edition 2021) |
| UI runtime | React 18 + TypeScript 5.6 |
| Bundler | Vite 6 |
| Styling | Tailwind CSS v4 + custom design tokens |
| Editor | CodeMirror 6 |
| State | Zustand 5 |
| Diagrams | Mermaid 11 |
| Icons | lucide-react |
| Package manager | pnpm 9 (workspaces) |

Notable Rust crates: `serde_json`, `regex`, `jsonwebtoken`, `chrono` / `chrono-tz`, `sha2`, `blake3`, `argon2`, `ipnetwork`, `qrcode`.

---

## Contributing

Issues and pull requests are welcome at **[github.com/TheHolyOneZ/ZDataForge](https://github.com/TheHolyOneZ/ZDataForge)**.

Before opening a PR:

- Run `cargo fmt --all`, `cargo clippy --workspace --all-targets -- -D warnings`, and `cargo test --workspace`.
- Run `pnpm --filter @zdataforge/desktop lint` and the Vitest suite.
- For a new tool, add an entry to `apps/desktop/src/lib/registry.ts` and follow the structure of an existing folder under `apps/desktop/src/tools/`.

> [!IMPORTANT]
> **Keep the offline guarantee.** Any code that performs outbound network access — telemetry, update checks, remote crash reporting, anything — will not be merged. This is a non-negotiable design constraint.

---

## License

Released under the **GNU General Public License v3.0 or later** (`GPL-3.0-or-later`). You may use, study, modify, and redistribute the source under the same terms. See [`LICENSE`](LICENSE) when present in a release tarball; the in-app About panel and source headers are the canonical reference until a top-level `LICENSE` file is added to the repository.

---

## Credits

Built by **[TheHolyOneZ](https://github.com/TheHolyOneZ)**. More projects at **[zsync.eu](https://zsync.eu)**.

ZDataForge stands on the shoulders of the Tauri, Rust, and React ecosystems, as well as every crate and package listed above. Thanks to the maintainers of all of them.

<div align="center">
<br>
<sub>Made with care for developers who'd rather not paste their secrets into random websites.</sub>
</div>
