use crate::schema_infer::{infer, InferredType};
use crate::Casing;
use serde_json::Value;

#[derive(Debug, Clone, Copy)]
pub struct TypeScriptOptions {
    pub casing: Casing,
    pub use_type_alias: bool,
    pub readonly: bool,
}

impl Default for TypeScriptOptions {
    fn default() -> Self {
        Self {
            casing: Casing::Camel,
            use_type_alias: false,
            readonly: false,
        }
    }
}

pub fn json_to_typescript_interface(
    input: &str,
    root_name: &str,
    opts: &TypeScriptOptions,
) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let ty = infer(&value);
    let mut out = String::new();
    emit_interface(&ty, root_name, opts, &mut out);
    Ok(out)
}

fn ts_type(ty: &InferredType) -> String {
    match ty {
        InferredType::Null => "null".into(),
        InferredType::Unknown => "unknown".into(),
        InferredType::Bool => "boolean".into(),
        InferredType::Int | InferredType::Float => "number".into(),
        InferredType::String => "string".into(),
        InferredType::Array(inner) => format!("{}[]", ts_type(inner)),
        InferredType::Object(_) => "Record<string, unknown>".into(),
        InferredType::Optional(inner) => format!("{} | null", ts_type(inner)),
    }
}

fn pascal(s: &str) -> String {
    Casing::Pascal.apply(s)
}

fn emit_interface(ty: &InferredType, name: &str, opts: &TypeScriptOptions, out: &mut String) {
    if let InferredType::Object(fields) = ty {
        if opts.use_type_alias {
            out.push_str(&format!("export type {} = {{\n", pascal(name)));
        } else {
            out.push_str(&format!("export interface {} {{\n", pascal(name)));
        }
        for (field, fty) in fields {
            let renamed = opts.casing.apply(field);
            let key = if renamed == *field {
                if needs_quotes(field) {
                    format!("\"{field}\"")
                } else {
                    field.clone()
                }
            } else if needs_quotes(&renamed) {
                format!("\"{renamed}\"")
            } else {
                renamed
            };
            let prefix = if opts.readonly { "readonly " } else { "" };
            out.push_str(&format!("  {prefix}{key}: {};\n", ts_type(fty)));
        }
        if opts.use_type_alias {
            out.push_str("};\n");
        } else {
            out.push_str("}\n");
        }
    }
}

fn needs_quotes(s: &str) -> bool {
    !s.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}
