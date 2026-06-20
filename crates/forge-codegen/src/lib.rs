pub mod csharp;
pub mod go;
pub mod rust;
pub mod schema_infer;
pub mod typescript;


#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Casing {
    Pascal,
    Camel,
    Snake,
}

impl Casing {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "PascalCase" => Some(Casing::Pascal),
            "camelCase" => Some(Casing::Camel),
            "snake_case" => Some(Casing::Snake),
            _ => None,
        }
    }

    pub fn apply(self, raw: &str) -> String {
        let words = split_words(raw);
        match self {
            Casing::Pascal => words.iter().map(|w| capitalize(w)).collect(),
            Casing::Camel => words
                .iter()
                .enumerate()
                .map(|(i, w)| if i == 0 { w.to_lowercase() } else { capitalize(w) })
                .collect(),
            Casing::Snake => words.join("_").to_lowercase(),
        }
    }
}

fn capitalize(w: &str) -> String {
    let mut chars = w.chars();
    match chars.next() {
        None => String::new(),
        Some(c) => c.to_uppercase().collect::<String>() + chars.as_str().to_lowercase().as_str(),
    }
}


fn split_words(s: &str) -> Vec<String> {
    let mut words: Vec<String> = Vec::new();
    let mut current = String::new();
    let mut prev_is_lower = false;

    for ch in s.chars() {
        if ch == '_' || ch == '-' || ch.is_whitespace() {
            if !current.is_empty() {
                words.push(std::mem::take(&mut current));
            }
            prev_is_lower = false;
            continue;
        }
        if ch.is_ascii_uppercase() && prev_is_lower && !current.is_empty() {
            words.push(std::mem::take(&mut current));
        }
        current.push(ch);
        prev_is_lower = ch.is_ascii_lowercase() || ch.is_ascii_digit();
    }
    if !current.is_empty() {
        words.push(current);
    }
    words
}
