use regex::Regex;
use std::collections::HashSet;


pub fn to_snake_case(s: &str) -> String {
    split_words(s).join("_").to_lowercase()
}

pub fn to_camel_case(s: &str) -> String {
    let words = split_words(s);
    words
        .iter()
        .enumerate()
        .map(|(i, w)| {
            if i == 0 {
                w.to_lowercase()
            } else {
                capitalize(w)
            }
        })
        .collect()
}

pub fn to_pascal_case(s: &str) -> String {
    split_words(s).iter().map(|w| capitalize(w)).collect()
}

pub fn to_kebab_case(s: &str) -> String {
    split_words(s).join("-").to_lowercase()
}

pub fn to_screaming_snake(s: &str) -> String {
    split_words(s).join("_").to_uppercase()
}

pub fn to_title_case(s: &str) -> String {
    split_words(s)
        .iter()
        .map(|w| capitalize(w))
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn to_train_case(s: &str) -> String {
    split_words(s)
        .iter()
        .map(|w| capitalize(w))
        .collect::<Vec<_>>()
        .join("-")
}

fn split_words(s: &str) -> Vec<String> {
    let mut words = Vec::new();
    let mut current = String::new();
    let chars: Vec<char> = s.chars().collect();
    for (i, &c) in chars.iter().enumerate() {
        if c == '_' || c == '-' || c == ' ' {
            if !current.is_empty() {
                words.push(current.clone());
                current.clear();
            }
        } else if c.is_uppercase() && i > 0 && chars[i - 1].is_lowercase() {
            if !current.is_empty() {
                words.push(current.clone());
                current.clear();
            }
            current.push(c);
        } else {
            current.push(c);
        }
    }
    if !current.is_empty() {
        words.push(current);
    }
    words
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + &c.as_str().to_lowercase(),
    }
}


pub fn sort_lines(input: &str, descending: bool) -> String {
    let mut lines: Vec<&str> = input.lines().collect();
    lines.sort_unstable_by(|a, b| {
        if descending {
            b.cmp(a)
        } else {
            a.cmp(b)
        }
    });
    lines.join("\n")
}

pub fn deduplicate_lines(input: &str, case_sensitive: bool) -> String {
    let mut seen: HashSet<String> = HashSet::new();
    input
        .lines()
        .filter(|line| {
            let key = if case_sensitive {
                line.to_string()
            } else {
                line.to_lowercase()
            };
            seen.insert(key)
        })
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn reverse_lines(input: &str) -> String {
    input.lines().rev().collect::<Vec<_>>().join("\n")
}

pub fn number_lines(input: &str, start: usize) -> String {
    input
        .lines()
        .enumerate()
        .map(|(i, line)| format!("{:>4}  {}", i + start, line))
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn trim_lines(input: &str, mode: &str) -> String {
    input
        .lines()
        .map(|line| match mode {
            "start" => line.trim_start(),
            "end" => line.trim_end(),
            _ => line.trim(),
        })
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn filter_lines(input: &str, pattern: &str, invert: bool) -> Result<String, String> {
    let re = Regex::new(pattern).map_err(|e| e.to_string())?;
    let result: Vec<&str> = input
        .lines()
        .filter(|line| re.is_match(line) != invert)
        .collect();
    Ok(result.join("\n"))
}


#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TextStats {
    pub chars: usize,
    pub chars_no_space: usize,
    pub words: usize,
    pub lines: usize,
    pub bytes: usize,
    pub reading_time_sec: usize,
}

pub fn count_text(input: &str) -> TextStats {
    let chars = input.chars().count();
    let chars_no_space = input.chars().filter(|c| !c.is_whitespace()).count();
    let words = input.split_whitespace().count();
    let lines = if input.is_empty() {
        0
    } else {
        input.lines().count()
    };
    let bytes = input.len();
    let reading_time_sec = (words / 200).max(if words > 0 { 1 } else { 0 });
    TextStats {
        chars,
        chars_no_space,
        words,
        lines,
        bytes,
        reading_time_sec,
    }
}


#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RegexMatch {
    pub start: usize,
    pub end: usize,
    pub text: String,
    pub groups: Vec<Option<String>>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RegexResult {
    pub matches: Vec<RegexMatch>,
    pub match_count: usize,
    pub replaced: Option<String>,
    pub elapsed_ms: f64,
}

pub fn test_regex(
    pattern: &str,
    flags: &str,
    input: &str,
    replacement: Option<&str>,
) -> Result<RegexResult, String> {
    let start = std::time::Instant::now();
    let mut pattern_with_flags = String::new();
    if !flags.is_empty() {
        pattern_with_flags.push_str("(?");
        if flags.contains('i') {
            pattern_with_flags.push('i');
        }
        if flags.contains('m') {
            pattern_with_flags.push('m');
        }
        if flags.contains('s') {
            pattern_with_flags.push('s');
        }
        if flags.contains('x') {
            pattern_with_flags.push('x');
        }
        pattern_with_flags.push(')');
    }
    pattern_with_flags.push_str(pattern);
    let re = Regex::new(&pattern_with_flags).map_err(|e| e.to_string())?;
    let mut matches = Vec::new();
    for cap in re.captures_iter(input) {
        let m = cap.get(0).unwrap();
        let groups: Vec<Option<String>> = (1..cap.len())
            .map(|i| cap.get(i).map(|g| g.as_str().to_string()))
            .collect();
        matches.push(RegexMatch {
            start: m.start(),
            end: m.end(),
            text: m.as_str().to_string(),
            groups,
        });
    }
    let match_count = matches.len();
    let replaced = replacement.map(|r| re.replace_all(input, r).to_string());
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    Ok(RegexResult {
        matches,
        match_count,
        replaced,
        elapsed_ms,
    })
}


#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DiffLine {
    pub kind: String,
    pub content: String,
}

pub fn text_diff(left: &str, right: &str) -> Vec<DiffLine> {
    let left_lines: Vec<&str> = left.lines().collect();
    let right_lines: Vec<&str> = right.lines().collect();
    let lcs = lcs_lines(&left_lines, &right_lines);
    let mut result = Vec::new();
    let mut li = 0;
    let mut ri = 0;
    let mut lcs_i = 0;
    while li < left_lines.len() || ri < right_lines.len() {
        if lcs_i < lcs.len() {
            let (ll, rl) = lcs[lcs_i];
            while li < ll {
                result.push(DiffLine {
                    kind: "removed".into(),
                    content: left_lines[li].to_string(),
                });
                li += 1;
            }
            while ri < rl {
                result.push(DiffLine {
                    kind: "added".into(),
                    content: right_lines[ri].to_string(),
                });
                ri += 1;
            }
            result.push(DiffLine {
                kind: "unchanged".into(),
                content: left_lines[li].to_string(),
            });
            li += 1;
            ri += 1;
            lcs_i += 1;
        } else {
            if li < left_lines.len() {
                result.push(DiffLine {
                    kind: "removed".into(),
                    content: left_lines[li].to_string(),
                });
                li += 1;
            }
            if ri < right_lines.len() {
                result.push(DiffLine {
                    kind: "added".into(),
                    content: right_lines[ri].to_string(),
                });
                ri += 1;
            }
        }
    }
    result
}

fn lcs_lines<'a>(a: &[&'a str], b: &[&'a str]) -> Vec<(usize, usize)> {
    let m = a.len();
    let n = b.len();
    let mut dp = vec![vec![0usize; n + 1]; m + 1];
    for i in 1..=m {
        for j in 1..=n {
            if a[i - 1] == b[j - 1] {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = dp[i - 1][j].max(dp[i][j - 1]);
            }
        }
    }
    let mut result = Vec::new();
    let mut i = m;
    let mut j = n;
    while i > 0 && j > 0 {
        if a[i - 1] == b[j - 1] {
            result.push((i - 1, j - 1));
            i -= 1;
            j -= 1;
        } else if dp[i - 1][j] > dp[i][j - 1] {
            i -= 1;
        } else {
            j -= 1;
        }
    }
    result.reverse();
    result
}


pub fn escape_string(input: &str, mode: &str) -> String {
    match mode {
        "json" => serde_json::to_string(input)
            .unwrap_or_default()
            .trim_matches('"')
            .to_string(),
        "html" => input
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&#x27;"),
        "shell" => format!("'{}'", input.replace('\'', "'\\''")),
        "url" => url_encode(input),
        _ => input.to_string(),
    }
}

pub fn unescape_string(input: &str, mode: &str) -> Result<String, String> {
    match mode {
        "json" => {
            let json_str = format!("\"{}\"", input);
            serde_json::from_str::<String>(&json_str).map_err(|e| e.to_string())
        }
        "html" => Ok(input
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&#x27;", "'")
            .replace("&apos;", "'")),
        "url" => url_decode(input),
        _ => Ok(input.to_string()),
    }
}

fn url_encode(s: &str) -> String {
    s.bytes()
        .flat_map(|b| {
            if b.is_ascii_alphanumeric() || b == b'-' || b == b'_' || b == b'.' || b == b'~' {
                vec![b as char]
            } else {
                format!("%{:02X}", b).chars().collect()
            }
        })
        .collect()
}

fn url_decode(s: &str) -> Result<String, String> {
    let mut result = Vec::new();
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '%' {
            let h1 = chars.next().ok_or("Unexpected end after %")?;
            let h2 = chars.next().ok_or("Unexpected end after % hex digit")?;
            let byte = u8::from_str_radix(&format!("{h1}{h2}"), 16).map_err(|e| e.to_string())?;
            result.push(byte);
        } else if c == '+' {
            result.push(b' ');
        } else {
            let mut buf = [0u8; 4];
            let s = c.encode_utf8(&mut buf);
            result.extend_from_slice(s.as_bytes());
        }
    }
    String::from_utf8(result).map_err(|e| e.to_string())
}


const LOREM_WORDS: &[&str] = &[
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
    "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
    "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in",
    "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur",
    "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
    "officia", "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
    "omnis", "iste", "natus", "error", "totam", "rem", "aperiam", "eaque", "ipsa", "ab", "illo",
    "inventore", "veritatis",
];

pub fn lorem_ipsum(paragraphs: usize, sentences_per_para: usize) -> String {
    let mut result = Vec::new();
    let word_count = LOREM_WORDS.len();
    let mut idx = 0usize;

    for p in 0..paragraphs {
        let mut para = Vec::new();
        for s in 0..sentences_per_para {
            let len = 8 + ((idx + p * 7 + s * 3) % 8);
            let mut words: Vec<String> = (0..len)
                .map(|_| {
                    let w = LOREM_WORDS[idx % word_count].to_string();
                    idx += 1;
                    w
                })
                .collect();

            let sentence = if p == 0 && s == 0 {
                let rest = words[4..].join(" ");
                format!("Lorem ipsum dolor sit amet, {rest}")
            } else {
                if let Some(first) = words.first_mut() {
                    *first = capitalize(first);
                }
                words.join(" ")
            };
            para.push(format!("{sentence}."));
        }
        result.push(para.join(" "));
    }
    result.join("\n\n")
}


pub fn generate_slug(input: &str, separator: &str) -> String {
    let lower = input.to_lowercase();
    let re = Regex::new("[^a-z0-9]+").unwrap();
    let slug = re.replace_all(lower.trim(), separator);
    let sep_char = separator.chars().next().unwrap_or('-');
    slug.trim_matches(sep_char).to_string()
}


#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct CronResult {
    pub description: String,
    pub next_firings: Vec<String>,
}

pub fn parse_cron(expression: &str) -> Result<CronResult, String> {
    use std::str::FromStr;
    let trimmed = expression.trim();
    let parts: Vec<&str> = trimmed.split_whitespace().collect();
    let field_count = parts.len();


    let dow_idx = match field_count {
        5 => Some(4),
        6 => Some(5),
        7 => Some(6),
        _ => return Err(format!("expected 5–7 fields, got {field_count}")),
    };
    let mut normalized_parts: Vec<String> = parts.iter().map(|s| s.to_string()).collect();
    if let Some(i) = dow_idx {
        normalized_parts[i] = remap_dow_field(&normalized_parts[i]);
    }
    let normalized = match field_count {
        5 => format!("0 {}", normalized_parts.join(" ")),
        _ => normalized_parts.join(" "),
    };
    let schedule = cron::Schedule::from_str(&normalized).map_err(|e| e.to_string())?;
    let next_firings: Vec<String> = schedule
        .upcoming(chrono::Utc)
        .take(10)
        .map(|t| t.format("%Y-%m-%d %H:%M:%S UTC").to_string())
        .collect();
    let description = describe_cron(trimmed);
    Ok(CronResult {
        description,
        next_firings,
    })
}


fn remap_dow_field(field: &str) -> String {

    if field == "*" || field.chars().any(|c| c.is_ascii_alphabetic()) {
        return field.to_string();
    }
    field
        .split(',')
        .map(remap_dow_part)
        .collect::<Vec<_>>()
        .join(",")
}

fn remap_dow_part(part: &str) -> String {

    let (range, step) = match part.split_once('/') {
        Some((r, s)) => (r, Some(s)),
        None => (part, None),
    };
    let remapped_range = match range.split_once('-') {
        Some((a, b)) => {
            let a_trim = a.trim();
            let b_trim = b.trim();


            if a_trim == "0" {
                if b_trim == "0" {
                    "7".to_string()
                } else {
                    format!("7,1-{b_trim}")
                }
            } else {
                format!("{a_trim}-{b_trim}")
            }
        }
        None => remap_dow_num(range),
    };
    match step {
        Some(s) => format!("{remapped_range}/{s}"),
        None => remapped_range,
    }
}

fn remap_dow_num(s: &str) -> String {
    match s.trim() {
        "0" => "7".to_string(),
        other => other.to_string(),
    }
}

fn describe_cron(expr: &str) -> String {
    let parts: Vec<&str> = expr.split_whitespace().collect();
    if parts.len() < 5 {
        return "Invalid cron expression".into();
    }

    let (min, hour, dom, mon, dow) = if parts.len() >= 6 {
        (parts[1], parts[2], parts[3], parts[4], parts[5])
    } else {
        (parts[0], parts[1], parts[2], parts[3], parts[4])
    };
    let min_desc = if min == "*" {
        "every minute".into()
    } else {
        format!("minute {min}")
    };
    let hour_desc = if hour == "*" {
        "every hour".into()
    } else {
        format!("at hour {hour}")
    };
    let dom_desc = if dom == "*" {
        String::new()
    } else {
        format!(" on day {dom}")
    };
    let mon_desc = if mon == "*" {
        String::new()
    } else {
        format!(" in month {mon}")
    };
    let dow_desc = if dow == "*" {
        String::new()
    } else {
        format!(" on weekday {dow}")
    };
    format!("Runs at {min_desc}, {hour_desc}{dom_desc}{mon_desc}{dow_desc}")
}


pub fn markdown_to_html(input: &str) -> String {
    let parser = pulldown_cmark::Parser::new(input);
    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, parser);
    html
}
