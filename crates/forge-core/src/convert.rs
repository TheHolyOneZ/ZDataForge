use serde_json::Value;

pub fn yaml_to_json(input: &str) -> Result<String, String> {
    let value: Value = serde_yaml::from_str(input).map_err(|e| e.to_string())?;
    serde_json::to_string_pretty(&value).map_err(|e| e.to_string())
}

pub fn json_to_yaml(input: &str) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    serde_yaml::to_string(&value).map_err(|e| e.to_string())
}

pub fn toml_to_json(input: &str) -> Result<String, String> {
    let value: toml::Value = toml::from_str(input).map_err(|e| e.to_string())?;
    let json_val = toml_to_json_value(value);
    serde_json::to_string_pretty(&json_val).map_err(|e| e.to_string())
}

pub fn json_to_toml(input: &str) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let toml_val =
        json_to_toml_value(value).ok_or("Cannot convert to TOML: root must be an object")?;
    toml::to_string_pretty(&toml_val).map_err(|e| e.to_string())
}

fn toml_to_json_value(v: toml::Value) -> Value {
    match v {
        toml::Value::String(s) => Value::String(s),
        toml::Value::Integer(i) => Value::Number(i.into()),
        toml::Value::Float(f) => {
            Value::Number(serde_json::Number::from_f64(f).unwrap_or_else(|| 0.into()))
        }
        toml::Value::Boolean(b) => Value::Bool(b),
        toml::Value::Array(arr) => Value::Array(arr.into_iter().map(toml_to_json_value).collect()),
        toml::Value::Table(t) => Value::Object(
            t.into_iter()
                .map(|(k, v)| (k, toml_to_json_value(v)))
                .collect(),
        ),
        toml::Value::Datetime(dt) => Value::String(dt.to_string()),
    }
}

fn json_to_toml_value(v: Value) -> Option<toml::Value> {
    Some(match v {
        Value::Null => return None,
        Value::Bool(b) => toml::Value::Boolean(b),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                toml::Value::Integer(i)
            } else {
                toml::Value::Float(n.as_f64()?)
            }
        }
        Value::String(s) => toml::Value::String(s),
        Value::Array(arr) => {
            toml::Value::Array(arr.into_iter().filter_map(json_to_toml_value).collect())
        }
        Value::Object(obj) => toml::Value::Table(
            obj.into_iter()
                .filter_map(|(k, v)| json_to_toml_value(v).map(|tv| (k, tv)))
                .collect(),
        ),
    })
}

pub fn csv_to_json(input: &str) -> Result<String, String> {
    let mut reader = csv::Reader::from_reader(input.as_bytes());
    let headers: Vec<String> = reader
        .headers()
        .map_err(|e| e.to_string())?
        .iter()
        .map(|s| s.to_string())
        .collect();
    let mut records: Vec<Value> = Vec::new();
    for result in reader.records() {
        let record = result.map_err(|e| e.to_string())?;
        let obj: serde_json::Map<String, Value> = headers
            .iter()
            .zip(record.iter())
            .map(|(h, v)| (h.clone(), Value::String(v.to_string())))
            .collect();
        records.push(Value::Object(obj));
    }
    serde_json::to_string_pretty(&records).map_err(|e| e.to_string())
}

pub fn json_to_csv(input: &str) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let rows = value
        .as_array()
        .ok_or("Input must be a JSON array of objects")?;
    if rows.is_empty() {
        return Ok(String::new());
    }
    let headers: Vec<String> = rows[0]
        .as_object()
        .ok_or("Each row must be a JSON object")?
        .keys()
        .cloned()
        .collect();
    let mut wtr = csv::Writer::from_writer(Vec::new());
    wtr.write_record(&headers).map_err(|e| e.to_string())?;
    for row in rows {
        let obj = row.as_object().ok_or("Each row must be a JSON object")?;
        let vals: Vec<String> = headers
            .iter()
            .map(|h| {
                obj.get(h)
                    .map(|v| match v {
                        Value::String(s) => s.clone(),
                        other => other.to_string(),
                    })
                    .unwrap_or_default()
            })
            .collect();
        wtr.write_record(&vals).map_err(|e| e.to_string())?;
    }
    String::from_utf8(wtr.into_inner().map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}
