use ipnetwork::IpNetwork;
use url::Url;
use serde::{Serialize, Deserialize};
use std::net::{IpAddr, Ipv4Addr};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpInfo {
    pub address: String,
    pub version: u8,
    pub network: Option<String>,
    pub netmask: Option<String>,
    pub broadcast: Option<String>,
    pub host_min: Option<String>,
    pub host_max: Option<String>,
    pub host_count: Option<u64>,
    pub prefix_len: Option<u8>,
    pub is_private: bool,
    pub is_loopback: bool,
    pub is_multicast: bool,
    pub is_link_local: bool,
    pub class: Option<String>,
}

pub fn parse_ip(input: &str) -> Result<IpInfo, String> {
    let input = input.trim();


    if let Ok(net) = input.parse::<IpNetwork>() {
        match net {
            IpNetwork::V4(v4) => {
                let addr = v4.ip();
                let mask = v4.mask();
                let broadcast = v4.broadcast();
                let host_min = Ipv4Addr::from(u32::from(v4.network()) + 1);
                let host_max = Ipv4Addr::from(u32::from(broadcast) - 1);
                let host_count = if v4.prefix() >= 31 {
                    v4.size() as u64
                } else {
                    (v4.size() as u64).saturating_sub(2)
                };
                return Ok(IpInfo {
                    address: addr.to_string(),
                    version: 4,
                    network: Some(v4.network().to_string()),
                    netmask: Some(mask.to_string()),
                    broadcast: Some(broadcast.to_string()),
                    host_min: Some(host_min.to_string()),
                    host_max: Some(host_max.to_string()),
                    host_count: Some(host_count),
                    prefix_len: Some(v4.prefix()),
                    is_private: addr.is_private(),
                    is_loopback: addr.is_loopback(),
                    is_multicast: addr.is_multicast(),
                    is_link_local: addr.is_link_local(),
                    class: Some(ipv4_class(addr)),
                });
            }
            IpNetwork::V6(v6) => {
                let addr = v6.ip();
                return Ok(IpInfo {
                    address: addr.to_string(),
                    version: 6,
                    network: Some(v6.network().to_string()),
                    netmask: Some(v6.mask().to_string()),
                    broadcast: None,
                    host_min: None,
                    host_max: None,
                    host_count: None,
                    prefix_len: Some(v6.prefix()),
                    is_private: addr.is_loopback(),
                    is_loopback: addr.is_loopback(),
                    is_multicast: addr.is_multicast(),
                    is_link_local: false,
                    class: None,
                });
            }
        }
    }


    if let Ok(ip) = input.parse::<IpAddr>() {
        return Ok(IpInfo {
            address: ip.to_string(),
            version: if ip.is_ipv4() { 4 } else { 6 },
            network: None,
            netmask: None,
            broadcast: None,
            host_min: None,
            host_max: None,
            host_count: None,
            prefix_len: None,
            is_private: match &ip {
                IpAddr::V4(v4) => v4.is_private(),
                IpAddr::V6(_) => false,
            },
            is_loopback: ip.is_loopback(),
            is_multicast: ip.is_multicast(),
            is_link_local: match &ip {
                IpAddr::V4(v4) => v4.is_link_local(),
                IpAddr::V6(_) => false,
            },
            class: match &ip {
                IpAddr::V4(v4) => Some(ipv4_class(*v4)),
                IpAddr::V6(_) => None,
            },
        });
    }

    Err(format!("Cannot parse IP or CIDR: {input}"))
}

fn ipv4_class(addr: Ipv4Addr) -> String {
    let first = addr.octets()[0];
    match first {
        0..=127 => "A".into(),
        128..=191 => "B".into(),
        192..=223 => "C".into(),
        224..=239 => "D (Multicast)".into(),
        240..=255 => "E (Reserved)".into(),
    }
}


pub fn lookup_mac_oui(mac: &str) -> Option<&'static str> {
    let cleaned: String = mac.chars().filter(|c| c.is_alphanumeric()).take(6).collect();
    let prefix = cleaned.to_uppercase();
    match prefix.as_str() {
        "000C29" | "005056" | "000569" => Some("VMware"),
        "0050F2" => Some("Microsoft"),
        "3C5AB4" | "D89EF3" | "A4C3F0" => Some("Apple"),
        "000D3A" => Some("Microsoft Azure"),
        "00163E" => Some("Xen Source"),
        "0004F2" => Some("Polycom"),
        "001A11" => Some("Google"),
        "F45C89" | "6C4008" => Some("Intel"),
        "001E67" => Some("Cisco"),
        "000001" => Some("Xerox"),
        _ => None,
    }
}

pub fn format_mac(mac: &str) -> String {
    let hex: String = mac
        .chars()
        .filter(|c| c.is_alphanumeric())
        .take(12)
        .collect();
    if hex.len() < 12 {
        return mac.to_string();
    }
    format!(
        "{}-{}-{}-{}-{}-{}",
        &hex[0..2],
        &hex[2..4],
        &hex[4..6],
        &hex[6..8],
        &hex[8..10],
        &hex[10..12]
    )
    .to_uppercase()
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UrlInfo {
    pub scheme: String,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub path: String,
    pub query: Option<String>,
    pub query_params: Vec<(String, String)>,
    pub fragment: Option<String>,
    pub username: Option<String>,
}

pub fn parse_url(input: &str) -> Result<UrlInfo, String> {
    let url = Url::parse(input.trim()).map_err(|e| e.to_string())?;
    let query_params: Vec<(String, String)> = url
        .query_pairs()
        .map(|(k, v)| (k.into_owned(), v.into_owned()))
        .collect();
    let username = if url.username().is_empty() {
        None
    } else {
        Some(url.username().to_string())
    };
    Ok(UrlInfo {
        scheme: url.scheme().to_string(),
        host: url.host_str().map(|s| s.to_string()),
        port: url.port(),
        path: url.path().to_string(),
        query: url.query().map(|s| s.to_string()),
        query_params,
        fragment: url.fragment().map(|s| s.to_string()),
        username,
    })
}


pub fn http_status_info(code: u16) -> Option<(&'static str, &'static str)> {
    match code {
        100 => Some(("Continue", "Informational")),
        101 => Some(("Switching Protocols", "Informational")),
        200 => Some(("OK", "Success")),
        201 => Some(("Created", "Success")),
        202 => Some(("Accepted", "Success")),
        204 => Some(("No Content", "Success")),
        206 => Some(("Partial Content", "Success")),
        301 => Some(("Moved Permanently", "Redirection")),
        302 => Some(("Found", "Redirection")),
        304 => Some(("Not Modified", "Redirection")),
        307 => Some(("Temporary Redirect", "Redirection")),
        308 => Some(("Permanent Redirect", "Redirection")),
        400 => Some(("Bad Request", "Client Error")),
        401 => Some(("Unauthorized", "Client Error")),
        403 => Some(("Forbidden", "Client Error")),
        404 => Some(("Not Found", "Client Error")),
        405 => Some(("Method Not Allowed", "Client Error")),
        408 => Some(("Request Timeout", "Client Error")),
        409 => Some(("Conflict", "Client Error")),
        410 => Some(("Gone", "Client Error")),
        413 => Some(("Payload Too Large", "Client Error")),
        415 => Some(("Unsupported Media Type", "Client Error")),
        422 => Some(("Unprocessable Content", "Client Error")),
        429 => Some(("Too Many Requests", "Client Error")),
        500 => Some(("Internal Server Error", "Server Error")),
        501 => Some(("Not Implemented", "Server Error")),
        502 => Some(("Bad Gateway", "Server Error")),
        503 => Some(("Service Unavailable", "Server Error")),
        504 => Some(("Gateway Timeout", "Server Error")),
        _ => None,
    }
}


pub fn mime_from_extension(ext: &str) -> Option<&'static str> {
    match ext.to_lowercase().as_str() {
        "html" | "htm" => Some("text/html"),
        "css" => Some("text/css"),
        "js" | "mjs" => Some("text/javascript"),
        "ts" => Some("text/typescript"),
        "json" => Some("application/json"),
        "xml" => Some("application/xml"),
        "pdf" => Some("application/pdf"),
        "png" => Some("image/png"),
        "jpg" | "jpeg" => Some("image/jpeg"),
        "gif" => Some("image/gif"),
        "svg" => Some("image/svg+xml"),
        "webp" => Some("image/webp"),
        "ico" => Some("image/x-icon"),
        "mp4" => Some("video/mp4"),
        "webm" => Some("video/webm"),
        "mp3" => Some("audio/mpeg"),
        "wav" => Some("audio/wav"),
        "ogg" => Some("audio/ogg"),
        "woff" => Some("font/woff"),
        "woff2" => Some("font/woff2"),
        "ttf" => Some("font/ttf"),
        "zip" => Some("application/zip"),
        "gz" | "gzip" => Some("application/gzip"),
        "tar" => Some("application/x-tar"),
        "csv" => Some("text/csv"),
        "txt" => Some("text/plain"),
        "md" => Some("text/markdown"),
        "yaml" | "yml" => Some("application/yaml"),
        "toml" => Some("application/toml"),
        "wasm" => Some("application/wasm"),
        "bin" => Some("application/octet-stream"),
        "sh" => Some("application/x-sh"),
        "rs" => Some("text/x-rust"),
        "go" => Some("text/x-go"),
        "py" => Some("text/x-python"),
        _ => None,
    }
}

pub fn extension_from_mime(mime: &str) -> Option<&'static str> {
    match mime.to_lowercase().as_str() {
        "text/html" => Some("html"),
        "text/css" => Some("css"),
        "text/javascript" => Some("js"),
        "application/json" => Some("json"),
        "application/xml" => Some("xml"),
        "application/pdf" => Some("pdf"),
        "image/png" => Some("png"),
        "image/jpeg" => Some("jpg"),
        "image/gif" => Some("gif"),
        "image/svg+xml" => Some("svg"),
        "image/webp" => Some("webp"),
        "video/mp4" => Some("mp4"),
        "audio/mpeg" => Some("mp3"),
        "application/zip" => Some("zip"),
        "text/csv" => Some("csv"),
        "text/plain" => Some("txt"),
        "text/markdown" => Some("md"),
        "application/wasm" => Some("wasm"),
        _ => None,
    }
}


pub fn generate_qr_svg(data: &str, ec_level: &str, size: u32) -> Result<String, String> {
    use qrcode::{EcLevel, QrCode};
    use qrcode::render::svg;

    let ec = match ec_level.to_uppercase().as_str() {
        "L" => EcLevel::L,
        "M" => EcLevel::M,
        "Q" => EcLevel::Q,
        _ => EcLevel::H,
    };

    let code = QrCode::with_error_correction_level(data.as_bytes(), ec)
        .map_err(|e| e.to_string())?;

    let svg_str = code
        .render::<svg::Color>()
        .min_dimensions(size, size)
        .dark_color(svg::Color("#000000"))
        .light_color(svg::Color("#ffffff"))
        .quiet_zone(true)
        .build();

    Ok(svg_str)
}


pub fn format_sql(input: &str, indent: usize) -> String {
    use sqlformat::{format, FormatOptions, Indent, QueryParams};
    format(
        input,
        &QueryParams::None,
        &FormatOptions {
            indent: Indent::Spaces(indent as u8),
            uppercase: Some(true),
            lines_between_queries: 1,
            ..FormatOptions::default()
        },
    )
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UaInfo {
    pub browser: Option<String>,
    pub browser_version: Option<String>,
    pub os: Option<String>,
    pub os_version: Option<String>,
    pub device_type: String,
    pub raw: String,
}

pub fn parse_ua(ua: &str) -> UaInfo {
    let ua_lower = ua.to_lowercase();

    let device_type = if ua_lower.contains("mobile") || ua_lower.contains("android") {
        "Mobile"
    } else if ua_lower.contains("tablet") || ua_lower.contains("ipad") {
        "Tablet"
    } else {
        "Desktop"
    }
    .to_string();

    let browser = if ua_lower.contains("chrome") && !ua_lower.contains("chromium") {
        Some("Chrome")
    } else if ua_lower.contains("firefox") {
        Some("Firefox")
    } else if ua_lower.contains("safari") && !ua_lower.contains("chrome") {
        Some("Safari")
    } else if ua_lower.contains("edge") {
        Some("Edge")
    } else if ua_lower.contains("opera") || ua_lower.contains("opr") {
        Some("Opera")
    } else if ua_lower.contains("msie") || ua_lower.contains("trident") {
        Some("Internet Explorer")
    } else {
        None
    };

    let os = if ua_lower.contains("windows") {
        Some("Windows")
    } else if ua_lower.contains("mac os") {
        Some("macOS")
    } else if ua_lower.contains("linux") {
        Some("Linux")
    } else if ua_lower.contains("android") {
        Some("Android")
    } else if ua_lower.contains("iphone") || ua_lower.contains("ipad") {
        Some("iOS")
    } else {
        None
    };


    let browser_version = browser.and_then(|b| {
        let marker = match b {
            "Chrome" => "chrome/",
            "Firefox" => "firefox/",
            "Safari" => "version/",
            "Edge" => "edg/",
            _ => return None,
        };
        ua_lower.find(marker).map(|i| {
            let start = i + marker.len();
            let end = ua_lower[start..]
                .find(|c: char| !c.is_numeric() && c != '.')
                .map_or(ua_lower.len(), |j| start + j);
            ua[start..end].to_string()
        })
    });

    UaInfo {
        browser: browser.map(|s| s.to_string()),
        browser_version,
        os: os.map(|s| s.to_string()),
        os_version: None,
        device_type,
        raw: ua.to_string(),
    }
}
