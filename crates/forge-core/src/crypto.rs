use base64::{engine::general_purpose, Engine as _};
use sha2::{Sha256, Sha384, Sha512, Digest};
use sha1::Sha1;
use md5::Md5;
use hmac::{Hmac, Mac};
use serde::{Serialize, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};


pub fn base64_encode(input: &[u8], url_safe: bool) -> String {
    if url_safe {
        general_purpose::URL_SAFE_NO_PAD.encode(input)
    } else {
        general_purpose::STANDARD.encode(input)
    }
}

pub fn base64_decode(input: &str, url_safe: bool) -> Result<Vec<u8>, String> {
    if url_safe {
        general_purpose::URL_SAFE_NO_PAD.decode(input.trim()).map_err(|e| e.to_string())
    } else {
        general_purpose::STANDARD.decode(input.trim()).map_err(|e| e.to_string())
    }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HashResult {
    pub md5: String,
    pub sha1: String,
    pub sha256: String,
    pub sha384: String,
    pub sha512: String,
    pub blake3: String,
}

pub fn hash_all(input: &[u8]) -> HashResult {
    HashResult {
        md5: hex::encode(Md5::digest(input)),
        sha1: hex::encode(Sha1::digest(input)),
        sha256: hex::encode(Sha256::digest(input)),
        sha384: hex::encode(Sha384::digest(input)),
        sha512: hex::encode(Sha512::digest(input)),
        blake3: blake3::hash(input).to_hex().to_string(),
    }
}


pub fn hmac_sign(key: &[u8], message: &[u8], algorithm: &str) -> Result<String, String> {
    match algorithm {
        "sha256" => {
            let mut mac = Hmac::<Sha256>::new_from_slice(key).map_err(|e| e.to_string())?;
            mac.update(message);
            Ok(hex::encode(mac.finalize().into_bytes()))
        }
        "sha384" => {
            let mut mac = Hmac::<Sha384>::new_from_slice(key).map_err(|e| e.to_string())?;
            mac.update(message);
            Ok(hex::encode(mac.finalize().into_bytes()))
        }
        "sha512" => {
            let mut mac = Hmac::<Sha512>::new_from_slice(key).map_err(|e| e.to_string())?;
            mac.update(message);
            Ok(hex::encode(mac.finalize().into_bytes()))
        }
        "sha1" => {
            let mut mac = Hmac::<Sha1>::new_from_slice(key).map_err(|e| e.to_string())?;
            mac.update(message);
            Ok(hex::encode(mac.finalize().into_bytes()))
        }
        _ => Err(format!("Unknown algorithm: {algorithm}")),
    }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UuidInfo {
    pub value: String,
    pub version: u8,
    pub variant: String,
    pub timestamp_ms: Option<i64>,
}

pub fn generate_uuid_v4() -> String {
    uuid::Uuid::new_v4().to_string()
}

pub fn generate_uuid_v7() -> String {
    uuid::Uuid::now_v7().to_string()
}

pub fn inspect_uuid(s: &str) -> Result<UuidInfo, String> {
    let trimmed = s.trim();


    if trimmed.len() == 26 && trimmed.chars().all(|c| c.is_ascii_alphanumeric()) {
        if let Some(info) = inspect_ulid(trimmed) {
            return Ok(info);
        }
    }

    let id = uuid::Uuid::parse_str(trimmed).map_err(|e| e.to_string())?;
    let version = id.get_version_num() as u8;
    let variant = format!("{:?}", id.get_variant());
    let timestamp_ms = match id.get_version() {
        Some(uuid::Version::SortRand) => {

            let bytes = id.as_bytes();
            let ms = ((bytes[0] as i64) << 40)
                | ((bytes[1] as i64) << 32)
                | ((bytes[2] as i64) << 24)
                | ((bytes[3] as i64) << 16)
                | ((bytes[4] as i64) << 8)
                | (bytes[5] as i64);
            Some(ms)
        }
        _ => None,
    };
    Ok(UuidInfo { value: id.to_string(), version, variant, timestamp_ms })
}

fn inspect_ulid(s: &str) -> Option<UuidInfo> {

    let s_upper = s.to_ascii_uppercase();
    let mut ts: u64 = 0;
    for c in s_upper.chars().take(10) {
        let v = match c {
            '0'..='9' => (c as u32) - ('0' as u32),
            'A'..='H' => (c as u32) - ('A' as u32) + 10,
            'J' => 18,
            'K' => 19,
            'M' => 20,
            'N' => 21,
            'P' => 22,
            'Q' => 23,
            'R' => 24,
            'S' => 25,
            'T' => 26,
            'V' => 27,
            'W' => 28,
            'X' => 29,
            'Y' => 30,
            'Z' => 31,
            _ => return None,
        };
        ts = (ts << 5) | (v as u64);
    }

    for c in s_upper.chars().skip(10) {
        if !matches!(c,
            '0'..='9' | 'A'..='H' | 'J' | 'K' | 'M' | 'N' | 'P' | 'Q' |
            'R' | 'S' | 'T' | 'V' | 'W' | 'X' | 'Y' | 'Z'
        ) {
            return None;
        }
    }
    Some(UuidInfo {
        value: s_upper,
        version: 0,
        variant: "ULID".into(),
        timestamp_ms: Some(ts as i64),
    })
}


const CROCKFORD: &[u8] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";

pub fn generate_ulid() -> String {
    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    let mut rand_bytes = [0u8; 10];
    for b in &mut rand_bytes { *b = rand::random(); }

    let mut chars = [0u8; 26];

    let mut t = now_ms;
    for i in (0..10).rev() {
        chars[i] = CROCKFORD[(t & 0x1F) as usize];
        t >>= 5;
    }

    let mut val: u128 = 0;
    for b in &rand_bytes { val = (val << 8) | (*b as u128); }
    for i in (10..26).rev() {
        chars[i] = CROCKFORD[(val & 0x1F) as usize];
        val >>= 5;
    }
    String::from_utf8(chars.to_vec()).unwrap_or_default()
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtParts {
    pub header: serde_json::Value,
    pub payload: serde_json::Value,
    pub signature_b64: String,
    pub is_expired: Option<bool>,
    pub exp_ts: Option<i64>,
    pub iat_ts: Option<i64>,
    pub nbf_ts: Option<i64>,
    pub verified: Option<bool>,
    pub verify_error: Option<String>,
}

pub fn decode_jwt(token: &str) -> Result<JwtParts, String> {
    let parts: Vec<&str> = token.trim().split('.').collect();
    if parts.len() != 3 {
        return Err("Not a valid JWT (expected 3 dot-separated parts)".into());
    }

    let decode_b64 = |s: &str| -> Result<serde_json::Value, String> {
        let bytes = general_purpose::URL_SAFE_NO_PAD.decode(s)
            .or_else(|_| general_purpose::STANDARD.decode(s))
            .map_err(|e| e.to_string())?;
        serde_json::from_slice(&bytes).map_err(|e| e.to_string())
    };

    let header = decode_b64(parts[0])?;
    let payload = decode_b64(parts[1])?;

    let now_secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let exp_ts = payload.get("exp").and_then(|v| v.as_i64());
    let iat_ts = payload.get("iat").and_then(|v| v.as_i64());
    let nbf_ts = payload.get("nbf").and_then(|v| v.as_i64());
    let is_expired = exp_ts.map(|e| now_secs > e);

    Ok(JwtParts {
        header,
        payload,
        signature_b64: parts[2].to_string(),
        is_expired,
        exp_ts,
        iat_ts,
        nbf_ts,
        verified: None,
        verify_error: None,
    })
}


pub fn argon2_hash(password: &str) -> Result<String, String> {
    use argon2::{Argon2, PasswordHasher};
    use argon2::password_hash::{rand_core::OsRng, SaltString};
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?;
    Ok(hash.to_string())
}

pub fn argon2_verify(password: &str, hash: &str) -> Result<bool, String> {
    use argon2::{Argon2, PasswordVerifier};
    use argon2::password_hash::PasswordHash;
    let hash = hash.trim();

    if hash.starts_with("$2a$") || hash.starts_with("$2b$") || hash.starts_with("$2y$") {
        return bcrypt_verify(password, hash);
    }
    if !hash.starts_with("$argon2") {
        return Err("hash is not in Argon2 PHC format (expected $argon2id$… or $argon2i$…)".into());
    }
    let parsed = PasswordHash::new(hash).map_err(|e| e.to_string())?;
    Ok(Argon2::default().verify_password(password.as_bytes(), &parsed).is_ok())
}

pub fn bcrypt_hash(password: &str, cost: u32) -> Result<String, String> {
    bcrypt::hash(password, cost).map_err(|e| e.to_string())
}

pub fn bcrypt_verify(password: &str, hash: &str) -> Result<bool, String> {
    let hash = hash.trim();

    if hash.starts_with("$argon2") {
        return argon2_verify(password, hash);
    }
    bcrypt::verify(password, hash).map_err(|e| e.to_string())
}


pub fn aes_gcm_encrypt(plaintext: &str, passphrase: &str) -> Result<String, String> {
    use aes_gcm::{Aes256Gcm, Key, Nonce, KeyInit, aead::Aead};

    let key_bytes = Sha256::digest(passphrase.as_bytes());
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    let nonce_bytes: [u8; 12] = rand::random();
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes()).map_err(|e| e.to_string())?;

    let mut combined = nonce_bytes.to_vec();
    combined.extend_from_slice(&ciphertext);
    Ok(general_purpose::STANDARD.encode(&combined))
}

pub fn aes_gcm_decrypt(encoded: &str, passphrase: &str) -> Result<String, String> {
    use aes_gcm::{Aes256Gcm, Key, Nonce, KeyInit, aead::Aead};

    let combined = general_purpose::STANDARD.decode(encoded.trim()).map_err(|e| e.to_string())?;
    if combined.len() < 12 { return Err("Invalid ciphertext (too short)".into()); }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let key_bytes = Sha256::digest(passphrase.as_bytes());
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher.decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed (wrong passphrase or corrupted data)".to_string())?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeypairResult {
    pub private_key_pem: String,
    pub public_key_pem: String,
    pub algorithm: String,
    pub key_size: Option<usize>,
}

pub fn generate_rsa_keypair(bits: usize) -> Result<KeypairResult, String> {
    use rsa::{RsaPrivateKey, RsaPublicKey, pkcs8::{EncodePrivateKey, EncodePublicKey, LineEnding}};
    let mut rng = rand::thread_rng();
    let private_key = RsaPrivateKey::new(&mut rng, bits).map_err(|e| e.to_string())?;
    let public_key = RsaPublicKey::from(&private_key);
    let private_pem = private_key.to_pkcs8_pem(LineEnding::LF).map_err(|e| e.to_string())?.to_string();
    let public_pem = public_key.to_public_key_pem(LineEnding::LF).map_err(|e| e.to_string())?;
    Ok(KeypairResult {
        private_key_pem: private_pem,
        public_key_pem: public_pem,
        algorithm: "RSA".into(),
        key_size: Some(bits),
    })
}
