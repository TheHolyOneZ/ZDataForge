use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorInfo {
    pub hex: String,
    pub hex_alpha: Option<String>,
    pub rgb: RgbColor,
    pub hsl: HslColor,
    pub oklch: OklchColor,
    pub wcag_luminance: f64,
    pub contrast_on_white: f64,
    pub contrast_on_black: f64,
    pub aa_normal: bool,
    pub aa_large: bool,
    pub aaa_normal: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RgbColor { pub r: u8, pub g: u8, pub b: u8 }
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HslColor { pub h: f64, pub s: f64, pub l: f64 }
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OklchColor { pub l: f64, pub c: f64, pub h: f64 }

pub fn parse_color(input: &str) -> Result<ColorInfo, String> {
    let input = input.trim();
    let rgb = if input.starts_with('#') {
        parse_hex(input)?
    } else if input.starts_with("rgb") {
        parse_rgb_fn(input)?
    } else if input.starts_with("hsl") {
        let hsl = parse_hsl_fn(input)?;
        hsl_to_rgb(hsl.h, hsl.s, hsl.l)
    } else {
        return Err(format!("Cannot parse color: {input}"));
    };

    let hex = format!("#{:02X}{:02X}{:02X}", rgb.r, rgb.g, rgb.b);
    let hsl = rgb_to_hsl(rgb.r, rgb.g, rgb.b);
    let oklch = rgb_to_oklch(rgb.r, rgb.g, rgb.b);
    let lum = wcag_luminance(rgb.r, rgb.g, rgb.b);
    let contrast_white = contrast_ratio(lum, 1.0);
    let contrast_black = contrast_ratio(lum, 0.0);

    Ok(ColorInfo {
        hex,
        hex_alpha: None,
        rgb,
        hsl,
        oklch,
        wcag_luminance: lum,
        contrast_on_white: contrast_white,
        contrast_on_black: contrast_black,
        aa_normal: contrast_white >= 4.5 || contrast_black >= 4.5,
        aa_large: contrast_white >= 3.0 || contrast_black >= 3.0,
        aaa_normal: contrast_white >= 7.0 || contrast_black >= 7.0,
    })
}

fn parse_hex(s: &str) -> Result<RgbColor, String> {
    let s = s.trim_start_matches('#');
    let (r, g, b) = match s.len() {
        3 => {
            let r = u8::from_str_radix(&s[0..1].repeat(2), 16).map_err(|e| e.to_string())?;
            let g = u8::from_str_radix(&s[1..2].repeat(2), 16).map_err(|e| e.to_string())?;
            let b = u8::from_str_radix(&s[2..3].repeat(2), 16).map_err(|e| e.to_string())?;
            (r, g, b)
        }
        6 | 8 => {
            let r = u8::from_str_radix(&s[0..2], 16).map_err(|e| e.to_string())?;
            let g = u8::from_str_radix(&s[2..4], 16).map_err(|e| e.to_string())?;
            let b = u8::from_str_radix(&s[4..6], 16).map_err(|e| e.to_string())?;
            (r, g, b)
        }
        _ => return Err(format!("Invalid hex color: #{s}")),
    };
    Ok(RgbColor { r, g, b })
}

fn parse_rgb_fn(s: &str) -> Result<RgbColor, String> {
    let inner = s.trim_start_matches("rgba(").trim_start_matches("rgb(").trim_end_matches(')');
    let parts: Vec<&str> = inner.split(',').collect();
    if parts.len() < 3 { return Err("Invalid rgb() format".into()); }
    Ok(RgbColor {
        r: parts[0].trim().parse::<f64>().map_err(|e| e.to_string())? as u8,
        g: parts[1].trim().parse::<f64>().map_err(|e| e.to_string())? as u8,
        b: parts[2].trim().parse::<f64>().map_err(|e| e.to_string())? as u8,
    })
}

fn parse_hsl_fn(s: &str) -> Result<HslColor, String> {
    let inner = s.trim_start_matches("hsla(").trim_start_matches("hsl(").trim_end_matches(')');
    let parts: Vec<&str> = inner.split(',').collect();
    if parts.len() < 3 { return Err("Invalid hsl() format".into()); }
    Ok(HslColor {
        h: parts[0].trim().trim_end_matches("deg").parse::<f64>().map_err(|e| e.to_string())?,
        s: parts[1].trim().trim_end_matches('%').parse::<f64>().map_err(|e| e.to_string())? / 100.0,
        l: parts[2].trim().trim_end_matches('%').parse::<f64>().map_err(|e| e.to_string())? / 100.0,
    })
}

fn rgb_to_hsl(r: u8, g: u8, b: u8) -> HslColor {
    let r = r as f64 / 255.0;
    let g = g as f64 / 255.0;
    let b = b as f64 / 255.0;
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let l = (max + min) / 2.0;
    if (max - min).abs() < 1e-10 {
        return HslColor { h: 0.0, s: 0.0, l: (l * 100.0).round() / 100.0 };
    }
    let d = max - min;
    let s = if l > 0.5 { d / (2.0 - max - min) } else { d / (max + min) };
    let h = if max == r { ((g - b) / d + if g < b { 6.0 } else { 0.0 }) / 6.0 }
        else if max == g { ((b - r) / d + 2.0) / 6.0 }
        else { ((r - g) / d + 4.0) / 6.0 };
    HslColor { h: (h * 360.0).round(), s: (s * 100.0).round() / 100.0, l: (l * 100.0).round() / 100.0 }
}

fn hsl_to_rgb(h: f64, s: f64, l: f64) -> RgbColor {
    if s == 0.0 {
        let v = (l * 255.0) as u8;
        return RgbColor { r: v, g: v, b: v };
    }
    let q = if l < 0.5 { l * (1.0 + s) } else { l + s - l * s };
    let p = 2.0 * l - q;
    let hue = h / 360.0;
    fn hue2rgb(p: f64, q: f64, mut t: f64) -> f64 {
        if t < 0.0 { t += 1.0; }
        if t > 1.0 { t -= 1.0; }
        if t < 1.0/6.0 { return p + (q-p)*6.0*t; }
        if t < 1.0/2.0 { return q; }
        if t < 2.0/3.0 { return p + (q-p)*(2.0/3.0-t)*6.0; }
        p
    }
    RgbColor {
        r: (hue2rgb(p, q, hue + 1.0/3.0) * 255.0).round() as u8,
        g: (hue2rgb(p, q, hue) * 255.0).round() as u8,
        b: (hue2rgb(p, q, hue - 1.0/3.0) * 255.0).round() as u8,
    }
}

fn rgb_to_oklch(r: u8, g: u8, b: u8) -> OklchColor {

    let to_linear = |c: u8| -> f64 {
        let f = c as f64 / 255.0;
        if f <= 0.04045 { f / 12.92 } else { ((f + 0.055) / 1.055).powf(2.4) }
    };
    let rl = to_linear(r); let gl = to_linear(g); let bl = to_linear(b);

    let l = 0.4122214708*rl + 0.5363325363*gl + 0.0514459929*bl;
    let m = 0.2119034982*rl + 0.6806995451*gl + 0.1073969566*bl;
    let s = 0.0883024619*rl + 0.2817188376*gl + 0.6299787005*bl;
    let l_ = l.cbrt(); let m_ = m.cbrt(); let s_ = s.cbrt();
    let ll = 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_;
    let aa = 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_;
    let bb = 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_;
    let c = (aa*aa + bb*bb).sqrt();
    let h = bb.atan2(aa).to_degrees();
    let h = if h < 0.0 { h + 360.0 } else { h };
    OklchColor { l: (ll * 1000.0).round() / 1000.0, c: (c * 1000.0).round() / 1000.0, h: h.round() }
}

fn wcag_luminance(r: u8, g: u8, b: u8) -> f64 {
    let to_linear = |c: u8| -> f64 {
        let f = c as f64 / 255.0;
        if f <= 0.04045 { f / 12.92 } else { ((f + 0.055) / 1.055).powf(2.4) }
    };
    0.2126 * to_linear(r) + 0.7152 * to_linear(g) + 0.0722 * to_linear(b)
}

fn contrast_ratio(l1: f64, l2: f64) -> f64 {
    let lighter = l1.max(l2);
    let darker = l1.min(l2);
    ((lighter + 0.05) / (darker + 0.05) * 100.0).round() / 100.0
}
