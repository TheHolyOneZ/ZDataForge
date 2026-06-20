use hex;
use base64::{engine::general_purpose, Engine as _};
use serde::{Serialize, Deserialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HexDumpLine {
    pub offset: String,
    pub hex_bytes: Vec<String>,
    pub ascii: String,
}

pub fn hex_dump(input: &[u8], bytes_per_row: usize) -> Vec<HexDumpLine> {
    let bytes_per_row = if bytes_per_row == 0 { 16 } else { bytes_per_row };
    input.chunks(bytes_per_row).enumerate().map(|(i, chunk)| {
        let offset = format!("{:08X}", i * bytes_per_row);
        let hex_bytes: Vec<String> = chunk.iter().map(|b| format!("{:02X}", b)).collect();
        let ascii: String = chunk.iter().map(|&b| {
            if b.is_ascii_graphic() || b == b' ' { b as char } else { '.' }
        }).collect();
        HexDumpLine { offset, hex_bytes, ascii }
    }).collect()
}


pub fn hex_to_utf8(hex_str: &str) -> Result<String, String> {
    let cleaned: String = hex_str.chars().filter(|c| !c.is_whitespace()).collect();
    let bytes = hex::decode(&cleaned).map_err(|e| e.to_string())?;
    String::from_utf8(bytes).map_err(|e| e.to_string())
}

pub fn utf8_to_hex(input: &str) -> String {
    hex::encode(input.as_bytes())
}

pub fn hex_to_base64(hex_str: &str) -> Result<String, String> {
    let cleaned: String = hex_str.chars().filter(|c| !c.is_whitespace()).collect();
    let bytes = hex::decode(&cleaned).map_err(|e| e.to_string())?;
    Ok(general_purpose::STANDARD.encode(&bytes))
}

pub fn base64_to_hex(b64: &str) -> Result<String, String> {
    let bytes = general_purpose::STANDARD.decode(b64.trim())
        .or_else(|_| general_purpose::URL_SAFE_NO_PAD.decode(b64.trim()))
        .map_err(|e| e.to_string())?;
    Ok(hex::encode(&bytes))
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryInspect {
    pub hex: String,
    pub binary: String,
    pub decimal_u8: u8,
    pub ascii: String,

    pub u16_be: Option<u16>,
    pub i16_be: Option<i16>,
    pub u32_be: Option<u32>,
    pub i32_be: Option<i32>,
    pub f32_be: Option<f32>,
    pub u64_be: Option<u64>,
    pub i64_be: Option<i64>,
    pub f64_be: Option<f64>,

    pub u16_le: Option<u16>,
    pub i16_le: Option<i16>,
    pub u32_le: Option<u32>,
    pub i32_le: Option<i32>,
    pub f32_le: Option<f32>,
    pub u64_le: Option<u64>,
    pub i64_le: Option<i64>,
    pub f64_le: Option<f64>,
}

pub fn inspect_bytes(hex_str: &str) -> Result<BinaryInspect, String> {
    let cleaned: String = hex_str.chars().filter(|c| !c.is_whitespace()).collect();
    let bytes = hex::decode(&cleaned).map_err(|e| e.to_string())?;
    if bytes.is_empty() { return Err("No bytes to inspect".into()); }

    let first = bytes[0];
    let ascii = if first.is_ascii_graphic() || first == b' ' { format!("{}", first as char) } else { ".".into() };

    let u16_be = if bytes.len() >= 2 { Some(u16::from_be_bytes([bytes[0], bytes[1]])) } else { None };
    let i16_be = u16_be.map(|v| v as i16);
    let u32_be = if bytes.len() >= 4 { Some(u32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]])) } else { None };
    let i32_be = u32_be.map(|v| v as i32);
    let f32_be = u32_be.map(f32::from_bits);
    let u64_be = if bytes.len() >= 8 {
        let b: [u8; 8] = bytes[..8].try_into().unwrap();
        Some(u64::from_be_bytes(b))
    } else { None };
    let i64_be = u64_be.map(|v| v as i64);
    let f64_be = u64_be.map(f64::from_bits);

    let u16_le = if bytes.len() >= 2 { Some(u16::from_le_bytes([bytes[0], bytes[1]])) } else { None };
    let i16_le = u16_le.map(|v| v as i16);
    let u32_le = if bytes.len() >= 4 { Some(u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]])) } else { None };
    let i32_le = u32_le.map(|v| v as i32);
    let f32_le = u32_le.map(f32::from_bits);
    let u64_le = if bytes.len() >= 8 {
        let b: [u8; 8] = bytes[..8].try_into().unwrap();
        Some(u64::from_le_bytes(b))
    } else { None };
    let i64_le = u64_le.map(|v| v as i64);
    let f64_le = u64_le.map(f64::from_bits);

    Ok(BinaryInspect {
        hex: format!("{:02X}", first),
        binary: format!("{:08b}", first),
        decimal_u8: first,
        ascii,
        u16_be, i16_be, u32_be, i32_be, f32_be, u64_be, i64_be, f64_be,
        u16_le, i16_le, u32_le, i32_le, f32_le, u64_le, i64_le, f64_le,
    })
}
