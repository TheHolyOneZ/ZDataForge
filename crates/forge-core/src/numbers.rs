use serde::{Serialize, Deserialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaseConvResult {
    pub binary: String,
    pub octal: String,
    pub decimal: String,
    pub hex: String,
}

pub fn convert_base(input: &str, from_base: u32) -> Result<BaseConvResult, String> {
    let clean = input.trim().to_uppercase();
    let n = i64::from_str_radix(&clean, from_base).map_err(|e| e.to_string())?;
    Ok(BaseConvResult {
        binary: format!("{:b}", n),
        octal: format!("{:o}", n),
        decimal: n.to_string(),
        hex: format!("{:X}", n),
    })
}

pub fn to_arbitrary_base(n: i64, base: u32) -> Result<String, String> {
    if base < 2 || base > 36 { return Err("Base must be between 2 and 36".into()); }
    if n == 0 { return Ok("0".into()); }
    const DIGITS: &[u8] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let mut result = Vec::new();
    let mut v = n.unsigned_abs();
    while v > 0 {
        result.push(DIGITS[(v % base as u64) as usize] as char);
        v /= base as u64;
    }
    if n < 0 { result.push('-'); }
    result.reverse();
    Ok(result.into_iter().collect())
}


pub fn format_number(n: f64, locale_sep: bool, ordinal: bool, sci: bool) -> String {
    if sci {
        return format!("{:e}", n);
    }
    let abs = n.abs();
    let formatted = if locale_sep {
        let int_part = abs.floor() as i64;
        let frac = abs - int_part as f64;
        let int_str = format_with_sep(int_part);
        if frac > 0.0 {
            format!("{}.{}", int_str, format!("{:.6}", frac).trim_start_matches('0').trim_end_matches('0'))
        } else {
            int_str
        }
    } else {
        format!("{}", abs)
    };
    let signed = if n < 0.0 { format!("-{formatted}") } else { formatted };
    if ordinal { format!("{}{}", signed, ordinal_suffix(n as i64)) } else { signed }
}

fn format_with_sep(n: i64) -> String {
    let s = n.to_string();
    let mut result = String::new();
    for (i, c) in s.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 { result.push(','); }
        result.push(c);
    }
    result.chars().rev().collect()
}

fn ordinal_suffix(n: i64) -> &'static str {
    let abs = n.unsigned_abs();
    let last_two = abs % 100;
    let last_one = abs % 10;
    if last_two >= 11 && last_two <= 13 { return "th"; }
    match last_one { 1 => "st", 2 => "nd", 3 => "rd", _ => "th" }
}

pub fn humanize_bytes(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB", "PB"];
    if bytes == 0 { return "0 B".into(); }
    let i = (bytes as f64).log(1024.0).floor() as usize;
    let i = i.min(UNITS.len() - 1);
    let val = bytes as f64 / 1024_f64.powi(i as i32);
    if i == 0 { format!("{} B", bytes) }
    else { format!("{:.2} {}", val, UNITS[i]) }
}
