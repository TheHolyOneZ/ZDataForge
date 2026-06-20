use serde::{Deserialize, Serialize};

pub use forge_core::text::{TextStats, RegexResult, CronResult, DiffLine as TextDiffLine};
pub use forge_core::crypto::{HashResult, UuidInfo, JwtParts, KeypairResult};
pub use forge_core::files::{ImageInfo, SvgOptResult, Asn1Node, CertInfo, ProtoField};


pub fn base64_encode(input: String, url_safe: bool) -> String {
    forge_core::crypto::base64_encode(input.as_bytes(), url_safe)
}

pub fn base64_decode(input: String, url_safe: bool) -> Result<String, String> {
    let bytes = forge_core::crypto::base64_decode(&input, url_safe)?;
    String::from_utf8(bytes).map_err(|e| format!("Decoded bytes are not valid UTF-8: {e}"))
}


pub fn hash_text(input: String) -> HashResult {
    forge_core::crypto::hash_all(input.as_bytes())
}


pub fn hmac_sign(key: String, message: String, algorithm: String) -> Result<String, String> {
    forge_core::crypto::hmac_sign(key.as_bytes(), message.as_bytes(), &algorithm)
}


pub fn generate_uuid(version: u8) -> Result<String, String> {
    match version {
        4 => Ok(forge_core::crypto::generate_uuid_v4()),
        7 => Ok(forge_core::crypto::generate_uuid_v7()),
        _ => Err(format!("Unsupported UUID version: {version}")),
    }
}

pub fn inspect_uuid(s: String) -> Result<UuidInfo, String> {
    forge_core::crypto::inspect_uuid(&s)
}

pub fn generate_ulid() -> String {
    forge_core::crypto::generate_ulid()
}


pub fn decode_jwt(token: String) -> Result<JwtParts, String> {
    forge_core::crypto::decode_jwt(&token)
}


pub fn argon2_hash(password: String) -> Result<String, String> {
    forge_core::crypto::argon2_hash(&password)
}

pub fn argon2_verify(password: String, hash: String) -> Result<bool, String> {
    forge_core::crypto::argon2_verify(&password, &hash)
}

pub fn bcrypt_hash(password: String, cost: u32) -> Result<String, String> {
    forge_core::crypto::bcrypt_hash(&password, cost)
}

pub fn bcrypt_verify(password: String, hash: String) -> Result<bool, String> {
    forge_core::crypto::bcrypt_verify(&password, &hash)
}


pub fn aes_encrypt(plaintext: String, passphrase: String) -> Result<String, String> {
    forge_core::crypto::aes_gcm_encrypt(&plaintext, &passphrase)
}

pub fn aes_decrypt(ciphertext: String, passphrase: String) -> Result<String, String> {
    forge_core::crypto::aes_gcm_decrypt(&ciphertext, &passphrase)
}


pub fn generate_rsa_keypair(bits: usize) -> Result<KeypairResult, String> {
    forge_core::crypto::generate_rsa_keypair(bits)
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatJsonRequest {
    pub input: String,
    pub indent: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatJsonResponse {
    pub output: String,
    pub byte_count: usize,
    pub elapsed_ms: f64,
}

pub fn format_json(req: FormatJsonRequest) -> Result<FormatJsonResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::json::format_json(&req.input, req.indent.unwrap_or(2))?;
    let byte_count = output.len();
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    Ok(FormatJsonResponse {
        output,
        byte_count,
        elapsed_ms,
    })
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonDiffResponse {
    pub diff: serde_json::Value,
    pub elapsed_ms: f64,
}

pub fn json_diff(left: String, right: String) -> Result<JsonDiffResponse, String> {
    let start = std::time::Instant::now();
    let diff_json = forge_core::json::json_diff(&left, &right)?;
    let diff: serde_json::Value =
        serde_json::from_str(&diff_json).map_err(|e| e.to_string())?;
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    Ok(JsonDiffResponse { diff, elapsed_ms })
}

pub fn sort_json_keys(input: String) -> Result<FormatJsonResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::json::sort_json_keys(&input)?;
    let byte_count = output.len();
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    Ok(FormatJsonResponse {
        output,
        byte_count,
        elapsed_ms,
    })
}


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodegenRequest {
    pub input: String,
    pub root_name: Option<String>,


    #[serde(default)]
    pub casing: Option<String>,

    #[serde(default)]
    pub toggles: std::collections::HashMap<String, bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodegenResponse {
    pub output: String,
    pub elapsed_ms: f64,
}

fn casing_or(req: &CodegenRequest, default: forge_codegen::Casing) -> forge_codegen::Casing {
    req.casing
        .as_deref()
        .and_then(forge_codegen::Casing::from_str)
        .unwrap_or(default)
}

pub fn json_to_rust(req: CodegenRequest) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let root = req.root_name.as_deref().unwrap_or("Root");
    let opts = forge_codegen::rust::RustOptions {
        casing: casing_or(&req, forge_codegen::Casing::Snake),
        derive_debug_clone: req
            .toggles
            .get("derive-debug-clone")
            .copied()
            .unwrap_or(true),
        derive_serde: req.toggles.get("derive-serde").copied().unwrap_or(true),
        use_option: req.toggles.get("use-option").copied().unwrap_or(true),
    };
    let output = forge_codegen::rust::json_to_rust_struct(&req.input, root, &opts)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn json_to_csharp(req: CodegenRequest) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let root = req.root_name.as_deref().unwrap_or("Root");
    let opts = forge_codegen::csharp::CSharpOptions {
        casing: casing_or(&req, forge_codegen::Casing::Pascal),
        nullable_annotations: req
            .toggles
            .get("nullable-annotations")
            .copied()
            .unwrap_or(true),
        use_record: req.toggles.get("use-record").copied().unwrap_or(false),
    };
    let output = forge_codegen::csharp::json_to_csharp_class(&req.input, root, &opts)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn json_to_typescript(req: CodegenRequest) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let root = req.root_name.as_deref().unwrap_or("Root");
    let opts = forge_codegen::typescript::TypeScriptOptions {
        casing: casing_or(&req, forge_codegen::Casing::Camel),
        use_type_alias: req.toggles.get("use-type-alias").copied().unwrap_or(false),
        readonly: req.toggles.get("readonly").copied().unwrap_or(false),
    };
    let output = forge_codegen::typescript::json_to_typescript_interface(&req.input, root, &opts)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn json_to_go(req: CodegenRequest) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let root = req.root_name.as_deref().unwrap_or("Root");
    let opts = forge_codegen::go::GoOptions {
        casing: casing_or(&req, forge_codegen::Casing::Pascal),
        json_tags: req.toggles.get("json-tags").copied().unwrap_or(true),
        pointer_nullable: req
            .toggles
            .get("pointer-nullable")
            .copied()
            .unwrap_or(false),
    };
    let output = forge_codegen::go::json_to_go_struct(&req.input, root, &opts)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}


pub fn yaml_to_json(input: String) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::convert::yaml_to_json(&input)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn json_to_yaml(input: String) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::convert::json_to_yaml(&input)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn toml_to_json(input: String) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::convert::toml_to_json(&input)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn json_to_toml(input: String) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::convert::json_to_toml(&input)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn csv_to_json(input: String) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::convert::csv_to_json(&input)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}

pub fn json_to_csv(input: String) -> Result<CodegenResponse, String> {
    let start = std::time::Instant::now();
    let output = forge_core::convert::json_to_csv(&input)?;
    Ok(CodegenResponse {
        output,
        elapsed_ms: start.elapsed().as_secs_f64() * 1000.0,
    })
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaseConvertResponse {
    pub snake: String,
    pub camel: String,
    pub pascal: String,
    pub kebab: String,
    pub screaming: String,
    pub title: String,
    pub train: String,
}

pub fn convert_case(input: String) -> CaseConvertResponse {
    CaseConvertResponse {
        snake: forge_core::text::to_snake_case(&input),
        camel: forge_core::text::to_camel_case(&input),
        pascal: forge_core::text::to_pascal_case(&input),
        kebab: forge_core::text::to_kebab_case(&input),
        screaming: forge_core::text::to_screaming_snake(&input),
        title: forge_core::text::to_title_case(&input),
        train: forge_core::text::to_train_case(&input),
    }
}

pub fn sort_lines(input: String, descending: bool) -> String {
    forge_core::text::sort_lines(&input, descending)
}

pub fn deduplicate_lines(input: String, case_sensitive: bool) -> String {
    forge_core::text::deduplicate_lines(&input, case_sensitive)
}

pub fn reverse_lines(input: String) -> String {
    forge_core::text::reverse_lines(&input)
}

pub fn number_lines(input: String, start: usize) -> String {
    forge_core::text::number_lines(&input, start)
}

pub fn trim_lines(input: String, mode: String) -> String {
    forge_core::text::trim_lines(&input, &mode)
}

pub fn filter_lines(input: String, pattern: String, invert: bool) -> Result<String, String> {
    forge_core::text::filter_lines(&input, &pattern, invert)
}

pub fn count_text(input: String) -> TextStats {
    forge_core::text::count_text(&input)
}

pub fn test_regex(
    pattern: String,
    flags: String,
    input: String,
    replacement: Option<String>,
) -> Result<RegexResult, String> {
    forge_core::text::test_regex(&pattern, &flags, &input, replacement.as_deref())
}

pub fn text_diff(left: String, right: String) -> Vec<TextDiffLine> {
    forge_core::text::text_diff(&left, &right)
}

pub fn escape_string(input: String, mode: String) -> String {
    forge_core::text::escape_string(&input, &mode)
}

pub fn unescape_string(input: String, mode: String) -> Result<String, String> {
    forge_core::text::unescape_string(&input, &mode)
}

pub fn lorem_ipsum(paragraphs: usize, sentences_per_para: usize) -> String {
    forge_core::text::lorem_ipsum(paragraphs, sentences_per_para)
}

pub fn generate_slug(input: String, separator: String) -> String {
    forge_core::text::generate_slug(&input, &separator)
}

pub fn parse_cron(expression: String) -> Result<CronResult, String> {
    forge_core::text::parse_cron(&expression)
}

pub fn markdown_to_html(input: String) -> String {
    forge_core::text::markdown_to_html(&input)
}


pub use forge_core::binary::{HexDumpLine, BinaryInspect};
pub use forge_core::numbers::BaseConvResult;
pub use forge_core::time_tools::{TimestampInfo, DurationInfo};
pub use forge_core::color::ColorInfo;


pub fn hex_dump(input: String, bytes_per_row: usize) -> Vec<HexDumpLine> {
    forge_core::binary::hex_dump(input.as_bytes(), bytes_per_row)
}

pub fn hex_dump_from_hex(hex_str: String, bytes_per_row: usize) -> Result<Vec<HexDumpLine>, String> {
    let bytes = hex::decode(hex_str.chars().filter(|c| !c.is_whitespace()).collect::<String>()).map_err(|e| e.to_string())?;
    Ok(forge_core::binary::hex_dump(&bytes, bytes_per_row))
}

pub fn hex_to_utf8(hex_str: String) -> Result<String, String> {
    forge_core::binary::hex_to_utf8(&hex_str)
}

pub fn utf8_to_hex(input: String) -> String {
    forge_core::binary::utf8_to_hex(&input)
}

pub fn hex_to_base64(hex_str: String) -> Result<String, String> {
    forge_core::binary::hex_to_base64(&hex_str)
}

pub fn base64_to_hex(b64: String) -> Result<String, String> {
    forge_core::binary::base64_to_hex(&b64)
}

pub fn inspect_bytes(hex_str: String) -> Result<BinaryInspect, String> {
    forge_core::binary::inspect_bytes(&hex_str)
}


pub fn convert_base(input: String, from_base: u32) -> Result<BaseConvResult, String> {
    forge_core::numbers::convert_base(&input, from_base)
}

pub fn to_arbitrary_base(n: i64, base: u32) -> Result<String, String> {
    forge_core::numbers::to_arbitrary_base(n, base)
}

pub fn format_number(n: f64, locale_sep: bool, ordinal: bool, sci: bool) -> String {
    forge_core::numbers::format_number(n, locale_sep, ordinal, sci)
}

pub fn humanize_bytes(bytes: u64) -> String {
    forge_core::numbers::humanize_bytes(bytes)
}


pub fn unix_to_info(unix_secs: i64, tz_name: String) -> Result<TimestampInfo, String> {
    forge_core::time_tools::unix_to_info(unix_secs, &tz_name)
}

pub fn iso_to_unix(iso: String) -> Result<i64, String> {
    forge_core::time_tools::iso_to_unix(&iso)
}

pub fn now_unix() -> i64 {
    forge_core::time_tools::now_unix()
}

pub fn parse_duration(input: String) -> Result<DurationInfo, String> {
    forge_core::time_tools::parse_duration(&input)
}


pub fn parse_color(input: String) -> Result<ColorInfo, String> {
    forge_core::color::parse_color(&input)
}


pub use forge_core::net::{IpInfo, UrlInfo, UaInfo};


pub fn parse_ip(input: String) -> Result<IpInfo, String> {
    forge_core::net::parse_ip(&input)
}

pub fn lookup_mac_oui(mac: String) -> (String, Option<String>) {
    let formatted = forge_core::net::format_mac(&mac);
    let vendor = forge_core::net::lookup_mac_oui(&mac).map(|s| s.to_string());
    (formatted, vendor)
}


pub fn parse_url(input: String) -> Result<UrlInfo, String> {
    forge_core::net::parse_url(&input)
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpStatusInfo {
    pub code: u16,
    pub name: Option<String>,
    pub category: Option<String>,
}

pub fn http_status_info(code: u16) -> HttpStatusInfo {
    if let Some((name, cat)) = forge_core::net::http_status_info(code) {
        HttpStatusInfo {
            code,
            name: Some(name.to_string()),
            category: Some(cat.to_string()),
        }
    } else {
        HttpStatusInfo { code, name: None, category: None }
    }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MimeInfo {
    pub mime: Option<String>,
    pub extension: Option<String>,
}

pub fn lookup_mime(input: String) -> MimeInfo {
    if input.contains('/') {
        MimeInfo {
            mime: Some(input.clone()),
            extension: forge_core::net::extension_from_mime(&input).map(|s| s.to_string()),
        }
    } else {
        let ext = input.trim_start_matches('.');
        MimeInfo {
            extension: Some(ext.to_string()),
            mime: forge_core::net::mime_from_extension(ext).map(|s| s.to_string()),
        }
    }
}


pub fn generate_qr_svg(data: String, ec_level: String, size: u32) -> Result<String, String> {
    forge_core::net::generate_qr_svg(&data, &ec_level, size)
}


pub fn format_sql(input: String, indent: usize) -> String {
    forge_core::net::format_sql(&input, indent)
}


pub fn parse_ua(ua: String) -> UaInfo {
    forge_core::net::parse_ua(&ua)
}


pub fn detect_image(base64_data: &str) -> Result<ImageInfo, String> {
    use base64::{engine::general_purpose::STANDARD, Engine};
    let bytes = STANDARD.decode(base64_data.trim()).map_err(|e| format!("Invalid base64: {e}"))?;
    forge_core::files::detect_image(&bytes)
}

pub fn strip_exif(base64_data: &str) -> Result<String, String> {
    use base64::{engine::general_purpose::STANDARD, Engine};
    let bytes = STANDARD.decode(base64_data.trim()).map_err(|e| format!("Invalid base64: {e}"))?;
    let result_bytes = forge_core::files::strip_exif(&bytes)?;
    Ok(String::from_utf8(result_bytes).unwrap_or_default())
}

pub fn optimize_svg(input: String, remove_metadata: bool) -> Result<SvgOptResult, String> {
    forge_core::files::optimize_svg(&input, remove_metadata)
}

pub fn decode_asn1(input: String) -> Result<Asn1Node, String> {
    forge_core::files::decode_asn1(&input)
}

pub fn inspect_x509(input: String) -> Result<CertInfo, String> {
    forge_core::files::inspect_x509(&input)
}

pub fn decode_proto(input: String) -> Result<Vec<ProtoField>, String> {
    forge_core::files::decode_proto(&input)
}

pub fn msgpack_to_json(input: String) -> Result<String, String> {
    forge_core::files::msgpack_to_json(&input)
}

pub fn json_to_msgpack(json: String) -> Result<String, String> {
    forge_core::files::json_to_msgpack(&json)
}
