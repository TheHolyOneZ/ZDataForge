use crate::schema_infer::{infer, InferredType};
use crate::Casing;
use serde_json::Value;

#[derive(Debug, Clone, Copy)]
pub struct CSharpOptions {
    pub casing: Casing,
    pub nullable_annotations: bool,
    pub use_record: bool,
}

impl Default for CSharpOptions {
    fn default() -> Self {
        Self {
            casing: Casing::Pascal,
            nullable_annotations: true,
            use_record: false,
        }
    }
}

pub fn json_to_csharp_class(
    input: &str,
    root_name: &str,
    opts: &CSharpOptions,
) -> Result<String, String> {
    let value: Value = serde_json::from_str(input).map_err(|e| e.to_string())?;
    let ty = infer(&value);
    let mut out = String::new();
    out.push_str("using System.Text.Json.Serialization;\n\n");
    emit_class(&ty, root_name, opts, &mut out);
    Ok(out)
}

fn cs_type(ty: &InferredType, opts: &CSharpOptions) -> String {
    match ty {
        InferredType::Null => {
            if opts.nullable_annotations {
                "object?".into()
            } else {
                "object".into()
            }
        }
        InferredType::Unknown => {
            if opts.nullable_annotations {
                "object?".into()
            } else {
                "object".into()
            }
        }
        InferredType::Bool => "bool".into(),
        InferredType::Int => "long".into(),
        InferredType::Float => "double".into(),
        InferredType::String => "string".into(),
        InferredType::Array(inner) => format!("{}[]", cs_type(inner, opts)),
        InferredType::Object(_) => "object".into(),
        InferredType::Optional(inner) => {
            if opts.nullable_annotations {
                format!("{}?", cs_type(inner, opts))
            } else {
                cs_type(inner, opts)
            }
        }
    }
}

fn pascal(s: &str) -> String {
    Casing::Pascal.apply(s)
}

fn emit_class(ty: &InferredType, name: &str, opts: &CSharpOptions, out: &mut String) {
    if let InferredType::Object(fields) = ty {
        let keyword = if opts.use_record { "record" } else { "class" };
        out.push_str(&format!("public {} {}\n{{\n", keyword, pascal(name)));
        for (field, fty) in fields {
            let prop = opts.casing.apply(field);
            if prop != *field {
                out.push_str(&format!("    [JsonPropertyName(\"{field}\")]\n"));
            }
            out.push_str(&format!(
                "    public {} {} {{ get; set; }}\n",
                cs_type(fty, opts),
                prop
            ));
        }
        out.push_str("}\n");
    }
}
