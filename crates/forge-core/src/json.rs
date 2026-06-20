use serde_json::{Map, Value};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub error: Option<String>,
    pub value_type: Option<String>,
}

pub fn format_json(input: &str, indent: usize) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    if indent == 0 {
        return serde_json::to_string(&value).map_err(|e| e.to_string());
    }
    let formatted = serde_json::to_string_pretty(&value).map_err(|e| e.to_string())?;
    if indent == 2 {
        return Ok(formatted);
    }

    let indented: String = formatted
        .lines()
        .map(|line| {
            let spaces = line.len() - line.trim_start().len();
            let levels = spaces / 2;
            format!("{}{}", " ".repeat(levels * indent), line.trim_start())
        })
        .collect::<Vec<_>>()
        .join("\n");
    Ok(indented)
}

pub fn minify_json(input: &str) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    serde_json::to_string(&value).map_err(|e| e.to_string())
}

pub fn validate_json(input: &str) -> Result<ValidationResult, String> {
    match serde_json::from_str::<Value>(input) {
        Ok(v) => Ok(ValidationResult {
            valid: true,
            error: None,
            value_type: Some(json_type_name(&v).to_string()),
        }),
        Err(e) => Ok(ValidationResult {
            valid: false,
            error: Some(format!("line {} col {}: {}", e.line(), e.column(), e)),
            value_type: None,
        }),
    }
}

fn json_type_name(v: &Value) -> &'static str {
    match v {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(_) => "number",
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

pub fn sort_json_keys(input: &str) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let sorted = sort_value(value);
    serde_json::to_string_pretty(&sorted).map_err(|e| e.to_string())
}

fn sort_value(v: Value) -> Value {
    match v {
        Value::Object(map) => {
            let mut sorted: Vec<(String, Value)> =
                map.into_iter().map(|(k, v)| (k, sort_value(v))).collect();
            sorted.sort_by(|a, b| a.0.cmp(&b.0));
            Value::Object(sorted.into_iter().collect::<Map<_, _>>())
        }
        Value::Array(arr) => Value::Array(arr.into_iter().map(sort_value).collect()),
        other => other,
    }
}

pub fn json_diff(left: &str, right: &str) -> Result<String, String> {
    let left_val: Value = serde_json::from_str(left).map_err(|e| format!("Left: {e}"))?;
    let right_val: Value = serde_json::from_str(right).map_err(|e| format!("Right: {e}"))?;
    let left_pretty = serde_json::to_string_pretty(&left_val).unwrap_or_default();
    let right_pretty = serde_json::to_string_pretty(&right_val).unwrap_or_default();
    let diffs = compute_diff(&left_pretty, &right_pretty);
    serde_json::to_string(&diffs).map_err(|e| e.to_string())
}

#[derive(serde::Serialize)]
struct DiffLine {
    kind: &'static str,
    content: String,
}

fn compute_diff(left: &str, right: &str) -> Vec<DiffLine> {
    let left_lines: Vec<&str> = left.lines().collect();
    let right_lines: Vec<&str> = right.lines().collect();
    let mut result = Vec::new();
    let lcs = lcs_lines(&left_lines, &right_lines);
    let mut li = 0;
    let mut ri = 0;
    let mut lcs_i = 0;
    while li < left_lines.len() || ri < right_lines.len() {
        if lcs_i < lcs.len() {
            let (ll, rl) = lcs[lcs_i];
            while li < ll {
                result.push(DiffLine {
                    kind: "removed",
                    content: left_lines[li].to_string(),
                });
                li += 1;
            }
            while ri < rl {
                result.push(DiffLine {
                    kind: "added",
                    content: right_lines[ri].to_string(),
                });
                ri += 1;
            }
            result.push(DiffLine {
                kind: "unchanged",
                content: left_lines[li].to_string(),
            });
            li += 1;
            ri += 1;
            lcs_i += 1;
        } else {
            if li < left_lines.len() {
                result.push(DiffLine {
                    kind: "removed",
                    content: left_lines[li].to_string(),
                });
                li += 1;
            }
            if ri < right_lines.len() {
                result.push(DiffLine {
                    kind: "added",
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn format_roundtrip() {
        let input = r#"{"b":2,"a":1}"#;
        let formatted = format_json(input, 2).unwrap();
        let minified = minify_json(&formatted).unwrap();
        let v1: serde_json::Value = serde_json::from_str(input).unwrap();
        let v2: serde_json::Value = serde_json::from_str(&minified).unwrap();
        assert_eq!(v1, v2);
    }

    #[test]
    fn validate_valid() {
        let r = validate_json(r#"{"a":1}"#).unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("object".into()));
    }

    #[test]
    fn validate_invalid() {
        let r = validate_json("not json").unwrap();
        assert!(!r.valid);
        assert!(r.error.is_some());
    }

    #[test]
    fn sort_keys() {
        let input = r#"{"z":3,"a":1,"m":2}"#;
        let sorted = sort_json_keys(input).unwrap();
        let v: serde_json::Value = serde_json::from_str(&sorted).unwrap();
        let keys: Vec<&str> = v.as_object().unwrap().keys().map(|k| k.as_str()).collect();
        assert_eq!(keys, vec!["a", "m", "z"]);
    }
}
