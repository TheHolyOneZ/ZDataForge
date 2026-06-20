use chrono::{DateTime, Utc, NaiveDateTime};
use chrono_tz::Tz;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimestampInfo {
    pub unix_seconds: i64,
    pub unix_ms: i64,
    pub utc_iso: String,
    pub utc_rfc2822: String,
    pub local_display: String,
    pub relative: String,
    pub tz_name: String,
}

pub fn unix_to_info(unix_secs: i64, tz_name: &str) -> Result<TimestampInfo, String> {
    let dt_utc = DateTime::from_timestamp(unix_secs, 0)
        .ok_or_else(|| "Invalid unix timestamp".to_string())?;

    let tz: Tz = tz_name.parse().map_err(|e: chrono_tz::ParseError| format!("{e:?}"))?;
    let dt_local = dt_utc.with_timezone(&tz);

    let now = Utc::now();
    let diff = now.signed_duration_since(dt_utc);
    let relative = humanize_duration(diff.num_seconds());

    Ok(TimestampInfo {
        unix_seconds: unix_secs,
        unix_ms: unix_secs * 1000,
        utc_iso: dt_utc.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
        utc_rfc2822: dt_utc.to_rfc2822(),
        local_display: dt_local.format("%Y-%m-%d %H:%M:%S %Z").to_string(),
        relative,
        tz_name: tz_name.to_string(),
    })
}

pub fn iso_to_unix(iso: &str) -> Result<i64, String> {

    if let Ok(dt) = DateTime::parse_from_rfc3339(iso) {
        return Ok(dt.timestamp());
    }
    if let Ok(dt) = DateTime::parse_from_str(iso, "%Y-%m-%dT%H:%M:%S%z") {
        return Ok(dt.timestamp());
    }
    if let Ok(naive) = NaiveDateTime::parse_from_str(iso, "%Y-%m-%dT%H:%M:%S") {
        return Ok(naive.and_utc().timestamp());
    }
    if let Ok(naive) = NaiveDateTime::parse_from_str(iso, "%Y-%m-%d %H:%M:%S") {
        return Ok(naive.and_utc().timestamp());
    }
    Err(format!("Cannot parse: {iso}"))
}

pub fn now_unix() -> i64 {
    Utc::now().timestamp()
}

fn humanize_duration(secs: i64) -> String {
    let abs = secs.unsigned_abs();
    let suffix = if secs >= 0 { "ago" } else { "from now" };
    let (val, unit) = if abs < 60 { (abs, "second") }
        else if abs < 3600 { (abs / 60, "minute") }
        else if abs < 86400 { (abs / 3600, "hour") }
        else if abs < 86400 * 30 { (abs / 86400, "day") }
        else if abs < 86400 * 365 { (abs / (86400 * 30), "month") }
        else { (abs / (86400 * 365), "year") };
    if val == 1 { format!("1 {unit} {suffix}") } else { format!("{val} {unit}s {suffix}") }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DurationInfo {
    pub total_seconds: i64,
    pub human: String,
    pub iso8601: String,
    pub breakdown: DurationBreakdown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DurationBreakdown {
    pub days: i64,
    pub hours: i64,
    pub minutes: i64,
    pub seconds: i64,
}

pub fn parse_duration(input: &str) -> Result<DurationInfo, String> {
    let trimmed = input.trim().to_lowercase();
    if trimmed.is_empty() {
        return Err("empty input".into());
    }

    let total_ms = if trimmed.chars().all(|c| c.is_ascii_digit()) {
        trimmed.parse::<i64>().map_err(|e| e.to_string())? * 1000
    } else if is_colon_format(&trimmed) {
        parse_colon_duration(&trimmed)?
    } else {
        parse_human_duration(&trimmed)?
    };

    let total_secs = total_ms / 1000;
    let days = total_secs / 86400;
    let hours = (total_secs % 86400) / 3600;
    let minutes = (total_secs % 3600) / 60;
    let seconds = total_secs % 60;

    let mut parts: Vec<String> = Vec::new();
    if days > 0 { parts.push(format!("{days}d")); }
    if hours > 0 { parts.push(format!("{hours}h")); }
    if minutes > 0 { parts.push(format!("{minutes}m")); }
    if seconds > 0 || parts.is_empty() { parts.push(format!("{seconds}s")); }
    let human = parts.join(" ");

    let mut iso = String::from("P");
    if days > 0 { iso.push_str(&format!("{days}D")); }
    iso.push('T');
    if hours > 0 { iso.push_str(&format!("{hours}H")); }
    if minutes > 0 { iso.push_str(&format!("{minutes}M")); }
    if seconds > 0 { iso.push_str(&format!("{seconds}S")); }
    if iso == "PT" { iso.push_str("0S"); }

    Ok(DurationInfo {
        total_seconds: total_secs,
        human,
        iso8601: iso,
        breakdown: DurationBreakdown { days, hours, minutes, seconds },
    })
}

fn is_colon_format(s: &str) -> bool {
    s.contains(':') && s.chars().all(|c| c.is_ascii_digit() || c == ':' || c == '.')
}

fn parse_colon_duration(s: &str) -> Result<i64, String> {

    let parts: Vec<&str> = s.split(':').collect();
    if parts.len() > 3 {
        return Err(format!("Invalid colon-format duration: {s}"));
    }
    let last_idx = parts.len() - 1;
    let mut total_ms: i64 = 0;
    for (i, part) in parts.iter().enumerate() {
        let pos = last_idx - i;
        if i == last_idx && part.contains('.') {
            let f: f64 = part.parse().map_err(|_| format!("invalid number: {part}"))?;
            total_ms += (f * 1000.0).round() as i64;
        } else {
            let n: i64 = part.parse().map_err(|_| format!("invalid number: {part}"))?;
            let multiplier_ms = match pos {
                0 => 1000,
                1 => 60_000,
                2 => 3_600_000,
                _ => return Err("too many components".into()),
            };
            total_ms += n * multiplier_ms;
        }
    }
    Ok(total_ms)
}

fn parse_human_duration(s: &str) -> Result<i64, String> {


    let cleaned: String = s
        .replace(',', " ")
        .replace('&', " ")
        .split_whitespace()
        .filter(|w| !w.is_empty() && *w != "and")
        .collect::<Vec<_>>()
        .join(" ");

    let mut total_ms: i64 = 0;
    let bytes = cleaned.as_bytes();
    let mut i = 0;
    let n_bytes = bytes.len();

    while i < n_bytes {

        while i < n_bytes && bytes[i].is_ascii_whitespace() { i += 1; }
        if i >= n_bytes { break; }


        let num_start = i;
        while i < n_bytes && (bytes[i].is_ascii_digit() || bytes[i] == b'.') { i += 1; }
        if i == num_start {
            return Err(format!("expected a number at '{}…'", &cleaned[i..(i + 8).min(n_bytes)]));
        }
        let num_str = &cleaned[num_start..i];
        let n: f64 = num_str.parse().map_err(|_| format!("invalid number: {num_str}"))?;


        while i < n_bytes && bytes[i].is_ascii_whitespace() { i += 1; }


        let unit_start = i;
        while i < n_bytes && bytes[i].is_ascii_alphabetic() { i += 1; }
        if i == unit_start {
            return Err(format!("expected a unit after {num_str}"));
        }
        let unit = &cleaned[unit_start..i];

        let unit_ms: f64 = match unit {
            "ms" | "millisecond" | "milliseconds" => 1.0,
            "s" | "sec" | "secs" | "second" | "seconds" => 1_000.0,
            "m" | "min" | "mins" | "minute" | "minutes" => 60_000.0,
            "h" | "hr" | "hrs" | "hour" | "hours" => 3_600_000.0,
            "d" | "day" | "days" => 86_400_000.0,
            "w" | "wk" | "wks" | "week" | "weeks" => 604_800_000.0,
            "y" | "yr" | "yrs" | "year" | "years" => 31_557_600_000.0,
            _ => return Err(format!("unknown duration unit: {unit}")),
        };
        total_ms += (n * unit_ms).round() as i64;
    }

    Ok(total_ms)
}
