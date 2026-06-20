use crate::schema_infer::{infer, InferredType};
use crate::Casing;
use serde_json::Value;

#[derive(Debug, Clone, Copy)]
pub struct RustOptions {
    pub casing: Casing,
    pub derive_debug_clone: bool,
    pub derive_serde: bool,
    pub use_option: bool,
}

impl Default for RustOptions {
    fn default() -> Self {
        Self {
            casing: Casing::Snake,
            derive_debug_clone: true,
            derive_serde: true,
            use_option: true,
        }
    }
}

pub fn json_to_rust_struct(
    input: &str,
    root_name: &str,
    opts: &RustOptions,
) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let ty = infer(&value);
    let mut out = String::new();
    emit_struct(&ty, root_name, opts, &mut out);
    Ok(out)
}

fn rust_type(ty: &InferredType, opts: &RustOptions) -> String {
    match ty {
        InferredType::Null => {
            if opts.use_option {
                "Option<serde_json::Value>".into()
            } else {
                "serde_json::Value".into()
            }
        }
        InferredType::Unknown => "serde_json::Value".into(),
        InferredType::Bool => "bool".into(),
        InferredType::Int => "i64".into(),
        InferredType::Float => "f64".into(),
        InferredType::String => "String".into(),
        InferredType::Array(inner) => format!("Vec<{}>", rust_type(inner, opts)),
        InferredType::Object(_) => "serde_json::Value".into(),
        InferredType::Optional(inner) => {
            if opts.use_option {
                format!("Option<{}>", rust_type(inner, opts))
            } else {
                rust_type(inner, opts)
            }
        }
    }
}

fn pascal(s: &str) -> String {
    Casing::Pascal.apply(s)
}

fn derives_line(opts: &RustOptions) -> Option<String> {
    let mut traits: Vec<&str> = Vec::new();
    if opts.derive_debug_clone {
        traits.push("Debug");
        traits.push("Clone");
    }
    if opts.derive_serde {
        traits.push("serde::Serialize");
        traits.push("serde::Deserialize");
    }
    if traits.is_empty() {
        None
    } else {
        Some(format!("#[derive({})]\n", traits.join(", ")))
    }
}

fn emit_struct(ty: &InferredType, name: &str, opts: &RustOptions, out: &mut String) {
    if let InferredType::Object(fields) = ty {
        if let Some(d) = derives_line(opts) {
            out.push_str(&d);
        }
        out.push_str(&format!("pub struct {} {{\n", pascal(name)));
        for (field, fty) in fields {
            let ident = opts.casing.apply(field);
            if opts.derive_serde && ident != *field {
                out.push_str(&format!("    #[serde(rename = \"{field}\")]\n"));
            }
            out.push_str(&format!("    pub {}: {},\n", ident, rust_type(fty, opts)));
        }
        out.push_str("}\n");
    }
}
