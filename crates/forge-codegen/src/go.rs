use crate::schema_infer::{infer, InferredType};
use crate::Casing;
use serde_json::Value;

#[derive(Debug, Clone, Copy)]
pub struct GoOptions {
    pub casing: Casing,
    pub json_tags: bool,
    pub pointer_nullable: bool,
}

impl Default for GoOptions {
    fn default() -> Self {
        Self {
            casing: Casing::Pascal,
            json_tags: true,
            pointer_nullable: false,
        }
    }
}

pub fn json_to_go_struct(
    input: &str,
    root_name: &str,
    opts: &GoOptions,
) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let ty = infer(&value);
    let mut out = String::from("package main\n\n");
    emit_struct(&ty, root_name, opts, &mut out);
    Ok(out)
}

fn go_type(ty: &InferredType, opts: &GoOptions) -> String {
    match ty {
        InferredType::Null => {
            if opts.pointer_nullable {
                "*interface{}".into()
            } else {
                "interface{}".into()
            }
        }
        InferredType::Unknown => "interface{}".into(),
        InferredType::Bool => "bool".into(),
        InferredType::Int => "int64".into(),
        InferredType::Float => "float64".into(),
        InferredType::String => "string".into(),
        InferredType::Array(inner) => format!("[]{}", go_type(inner, opts)),
        InferredType::Object(_) => "interface{}".into(),
        InferredType::Optional(inner) => {
            if opts.pointer_nullable {
                format!("*{}", go_type(inner, opts))
            } else {
                go_type(inner, opts)
            }
        }
    }
}

fn pascal(s: &str) -> String {
    Casing::Pascal.apply(s)
}

fn emit_struct(ty: &InferredType, name: &str, opts: &GoOptions, out: &mut String) {
    if let InferredType::Object(fields) = ty {
        out.push_str(&format!("type {} struct {{\n", pascal(name)));
        for (field, fty) in fields {
            let go_field = opts.casing.apply(field);
            if opts.json_tags {
                out.push_str(&format!(
                    "  {} {} `json:\"{field}\"`\n",
                    go_field,
                    go_type(fty, opts)
                ));
            } else {
                out.push_str(&format!("  {} {}\n", go_field, go_type(fty, opts)));
            }
        }
        out.push_str("}\n");
    }
}
