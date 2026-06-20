use serde_json::Value;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub enum InferredType {
    Null,
    Bool,
    Int,
    Float,
    String,
    Array(Box<InferredType>),
    Object(Vec<(String, InferredType)>),
    Optional(Box<InferredType>),
    Unknown,
}

impl InferredType {

    pub fn is_nullable(&self) -> bool {
        matches!(self, InferredType::Null | InferredType::Optional(_))
    }


    pub fn unwrap_optional(&self) -> &InferredType {
        match self {
            InferredType::Optional(inner) => inner,
            other => other,
        }
    }
}

pub fn infer(value: &Value) -> InferredType {
    match value {
        Value::Null => InferredType::Null,
        Value::Bool(_) => InferredType::Bool,
        Value::Number(n) => {
            if n.is_f64() {
                InferredType::Float
            } else {
                InferredType::Int
            }
        }
        Value::String(_) => InferredType::String,
        Value::Array(arr) => {
            let inner = arr.first().map(infer).unwrap_or(InferredType::Unknown);
            InferredType::Array(Box::new(inner))
        }
        Value::Object(map) => {
            let fields = map.iter().map(|(k, v)| (k.clone(), infer(v))).collect();
            InferredType::Object(fields)
        }
    }
}
