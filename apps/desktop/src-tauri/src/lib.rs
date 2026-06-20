use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, WebviewWindow,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

mod error;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! ZDataForge is ready.", name)
}

#[tauri::command]
fn format_json(req: forge_ipc::FormatJsonRequest) -> Result<forge_ipc::FormatJsonResponse, String> {
    forge_ipc::format_json(req)
}

#[tauri::command]
fn validate_json(input: String) -> forge_core::json::ValidationResult {
    forge_core::json::validate_json(&input).unwrap_or(forge_core::json::ValidationResult {
        valid: false,
        error: Some("Unknown error".into()),
        value_type: None,
    })
}

#[tauri::command]
fn sort_json_keys(input: String) -> Result<forge_ipc::FormatJsonResponse, String> {
    forge_ipc::sort_json_keys(input)
}

#[tauri::command]
fn json_diff(left: String, right: String) -> Result<forge_ipc::JsonDiffResponse, String> {
    forge_ipc::json_diff(left, right)
}

#[tauri::command]
fn json_to_rust(req: forge_ipc::CodegenRequest) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_rust(req)
}

#[tauri::command]
fn json_to_csharp(req: forge_ipc::CodegenRequest) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_csharp(req)
}

#[tauri::command]
fn json_to_typescript(
    req: forge_ipc::CodegenRequest,
) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_typescript(req)
}

#[tauri::command]
fn json_to_go(req: forge_ipc::CodegenRequest) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_go(req)
}

#[tauri::command]
fn yaml_to_json(input: String) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::yaml_to_json(input)
}

#[tauri::command]
fn json_to_yaml(input: String) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_yaml(input)
}

#[tauri::command]
fn toml_to_json(input: String) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::toml_to_json(input)
}

#[tauri::command]
fn json_to_toml(input: String) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_toml(input)
}

#[tauri::command]
fn csv_to_json(input: String) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::csv_to_json(input)
}

#[tauri::command]
fn json_to_csv(input: String) -> Result<forge_ipc::CodegenResponse, String> {
    forge_ipc::json_to_csv(input)
}


#[tauri::command]
fn convert_case(input: String) -> forge_ipc::CaseConvertResponse {
    forge_ipc::convert_case(input)
}

#[tauri::command]
fn sort_lines(input: String, descending: bool) -> String {
    forge_ipc::sort_lines(input, descending)
}

#[tauri::command]
fn deduplicate_lines(input: String, case_sensitive: bool) -> String {
    forge_ipc::deduplicate_lines(input, case_sensitive)
}

#[tauri::command]
fn reverse_lines(input: String) -> String {
    forge_ipc::reverse_lines(input)
}

#[tauri::command]
fn number_lines(input: String, start: usize) -> String {
    forge_ipc::number_lines(input, start)
}

#[tauri::command]
fn trim_lines(input: String, mode: String) -> String {
    forge_ipc::trim_lines(input, mode)
}

#[tauri::command]
fn filter_lines(input: String, pattern: String, invert: bool) -> Result<String, String> {
    forge_ipc::filter_lines(input, pattern, invert)
}

#[tauri::command]
fn count_text(input: String) -> forge_ipc::TextStats {
    forge_ipc::count_text(input)
}

#[tauri::command]
fn test_regex(
    pattern: String,
    flags: String,
    input: String,
    replacement: Option<String>,
) -> Result<forge_ipc::RegexResult, String> {
    forge_ipc::test_regex(pattern, flags, input, replacement)
}

#[tauri::command]
fn text_diff(left: String, right: String) -> Vec<forge_ipc::TextDiffLine> {
    forge_ipc::text_diff(left, right)
}

#[tauri::command]
fn escape_string(input: String, mode: String) -> String {
    forge_ipc::escape_string(input, mode)
}

#[tauri::command]
fn unescape_string(input: String, mode: String) -> Result<String, String> {
    forge_ipc::unescape_string(input, mode)
}

#[tauri::command]
fn lorem_ipsum(paragraphs: usize, sentences_per_para: usize) -> String {
    forge_ipc::lorem_ipsum(paragraphs, sentences_per_para)
}

#[tauri::command]
fn generate_slug(input: String, separator: String) -> String {
    forge_ipc::generate_slug(input, separator)
}

#[tauri::command]
fn parse_cron(expression: String) -> Result<forge_ipc::CronResult, String> {
    forge_ipc::parse_cron(expression)
}

#[tauri::command]
fn markdown_to_html(input: String) -> String {
    forge_ipc::markdown_to_html(input)
}


#[tauri::command]
fn base64_encode(input: String, url_safe: bool) -> String {
    forge_ipc::base64_encode(input, url_safe)
}

#[tauri::command]
fn base64_decode(input: String, url_safe: bool) -> Result<String, String> {
    forge_ipc::base64_decode(input, url_safe)
}

#[tauri::command]
fn hash_text(input: String) -> forge_ipc::HashResult {
    forge_ipc::hash_text(input)
}

#[tauri::command]
fn hmac_sign(key: String, message: String, algorithm: String) -> Result<String, String> {
    forge_ipc::hmac_sign(key, message, algorithm)
}

#[tauri::command]
fn generate_uuid(version: u8) -> Result<String, String> {
    forge_ipc::generate_uuid(version)
}

#[tauri::command]
fn inspect_uuid(s: String) -> Result<forge_ipc::UuidInfo, String> {
    forge_ipc::inspect_uuid(s)
}

#[tauri::command]
fn generate_ulid() -> String {
    forge_ipc::generate_ulid()
}

#[tauri::command]
fn decode_jwt(token: String) -> Result<forge_ipc::JwtParts, String> {
    forge_ipc::decode_jwt(token)
}

#[tauri::command]
fn argon2_hash(password: String) -> Result<String, String> {
    forge_ipc::argon2_hash(password)
}

#[tauri::command]
fn argon2_verify(password: String, hash: String) -> Result<bool, String> {
    forge_ipc::argon2_verify(password, hash)
}

#[tauri::command]
fn bcrypt_hash(password: String, cost: u32) -> Result<String, String> {
    forge_ipc::bcrypt_hash(password, cost)
}

#[tauri::command]
fn bcrypt_verify(password: String, hash: String) -> Result<bool, String> {
    forge_ipc::bcrypt_verify(password, hash)
}

#[tauri::command]
fn aes_encrypt(plaintext: String, passphrase: String) -> Result<String, String> {
    forge_ipc::aes_encrypt(plaintext, passphrase)
}

#[tauri::command]
fn aes_decrypt(ciphertext: String, passphrase: String) -> Result<String, String> {
    forge_ipc::aes_decrypt(ciphertext, passphrase)
}

#[tauri::command]
async fn generate_rsa_keypair(bits: usize) -> Result<forge_ipc::KeypairResult, String> {

    tauri::async_runtime::spawn_blocking(move || forge_ipc::generate_rsa_keypair(bits))
        .await
        .map_err(|e| e.to_string())?
}


#[tauri::command]
fn hex_dump(input: String, bytes_per_row: usize) -> Vec<forge_ipc::HexDumpLine> {
    forge_ipc::hex_dump(input, bytes_per_row)
}

#[tauri::command]
fn hex_to_utf8(hex_str: String) -> Result<String, String> {
    forge_ipc::hex_to_utf8(hex_str)
}

#[tauri::command]
fn utf8_to_hex(input: String) -> String {
    forge_ipc::utf8_to_hex(input)
}

#[tauri::command]
fn hex_to_base64(hex_str: String) -> Result<String, String> {
    forge_ipc::hex_to_base64(hex_str)
}

#[tauri::command]
fn base64_to_hex(b64: String) -> Result<String, String> {
    forge_ipc::base64_to_hex(b64)
}

#[tauri::command]
fn inspect_bytes(hex_str: String) -> Result<forge_ipc::BinaryInspect, String> {
    forge_ipc::inspect_bytes(hex_str)
}

#[tauri::command]
fn convert_base(input: String, from_base: u32) -> Result<forge_ipc::BaseConvResult, String> {
    forge_ipc::convert_base(input, from_base)
}

#[tauri::command]
fn format_number(n: f64, locale_sep: bool, ordinal: bool, sci: bool) -> String {
    forge_ipc::format_number(n, locale_sep, ordinal, sci)
}

#[tauri::command]
fn humanize_bytes(bytes: u64) -> String {
    forge_ipc::humanize_bytes(bytes)
}

#[tauri::command]
fn unix_to_info(unix_secs: i64, tz_name: String) -> Result<forge_ipc::TimestampInfo, String> {
    forge_ipc::unix_to_info(unix_secs, tz_name)
}

#[tauri::command]
fn iso_to_unix(iso: String) -> Result<i64, String> {
    forge_ipc::iso_to_unix(iso)
}

#[tauri::command]
fn now_unix() -> i64 {
    forge_ipc::now_unix()
}

#[tauri::command]
fn parse_duration(input: String) -> Result<forge_ipc::DurationInfo, String> {
    forge_ipc::parse_duration(input)
}

#[tauri::command]
fn parse_color(input: String) -> Result<forge_ipc::ColorInfo, String> {
    forge_ipc::parse_color(input)
}


#[tauri::command]
fn parse_ip(input: String) -> Result<forge_ipc::IpInfo, String> {
    forge_ipc::parse_ip(input)
}

#[tauri::command]
fn lookup_mac_oui(mac: String) -> (String, Option<String>) {
    forge_ipc::lookup_mac_oui(mac)
}

#[tauri::command]
fn parse_url_tool(input: String) -> Result<forge_ipc::UrlInfo, String> {
    forge_ipc::parse_url(input)
}

#[tauri::command]
fn http_status_info(code: u16) -> forge_ipc::HttpStatusInfo {
    forge_ipc::http_status_info(code)
}

#[tauri::command]
fn lookup_mime(input: String) -> forge_ipc::MimeInfo {
    forge_ipc::lookup_mime(input)
}

#[tauri::command]
fn generate_qr_svg(data: String, ec_level: String, size: u32) -> Result<String, String> {
    forge_ipc::generate_qr_svg(data, ec_level, size)
}

#[tauri::command]
fn format_sql(input: String, indent: usize) -> String {
    forge_ipc::format_sql(input, indent)
}

#[tauri::command]
fn parse_ua(ua: String) -> forge_ipc::UaInfo {
    forge_ipc::parse_ua(ua)
}


#[tauri::command]
fn detect_image_cmd(base64_data: String) -> Result<forge_ipc::ImageInfo, String> {
    forge_ipc::detect_image(&base64_data)
}

#[tauri::command]
fn strip_exif_cmd(base64_data: String) -> Result<String, String> {
    forge_ipc::strip_exif(&base64_data)
}

#[tauri::command]
fn optimize_svg_cmd(input: String, remove_metadata: bool) -> Result<forge_ipc::SvgOptResult, String> {
    forge_ipc::optimize_svg(input, remove_metadata)
}

#[tauri::command]
fn decode_asn1_cmd(input: String) -> Result<forge_ipc::Asn1Node, String> {
    forge_ipc::decode_asn1(input)
}

#[tauri::command]
fn inspect_x509_cmd(input: String) -> Result<forge_ipc::CertInfo, String> {
    forge_ipc::inspect_x509(input)
}

#[tauri::command]
fn decode_proto_cmd(input: String) -> Result<Vec<forge_ipc::ProtoField>, String> {
    forge_ipc::decode_proto(input)
}

#[tauri::command]
fn msgpack_to_json_cmd(input: String) -> Result<String, String> {
    forge_ipc::msgpack_to_json(input)
}

#[tauri::command]
fn json_to_msgpack_cmd(json: String) -> Result<String, String> {
    forge_ipc::json_to_msgpack(json)
}


#[tauri::command]
async fn wipe_history(_app: tauri::AppHandle) -> Result<(), String> {


    Ok(())
}

fn toggle_window(window: &WebviewWindow) {
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
    } else {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {

            #[cfg(target_os = "macos")]
            let primary_mod = Modifiers::SUPER;
            #[cfg(not(target_os = "macos"))]
            let primary_mod = Modifiers::CONTROL;
            let shortcut = Shortcut::new(
                Some(primary_mod | Modifiers::SHIFT),
                Code::Space,
            );


            if let Err(e) = app.global_shortcut().on_shortcut(
                shortcut,
                |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            toggle_window(&window);
                        }
                    }
                },
            ) {
                eprintln!("zdataforge: failed to register global shortcut: {e}");
            }


            let show_hide = MenuItem::with_id(app, "show_hide", "Show / Hide", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit ZDataForge", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let menu = Menu::with_items(app, &[&show_hide, &settings, &sep, &quit])?;


            let tray_result = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show_hide" => {
                        if let Some(w) = app.get_webview_window("main") {
                            toggle_window(&w);
                        }
                    }
                    "settings" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                            let _ = w.emit("navigate", "settings");
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        if let Some(w) = tray.app_handle().get_webview_window("main") {
                            toggle_window(&w);
                        }
                    }
                })
                .build(app);
            if let Err(e) = tray_result {
                eprintln!("zdataforge: failed to build system tray: {e}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            format_json,
            validate_json,
            sort_json_keys,
            json_diff,
            json_to_rust,
            json_to_csharp,
            json_to_typescript,
            json_to_go,
            yaml_to_json,
            json_to_yaml,
            toml_to_json,
            json_to_toml,
            csv_to_json,
            json_to_csv,

            convert_case,
            sort_lines,
            deduplicate_lines,
            reverse_lines,
            number_lines,
            trim_lines,
            filter_lines,
            count_text,
            test_regex,
            text_diff,
            escape_string,
            unescape_string,
            lorem_ipsum,
            generate_slug,
            parse_cron,
            markdown_to_html,

            base64_encode,
            base64_decode,
            hash_text,
            hmac_sign,
            generate_uuid,
            inspect_uuid,
            generate_ulid,
            decode_jwt,
            argon2_hash,
            argon2_verify,
            bcrypt_hash,
            bcrypt_verify,
            aes_encrypt,
            aes_decrypt,
            generate_rsa_keypair,

            hex_dump,
            hex_to_utf8,
            utf8_to_hex,
            hex_to_base64,
            base64_to_hex,
            inspect_bytes,
            convert_base,
            format_number,
            humanize_bytes,
            unix_to_info,
            iso_to_unix,
            now_unix,
            parse_duration,
            parse_color,

            parse_ip,
            lookup_mac_oui,
            parse_url_tool,
            http_status_info,
            lookup_mime,
            generate_qr_svg,
            format_sql,
            parse_ua,

            detect_image_cmd,
            strip_exif_cmd,
            optimize_svg_cmd,
            decode_asn1_cmd,
            inspect_x509_cmd,
            decode_proto_cmd,
            msgpack_to_json_cmd,
            json_to_msgpack_cmd,

            wipe_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
