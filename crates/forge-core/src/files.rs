use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub color_mode: String,
    pub bit_depth: u8,
    pub file_size: usize,
    pub has_exif: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SvgOptResult {
    pub output: String,
    pub original_size: usize,
    pub optimized_size: usize,
    pub savings_pct: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Asn1Node {
    pub tag: String,
    pub tag_num: u8,
    pub constructed: bool,
    pub length: usize,
    pub children: Vec<Asn1Node>,
    pub value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CertInfo {
    pub subject: String,
    pub issuer: String,
    pub serial: String,
    pub not_before: String,
    pub not_after: String,
    pub days_remaining: i64,
    pub key_algorithm: String,
    pub sig_algorithm: String,
    pub sans: Vec<String>,
    pub is_ca: bool,
    pub fingerprint_sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtoField {
    pub field_number: u32,
    pub wire_type: String,
    pub value: String,
}


pub fn detect_image(data: &[u8]) -> Result<ImageInfo, String> {
    let format = detect_format_from_magic(data)
        .ok_or_else(|| "Unknown or unsupported image format".to_string())?;

    let img = image::load_from_memory(data).map_err(|e| format!("Failed to decode image: {e}"))?;

    let (bit_depth, color_mode) = match img.color() {
        image::ColorType::L8 => (8u8, "Grayscale"),
        image::ColorType::La8 => (8, "Grayscale+Alpha"),
        image::ColorType::Rgb8 => (8, "RGB"),
        image::ColorType::Rgba8 => (8, "RGBA"),
        image::ColorType::L16 => (16, "Grayscale"),
        image::ColorType::La16 => (16, "Grayscale+Alpha"),
        image::ColorType::Rgb16 => (16, "RGB"),
        image::ColorType::Rgba16 => (16, "RGBA"),
        image::ColorType::Rgb32F => (32, "RGB Float"),
        image::ColorType::Rgba32F => (32, "RGBA Float"),
        _ => (8, "Unknown"),
    };

    let has_exif = detect_exif(data, &format);

    Ok(ImageInfo {
        format,
        width: img.width(),
        height: img.height(),
        color_mode: color_mode.to_string(),
        bit_depth,
        file_size: data.len(),
        has_exif,
    })
}

fn detect_format_from_magic(data: &[u8]) -> Option<String> {
    if data.len() < 4 {
        return None;
    }
    match data {
        d if d.starts_with(b"\x89PNG\r\n\x1a\n") => Some("PNG".to_string()),
        d if d.starts_with(b"\xFF\xD8\xFF") => Some("JPEG".to_string()),
        d if d.starts_with(b"GIF87a") || d.starts_with(b"GIF89a") => Some("GIF".to_string()),
        d if d.starts_with(b"RIFF") && d.len() > 11 && &d[8..12] == b"WEBP" => {
            Some("WebP".to_string())
        }
        d if d.starts_with(b"BM") => Some("BMP".to_string()),
        d if (d.starts_with(b"II") || d.starts_with(b"MM"))
            && d.len() > 3
            && (d[2] == 0x2A && d[3] == 0x00 || d[2] == 0x00 && d[3] == 0x2A) =>
        {
            Some("TIFF".to_string())
        }
        d if d.len() >= 4 && d[0] == 0x00 && d[1] == 0x00 && d[2] == 0x01 && d[3] == 0x00 => {
            Some("ICO".to_string())
        }
        _ => None,
    }
}

fn detect_exif(data: &[u8], format: &str) -> bool {
    match format {
        "JPEG" => {

            let mut i = 2usize;
            while i + 3 < data.len() {
                if data[i] != 0xFF {
                    break;
                }
                let marker = data[i + 1];
                if marker == 0xE1 {

                    if i + 10 < data.len() && &data[i + 4..i + 8] == b"Exif" {
                        return true;
                    }
                }
                if marker == 0xD9 || marker == 0xDA {
                    break;
                }
                if i + 3 >= data.len() {
                    break;
                }
                let len = u16::from_be_bytes([data[i + 2], data[i + 3]]) as usize;
                if len < 2 {
                    break;
                }
                i += 2 + len;
            }
            false
        }
        "PNG" => {

            let mut pos = 8usize;
            while pos + 8 <= data.len() {
                let len = u32::from_be_bytes([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]]) as usize;
                let chunk_type = &data[pos + 4..pos + 8];
                if chunk_type == b"eXIf" || chunk_type == b"tEXt" || chunk_type == b"iTXt" {
                    return true;
                }
                if chunk_type == b"IEND" {
                    break;
                }
                pos += 12 + len;
            }
            false
        }
        _ => false,
    }
}

pub fn strip_exif(data: &[u8]) -> Result<Vec<u8>, String> {
    let format = detect_format_from_magic(data)
        .ok_or_else(|| "Unknown or unsupported image format".to_string())?;

    let clean = match format.as_str() {
        "JPEG" => strip_jpeg_exif(data),
        "PNG" => strip_png_metadata(data),
        _ => data.to_vec(),
    };

    Ok(STANDARD.encode(&clean).into_bytes())
}

fn strip_jpeg_exif(data: &[u8]) -> Vec<u8> {
    let mut out = Vec::with_capacity(data.len());

    out.extend_from_slice(&data[..2]);
    let mut i = 2usize;
    while i + 1 < data.len() {
        if data[i] != 0xFF {

            out.extend_from_slice(&data[i..]);
            break;
        }
        let marker = data[i + 1];

        if marker == 0xDA {
            out.extend_from_slice(&data[i..]);
            break;
        }

        if marker == 0xD9 {
            out.extend_from_slice(&data[i..]);
            break;
        }

        if marker >= 0xD0 && marker <= 0xD9 {
            out.push(data[i]);
            out.push(data[i + 1]);
            i += 2;
            continue;
        }
        if i + 3 >= data.len() {
            out.extend_from_slice(&data[i..]);
            break;
        }
        let len = u16::from_be_bytes([data[i + 2], data[i + 3]]) as usize;

        if marker == 0xE1 {

            i += 2 + len;
            continue;
        }

        let end = (i + 2 + len).min(data.len());
        out.extend_from_slice(&data[i..end]);
        i += 2 + len;
    }
    out
}

fn strip_png_metadata(data: &[u8]) -> Vec<u8> {
    let mut out = Vec::with_capacity(data.len());

    out.extend_from_slice(&data[..8]);
    let mut pos = 8usize;
    while pos + 12 <= data.len() {
        let len = u32::from_be_bytes([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]]) as usize;
        if pos + 12 + len > data.len() {
            break;
        }
        let chunk_type = &data[pos + 4..pos + 8];
        let skip = matches!(chunk_type, b"tEXt" | b"iTXt" | b"zTXt" | b"eXIf");
        if !skip {
            out.extend_from_slice(&data[pos..pos + 12 + len]);
        }
        if chunk_type == b"IEND" {
            break;
        }
        pos += 12 + len;
    }
    out
}


pub fn optimize_svg(input: &str, remove_metadata: bool) -> Result<SvgOptResult, String> {
    let original_size = input.len();
    let output = do_optimize_svg(input, remove_metadata);
    let optimized_size = output.len();
    let savings_pct = if original_size > 0 {
        (1.0 - optimized_size as f64 / original_size as f64) * 100.0
    } else {
        0.0
    };
    Ok(SvgOptResult {
        output,
        original_size,
        optimized_size,
        savings_pct,
    })
}

fn do_optimize_svg(input: &str, remove_metadata: bool) -> String {
    let mut s = input.to_string();


    while let (Some(start), Some(end)) = (s.find("<!--"), s.find("-->")) {
        if start < end {
            s.replace_range(start..end + 3, "");
        } else {
            break;
        }
    }

    if remove_metadata {

        for tag in &["metadata", "title", "desc"] {
            loop {
                let open = format!("<{}", tag);
                let close = format!("</{}>", tag);
                match (s.find(&open), s.find(&close)) {
                    (Some(start), Some(end)) if start <= end => {
                        s.replace_range(start..end + close.len(), "");
                    }
                    _ => break,
                }
            }
        }
    }


    let re_empty_attr = regex::Regex::new(r#"\s+\w[\w:-]*\s*=\s*"""#).unwrap();
    s = re_empty_attr.replace_all(&s, "").to_string();


    let re_num = regex::Regex::new(r"-?\d+\.\d{4,}").unwrap();
    s = re_num
        .replace_all(&s, |caps: &regex::Captures| {
            let n: f64 = caps[0].parse().unwrap_or(0.0);
            format!("{:.3}", n)
                .trim_end_matches('0')
                .trim_end_matches('.')
                .to_string()
        })
        .to_string();


    let re_ws = regex::Regex::new(r"[ \t\r\n]+").unwrap();

    s = collapse_whitespace_outside_quotes(&s, &re_ws);


    let re_between = regex::Regex::new(r">\s+<").unwrap();
    s = re_between.replace_all(&s, "><").to_string();

    s.trim().to_string()
}

fn collapse_whitespace_outside_quotes(input: &str, re: &regex::Regex) -> String {

    let mut result = String::with_capacity(input.len());
    let mut in_quote = false;
    let mut quote_char = '"';
    let chars: Vec<char> = input.chars().collect();
    let mut i = 0;
    let mut current_segment = String::new();

    while i < chars.len() {
        let c = chars[i];
        if !in_quote && (c == '"' || c == '\'') {

            result.push_str(&re.replace_all(&current_segment, " "));
            current_segment.clear();
            in_quote = true;
            quote_char = c;
            result.push(c);
        } else if in_quote && c == quote_char {
            in_quote = false;
            result.push(c);
        } else if in_quote {
            result.push(c);
        } else {
            current_segment.push(c);
        }
        i += 1;
    }
    result.push_str(&re.replace_all(&current_segment, " "));
    result
}


pub fn decode_asn1(input: &str) -> Result<Asn1Node, String> {
    let der = parse_asn1_input(input)?;
    let (node, _) = parse_der_node(&der, 0).map_err(|e| format!("ASN.1 parse error: {e}"))?;
    Ok(node)
}

fn parse_asn1_input(input: &str) -> Result<Vec<u8>, String> {
    let trimmed = input.trim();
    if trimmed.starts_with("-----BEGIN") {

        let b64: String = trimmed
            .lines()
            .filter(|l| !l.starts_with("-----"))
            .collect::<Vec<_>>()
            .join("");
        STANDARD.decode(b64).map_err(|e| format!("Invalid PEM base64: {e}"))
    } else {

        let hex_clean: String = trimmed.chars().filter(|c| !c.is_whitespace()).collect();
        hex::decode(&hex_clean).map_err(|e| format!("Invalid hex: {e}"))
    }
}

fn parse_der_node(data: &[u8], pos: usize) -> Result<(Asn1Node, usize), String> {
    if pos >= data.len() {
        return Err("Unexpected end of data".to_string());
    }

    let tag_byte = data[pos];
    let tag_class = (tag_byte >> 6) & 0x03;
    let constructed = (tag_byte & 0x20) != 0;
    let tag_num = tag_byte & 0x1F;

    let mut offset = pos + 1;


    if offset >= data.len() {
        return Err("Missing length byte".to_string());
    }
    let first_len = data[offset];
    offset += 1;
    let length = if first_len < 0x80 {
        first_len as usize
    } else {
        let num_bytes = (first_len & 0x7F) as usize;
        if offset + num_bytes > data.len() {
            return Err("Length encoding too long".to_string());
        }
        let mut l = 0usize;
        for i in 0..num_bytes {
            l = (l << 8) | data[offset + i] as usize;
        }
        offset += num_bytes;
        l
    };

    let value_start = offset;
    let value_end = value_start + length;

    if value_end > data.len() {
        return Err(format!(
            "Value extends past end of data ({value_end} > {})",
            data.len()
        ));
    }

    let tag_name = asn1_tag_name(tag_class, constructed, tag_num);

    let (children, value) = if constructed {
        let mut children = Vec::new();
        let mut child_pos = value_start;
        while child_pos < value_end {
            match parse_der_node(data, child_pos) {
                Ok((child, next)) => {
                    child_pos = next;
                    children.push(child);
                }
                Err(_) => break,
            }
        }
        (children, None)
    } else {
        let val_bytes = &data[value_start..value_end];
        let value_str = format_primitive_value(tag_num, tag_class, val_bytes);
        (vec![], Some(value_str))
    };

    Ok((
        Asn1Node {
            tag: tag_name,
            tag_num: tag_byte,
            constructed,
            length,
            children,
            value,
        },
        value_end,
    ))
}

fn asn1_tag_name(class: u8, constructed: bool, num: u8) -> String {
    match class {
        0 => match num {
            0x01 => "BOOLEAN".to_string(),
            0x02 => "INTEGER".to_string(),
            0x03 => "BIT STRING".to_string(),
            0x04 => "OCTET STRING".to_string(),
            0x05 => "NULL".to_string(),
            0x06 => "OID".to_string(),
            0x0C => "UTF8String".to_string(),
            0x12 => "NumericString".to_string(),
            0x13 => "PrintableString".to_string(),
            0x16 => "IA5String".to_string(),
            0x17 => "UTCTime".to_string(),
            0x18 => "GeneralizedTime".to_string(),
            0x1E => "BMPString".to_string(),
            0x30 => "SEQUENCE".to_string(),
            0x31 => "SET".to_string(),
            n => {
                if constructed {
                    format!("UNIVERSAL CONSTRUCTED [{n}]")
                } else {
                    format!("UNIVERSAL [{n}]")
                }
            }
        },
        1 => format!("APPLICATION [{num}]"),
        2 => {
            if constructed {
                format!("CONTEXT CONSTRUCTED [{num}]")
            } else {
                format!("CONTEXT [{num}]")
            }
        }
        3 => format!("PRIVATE [{num}]"),
        _ => format!("UNKNOWN [{num}]"),
    }
}

fn format_primitive_value(tag_num: u8, tag_class: u8, data: &[u8]) -> String {
    if tag_class != 0 {

        return hex::encode(data);
    }
    match tag_num {
        0x01 => {

            if data.is_empty() {
                "FALSE".to_string()
            } else if data[0] == 0 {
                "FALSE".to_string()
            } else {
                "TRUE".to_string()
            }
        }
        0x02 => {

            if data.len() <= 8 {
                let mut val = 0i64;
                let sign_bit = data[0] & 0x80 != 0;
                for &b in data {
                    val = (val << 8) | b as i64;
                }

                if sign_bit && data.len() < 8 {
                    let bits = data.len() * 8;
                    val |= -(1i64 << bits);
                }
                format!("{val} (0x{})", hex::encode(data))
            } else {
                hex::encode(data)
            }
        }
        0x03 => {

            if data.is_empty() {
                String::new()
            } else {
                format!("{} unused bits: {}", data[0], hex::encode(&data[1..]))
            }
        }
        0x05 => "NULL".to_string(),
        0x06 => {

            format_oid(data)
        }
        0x0C | 0x13 | 0x16 | 0x12 | 0x1E => {

            String::from_utf8_lossy(data).to_string()
        }
        0x17 | 0x18 => {

            String::from_utf8_lossy(data).to_string()
        }
        0x04 => {

            if let Ok(s) = std::str::from_utf8(data) {
                if s.chars().all(|c| c.is_ascii_graphic() || c == ' ') {
                    return format!("{s} (0x{})", hex::encode(data));
                }
            }
            hex::encode(data)
        }
        _ => hex::encode(data),
    }
}

fn format_oid(data: &[u8]) -> String {
    if data.is_empty() {
        return String::new();
    }
    let mut components = Vec::new();

    let first = data[0];
    components.push((first / 40).to_string());
    components.push((first % 40).to_string());

    let mut i = 1;
    while i < data.len() {
        let mut val = 0u64;
        loop {
            if i >= data.len() {
                break;
            }
            let b = data[i];
            i += 1;
            val = (val << 7) | (b & 0x7F) as u64;
            if b & 0x80 == 0 {
                break;
            }
        }
        components.push(val.to_string());
    }
    components.join(".")
}


pub fn inspect_x509(input: &str) -> Result<CertInfo, String> {
    use sha2::Digest;
    use x509_parser::prelude::*;

    let der = parse_asn1_input(input)?;

    let (_, cert) = X509Certificate::from_der(&der)
        .map_err(|e| format!("Failed to parse certificate: {e}"))?;

    let subject = cert.subject().to_string();
    let issuer = cert.issuer().to_string();
    let serial = format!("{:X}", cert.serial);

    let not_before = cert.validity().not_before.to_rfc2822().unwrap_or_default();
    let not_after = cert.validity().not_after.to_rfc2822().unwrap_or_default();


    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let not_after_ts = cert.validity().not_after.timestamp();
    let days_remaining = (not_after_ts - now as i64) / 86400;

    let key_algorithm = cert
        .tbs_certificate
        .subject_pki
        .algorithm
        .algorithm
        .to_string();

    let sig_algorithm = cert.signature_algorithm.algorithm.to_string();


    let mut sans = Vec::new();
    if let Ok(Some(san_ext)) = cert.tbs_certificate.subject_alternative_name() {
        for gn in &san_ext.value.general_names {
            match gn {
                GeneralName::DNSName(name) => sans.push(format!("DNS:{name}")),
                GeneralName::IPAddress(bytes) => {
                    if bytes.len() == 4 {
                        sans.push(format!(
                            "IP:{}.{}.{}.{}",
                            bytes[0], bytes[1], bytes[2], bytes[3]
                        ));
                    } else {
                        sans.push(format!("IP:{}", hex::encode(bytes)));
                    }
                }
                GeneralName::RFC822Name(email) => sans.push(format!("Email:{email}")),
                GeneralName::URI(uri) => sans.push(format!("URI:{uri}")),
                _ => {}
            }
        }
    }


    let is_ca = cert.tbs_certificate.is_ca();


    let mut hasher = sha2::Sha256::new();
    hasher.update(&der);
    let fp_bytes = hasher.finalize();
    let fingerprint_sha256 = fp_bytes
        .iter()
        .map(|b| format!("{b:02X}"))
        .collect::<Vec<_>>()
        .join(":");

    Ok(CertInfo {
        subject,
        issuer,
        serial,
        not_before,
        not_after,
        days_remaining,
        key_algorithm,
        sig_algorithm,
        sans,
        is_ca,
        fingerprint_sha256,
    })
}


pub fn decode_proto(input: &str) -> Result<Vec<ProtoField>, String> {
    let trimmed = input.trim();
    let bytes = if trimmed.chars().all(|c| c.is_ascii_hexdigit() || c.is_whitespace()) {
        let hex_clean: String = trimmed.chars().filter(|c| !c.is_whitespace()).collect();
        hex::decode(&hex_clean).map_err(|e| format!("Invalid hex: {e}"))?
    } else {
        STANDARD.decode(trimmed).map_err(|e| format!("Invalid base64: {e}"))?
    };

    decode_proto_bytes(&bytes)
}

fn decode_proto_bytes(data: &[u8]) -> Result<Vec<ProtoField>, String> {
    let mut fields = Vec::new();
    let mut pos = 0usize;

    while pos < data.len() {

        let (tag_val, new_pos) = read_varint(data, pos)?;
        pos = new_pos;

        let field_number = (tag_val >> 3) as u32;
        let wire_type_num = (tag_val & 0x7) as u8;

        let (wire_type_str, value_str, next_pos) = match wire_type_num {
            0 => {

                let (val, np) = read_varint(data, pos)?;
                let s = format!("{val} (0x{val:x})");
                ("varint".to_string(), s, np)
            }
            1 => {

                if pos + 8 > data.len() {
                    return Err("Unexpected end of data for 64-bit field".to_string());
                }
                let bytes: [u8; 8] = data[pos..pos + 8].try_into().unwrap();
                let u = u64::from_le_bytes(bytes);
                let f = f64::from_le_bytes(bytes);
                (
                    "64-bit".to_string(),
                    format!("uint64={u} / float64={f:.6} / hex={}", hex::encode(&bytes)),
                    pos + 8,
                )
            }
            2 => {

                let (len, np) = read_varint(data, pos)?;
                let len = len as usize;
                pos = np;
                if pos + len > data.len() {
                    return Err("Length-delimited field extends past end".to_string());
                }
                let bytes = &data[pos..pos + len];
                let value_str = if let Ok(s) = std::str::from_utf8(bytes) {
                    if s.chars().all(|c| c.is_ascii_graphic() || c == ' ' || c == '\n') {
                        format!("string={s:?}")
                    } else {
                        format!("bytes={}", hex::encode(bytes))
                    }
                } else {
                    format!("bytes={}", hex::encode(bytes))
                };
                ("length-delimited".to_string(), value_str, pos + len)
            }
            5 => {

                if pos + 4 > data.len() {
                    return Err("Unexpected end of data for 32-bit field".to_string());
                }
                let bytes: [u8; 4] = data[pos..pos + 4].try_into().unwrap();
                let u = u32::from_le_bytes(bytes);
                let f = f32::from_le_bytes(bytes);
                (
                    "32-bit".to_string(),
                    format!("uint32={u} / float32={f:.6} / hex={}", hex::encode(&bytes)),
                    pos + 4,
                )
            }
            wt => {
                return Err(format!("Unknown wire type {wt} at position {pos}"));
            }
        };

        fields.push(ProtoField {
            field_number,
            wire_type: wire_type_str,
            value: value_str,
        });
        pos = next_pos;
    }

    Ok(fields)
}

fn read_varint(data: &[u8], pos: usize) -> Result<(u64, usize), String> {
    let mut result = 0u64;
    let mut shift = 0u32;
    let mut p = pos;
    loop {
        if p >= data.len() {
            return Err(format!("Unexpected end of data reading varint at {pos}"));
        }
        let byte = data[p];
        p += 1;
        result |= ((byte & 0x7F) as u64) << shift;
        if byte & 0x80 == 0 {
            break;
        }
        shift += 7;
        if shift > 63 {
            return Err("Varint too large".to_string());
        }
    }
    Ok((result, p))
}


pub fn msgpack_to_json(input: &str) -> Result<String, String> {
    let trimmed = input.trim();
    let bytes = if trimmed.chars().all(|c| c.is_ascii_hexdigit() || c.is_whitespace()) {
        let hex_clean: String = trimmed.chars().filter(|c| !c.is_whitespace()).collect();
        hex::decode(&hex_clean).map_err(|e| format!("Invalid hex: {e}"))?
    } else {
        STANDARD.decode(trimmed).map_err(|e| format!("Invalid base64: {e}"))?
    };

    let value = rmpv::decode::read_value(&mut bytes.as_slice())
        .map_err(|e| format!("Failed to decode MessagePack: {e}"))?;

    let json_value = rmpv_to_json(&value);
    serde_json::to_string_pretty(&json_value).map_err(|e| e.to_string())
}

pub fn json_to_msgpack(json: &str) -> Result<String, String> {
    let json_val: serde_json::Value =
        serde_json::from_str(json).map_err(|e| format!("Invalid JSON: {e}"))?;

    let rmp_val = json_to_rmpv(&json_val);
    let mut buf = Vec::new();
    rmpv::encode::write_value(&mut buf, &rmp_val)
        .map_err(|e| format!("Failed to encode MessagePack: {e}"))?;

    Ok(hex::encode(&buf))
}

fn rmpv_to_json(val: &rmpv::Value) -> serde_json::Value {
    match val {
        rmpv::Value::Nil => serde_json::Value::Null,
        rmpv::Value::Boolean(b) => serde_json::Value::Bool(*b),
        rmpv::Value::Integer(i) => {
            if let Some(n) = i.as_u64() {
                serde_json::Value::Number(n.into())
            } else if let Some(n) = i.as_i64() {
                serde_json::Value::Number(n.into())
            } else {
                serde_json::Value::Null
            }
        }
        rmpv::Value::F32(f) => serde_json::json!(*f),
        rmpv::Value::F64(f) => serde_json::json!(*f),
        rmpv::Value::String(s) => {
            serde_json::Value::String(s.as_str().unwrap_or("").to_string())
        }
        rmpv::Value::Binary(b) => serde_json::Value::String(hex::encode(b)),
        rmpv::Value::Array(arr) => {
            serde_json::Value::Array(arr.iter().map(rmpv_to_json).collect())
        }
        rmpv::Value::Map(map) => {
            let mut obj = serde_json::Map::new();
            for (k, v) in map {
                let key = match k {
                    rmpv::Value::String(s) => s.as_str().unwrap_or("").to_string(),
                    other => format!("{other}"),
                };
                obj.insert(key, rmpv_to_json(v));
            }
            serde_json::Value::Object(obj)
        }
        rmpv::Value::Ext(t, b) => {
            serde_json::json!({ "ext_type": t, "data": hex::encode(b) })
        }
    }
}

fn json_to_rmpv(val: &serde_json::Value) -> rmpv::Value {
    match val {
        serde_json::Value::Null => rmpv::Value::Nil,
        serde_json::Value::Bool(b) => rmpv::Value::Boolean(*b),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                rmpv::Value::Integer(i.into())
            } else if let Some(u) = n.as_u64() {
                rmpv::Value::Integer(u.into())
            } else {
                rmpv::Value::F64(n.as_f64().unwrap_or(0.0))
            }
        }
        serde_json::Value::String(s) => rmpv::Value::String(s.as_str().into()),
        serde_json::Value::Array(arr) => {
            rmpv::Value::Array(arr.iter().map(json_to_rmpv).collect())
        }
        serde_json::Value::Object(map) => {
            let pairs = map
                .iter()
                .map(|(k, v)| (rmpv::Value::String(k.as_str().into()), json_to_rmpv(v)))
                .collect();
            rmpv::Value::Map(pairs)
        }
    }
}
