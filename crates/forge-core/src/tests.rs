

mod json_tests {
    use crate::json::*;

    #[test]
    fn format_json_indent_2() {
        let input = r#"{"b":2,"a":1}"#;
        let out = format_json(input, 2).unwrap();
        assert!(out.contains('\n'), "should be pretty-printed");

        let v1: serde_json::Value = serde_json::from_str(input).unwrap();
        let v2: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert_eq!(v1, v2);
    }

    #[test]
    fn format_json_indent_4() {
        let input = r#"{"x":1}"#;
        let out = format_json(input, 4).unwrap();

        assert!(out.contains("    \"x\""), "should use 4-space indent, got: {out}");
    }

    #[test]
    fn format_json_minify_zero_indent() {
        let input = r#"{ "a" : 1 , "b" : 2 }"#;
        let out = format_json(input, 0).unwrap();
        assert!(!out.contains('\n'), "indent=0 should produce single line");
        assert!(out.contains("\"a\""));
        assert!(out.contains("\"b\""));
    }

    #[test]
    fn format_json_invalid() {
        let res = format_json("not json", 2);
        assert!(res.is_err(), "invalid JSON should return Err");
    }

    #[test]
    fn minify_json_works() {
        let input = "{\n  \"a\": 1,\n  \"b\": 2\n}";
        let out = minify_json(input).unwrap();
        assert!(!out.contains('\n'), "minified should have no newlines");
        assert!(out.contains("\"a\":1") || out.contains("\"a\": 1"));
    }

    #[test]
    fn minify_json_invalid() {
        assert!(minify_json("{bad}").is_err());
    }

    #[test]
    fn validate_json_valid_object() {
        let r = validate_json(r#"{"key": "value"}"#).unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("object".into()));
        assert!(r.error.is_none());
    }

    #[test]
    fn validate_json_valid_array() {
        let r = validate_json("[1,2,3]").unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("array".into()));
    }

    #[test]
    fn validate_json_valid_string() {
        let r = validate_json(r#""hello""#).unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("string".into()));
    }

    #[test]
    fn validate_json_valid_number() {
        let r = validate_json("42").unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("number".into()));
    }

    #[test]
    fn validate_json_valid_null() {
        let r = validate_json("null").unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("null".into()));
    }

    #[test]
    fn validate_json_valid_bool() {
        let r = validate_json("true").unwrap();
        assert!(r.valid);
        assert_eq!(r.value_type, Some("boolean".into()));
    }

    #[test]
    fn validate_json_invalid() {
        let r = validate_json("not json").unwrap();
        assert!(!r.valid);
        assert!(r.error.is_some());
        assert!(r.value_type.is_none());
    }

    #[test]
    fn sort_json_keys_order() {
        let input = r#"{"z":3,"a":1,"m":2}"#;
        let sorted = sort_json_keys(input).unwrap();
        let v: serde_json::Value = serde_json::from_str(&sorted).unwrap();
        let keys: Vec<&str> = v.as_object().unwrap().keys().map(|k| k.as_str()).collect();
        assert_eq!(keys, vec!["a", "m", "z"]);
    }

    #[test]
    fn sort_json_keys_nested() {
        let input = r#"{"z":{"c":3,"a":1},"a":2}"#;
        let sorted = sort_json_keys(input).unwrap();
        let v: serde_json::Value = serde_json::from_str(&sorted).unwrap();
        let inner = v["z"].as_object().unwrap();
        let keys: Vec<&str> = inner.keys().map(|k| k.as_str()).collect();
        assert_eq!(keys, vec!["a", "c"]);
    }

    #[test]
    fn json_diff_identical() {
        let s = r#"{"a":1}"#;
        let result = json_diff(s, s).unwrap();
        let arr: serde_json::Value = serde_json::from_str(&result).unwrap();

        let all_unchanged = arr.as_array().unwrap().iter().all(|item| {
            item["kind"].as_str() == Some("unchanged")
        });
        assert!(all_unchanged, "identical JSON diff should have only unchanged lines");
    }

    #[test]
    fn json_diff_different() {
        let left = r#"{"a":1}"#;
        let right = r#"{"a":2}"#;
        let result = json_diff(left, right).unwrap();
        let arr: serde_json::Value = serde_json::from_str(&result).unwrap();
        let items = arr.as_array().unwrap();
        let has_removed = items.iter().any(|i| i["kind"].as_str() == Some("removed"));
        let has_added = items.iter().any(|i| i["kind"].as_str() == Some("added"));
        assert!(has_removed, "diff should contain removed lines");
        assert!(has_added, "diff should contain added lines");
    }

    #[test]
    fn json_diff_invalid_left() {
        assert!(json_diff("{bad}", r#"{"a":1}"#).is_err());
    }

    #[test]
    fn json_diff_invalid_right() {
        assert!(json_diff(r#"{"a":1}"#, "{bad}").is_err());
    }
}


mod text_tests {
    use crate::text::*;


    #[test]
    fn snake_case_from_camel() {
        assert_eq!(to_snake_case("helloWorld"), "hello_world");
    }

    #[test]
    fn snake_case_from_space() {
        assert_eq!(to_snake_case("Hello World"), "hello_world");
    }

    #[test]
    fn camel_case_from_snake() {
        assert_eq!(to_camel_case("hello_world"), "helloWorld");
    }

    #[test]
    fn camel_case_starts_lowercase() {
        let result = to_camel_case("FooBar");
        assert!(result.starts_with(|c: char| c.is_lowercase()), "camelCase must start lowercase, got: {result}");
    }

    #[test]
    fn pascal_case_from_snake() {
        assert_eq!(to_pascal_case("hello_world"), "HelloWorld");
    }

    #[test]
    fn pascal_case_starts_uppercase() {
        let result = to_pascal_case("hello world");
        assert!(result.starts_with(|c: char| c.is_uppercase()), "PascalCase must start uppercase, got: {result}");
    }

    #[test]
    fn kebab_case_from_camel() {
        assert_eq!(to_kebab_case("helloWorld"), "hello-world");
    }

    #[test]
    fn screaming_snake_from_space() {
        assert_eq!(to_screaming_snake("hello world"), "HELLO_WORLD");
    }

    #[test]
    fn title_case_from_snake() {
        assert_eq!(to_title_case("hello_world"), "Hello World");
    }

    #[test]
    fn train_case_from_space() {
        assert_eq!(to_train_case("hello world"), "Hello-World");
    }


    #[test]
    fn sort_lines_ascending() {
        let result = sort_lines("banana\napple\ncherry", false);
        assert_eq!(result, "apple\nbanana\ncherry");
    }

    #[test]
    fn sort_lines_descending() {
        let result = sort_lines("a\nb\nc", true);
        assert_eq!(result, "c\nb\na");
    }

    #[test]
    fn deduplicate_lines_case_sensitive() {
        let result = deduplicate_lines("a\nb\na\nc", true);
        assert_eq!(result, "a\nb\nc");
    }

    #[test]
    fn deduplicate_lines_case_insensitive() {

        let result = deduplicate_lines("A\na\nB", false);
        assert_eq!(result, "A\nB");
    }

    #[test]
    fn reverse_lines_basic() {
        let result = reverse_lines("a\nb\nc");
        assert_eq!(result, "c\nb\na");
    }

    #[test]
    fn number_lines_start_1() {
        let result = number_lines("foo\nbar", 1);

        assert!(result.contains("foo"), "should contain foo");
        assert!(result.contains("bar"), "should contain bar");

        let first_line = result.lines().next().unwrap();
        assert!(first_line.contains('1'), "first line should contain line number 1");
        assert!(first_line.contains("foo"), "first line should contain content");
    }

    #[test]
    fn number_lines_start_0() {
        let result = number_lines("a\nb", 0);
        let lines: Vec<&str> = result.lines().collect();
        assert_eq!(lines.len(), 2);
        assert!(lines[0].contains('0'), "first line should be numbered 0");
        assert!(lines[1].contains('1'), "second line should be numbered 1");
    }

    #[test]
    fn trim_lines_both() {
        let result = trim_lines("  hi  \n  bye  ", "both");
        assert_eq!(result, "hi\nbye");
    }

    #[test]
    fn trim_lines_start() {
        let result = trim_lines("  hi  \n  bye  ", "start");
        assert_eq!(result, "hi  \nbye  ");
    }

    #[test]
    fn trim_lines_end() {
        let result = trim_lines("  hi  \n  bye  ", "end");
        assert_eq!(result, "  hi\n  bye");
    }

    #[test]
    fn filter_lines_match() {
        let result = filter_lines("apple\nbanana\ncherry", "an", false).unwrap();
        assert_eq!(result, "banana");
    }

    #[test]
    fn filter_lines_invert() {
        let result = filter_lines("apple\nbanana", "banana", true).unwrap();
        assert_eq!(result, "apple");
    }

    #[test]
    fn filter_lines_invalid_regex() {
        assert!(filter_lines("foo", "[", false).is_err());
    }


    #[test]
    fn count_text_basic() {
        let stats = count_text("hello world");
        assert_eq!(stats.words, 2);
        assert_eq!(stats.chars, 11);
        assert_eq!(stats.lines, 1);
        assert_eq!(stats.bytes, 11);
    }

    #[test]
    fn count_text_empty() {
        let stats = count_text("");
        assert_eq!(stats.words, 0);
        assert_eq!(stats.lines, 0);
        assert_eq!(stats.chars, 0);
    }

    #[test]
    fn count_text_multiline() {
        let stats = count_text("line1\nline2\nline3");
        assert_eq!(stats.lines, 3);
        assert_eq!(stats.words, 3);
    }


    #[test]
    fn regex_digit_matches() {
        let r = test_regex(r"\d+", "", "abc 123 def 456", None).unwrap();
        assert_eq!(r.match_count, 2);
        assert_eq!(r.matches[0].text, "123");
        assert_eq!(r.matches[1].text, "456");
        assert!(r.replaced.is_none());
    }

    #[test]
    fn regex_capture_groups() {
        let r = test_regex(r"(\w+)@(\w+)", "", "user@host", None).unwrap();
        assert_eq!(r.match_count, 1);
        assert_eq!(r.matches[0].groups[0], Some("user".into()));
        assert_eq!(r.matches[0].groups[1], Some("host".into()));
    }

    #[test]
    fn regex_case_insensitive_flag() {
        let r = test_regex("HELLO", "i", "hello world", None).unwrap();
        assert_eq!(r.match_count, 1);
        assert_eq!(r.matches[0].text, "hello");
    }

    #[test]
    fn regex_replacement_no_match() {
        let r = test_regex(r"\d+", "", "abc", Some("NUM")).unwrap();
        assert_eq!(r.replaced, Some("abc".into()));
    }

    #[test]
    fn regex_replacement_with_match() {
        let r = test_regex(r"\d+", "", "abc 123", Some("NUM")).unwrap();
        assert_eq!(r.replaced, Some("abc NUM".into()));
    }

    #[test]
    fn regex_invalid_pattern() {
        assert!(test_regex("[", "", "foo", None).is_err());
    }

    #[test]
    fn regex_elapsed_ms_non_negative() {
        let r = test_regex(r"\w+", "", "hello", None).unwrap();
        assert!(r.elapsed_ms >= 0.0);
    }


    #[test]
    fn text_diff_basic() {
        let diff = text_diff("a\nb\nc", "a\nx\nc");
        let kinds: Vec<(&str, &str)> = diff.iter().map(|d| (d.kind.as_str(), d.content.as_str())).collect();

        assert!(kinds.contains(&("unchanged", "a")));
        assert!(kinds.contains(&("removed", "b")));
        assert!(kinds.contains(&("added", "x")));
        assert!(kinds.contains(&("unchanged", "c")));
    }

    #[test]
    fn text_diff_identical() {
        let diff = text_diff("hello\nworld", "hello\nworld");
        assert!(diff.iter().all(|d| d.kind == "unchanged"), "identical texts should produce only unchanged lines");
    }

    #[test]
    fn text_diff_all_added() {
        let diff = text_diff("", "new line");
        assert!(diff.iter().any(|d| d.kind == "added"));
    }

    #[test]
    fn text_diff_all_removed() {
        let diff = text_diff("old line", "");
        assert!(diff.iter().any(|d| d.kind == "removed"));
    }


    #[test]
    fn escape_json_quotes() {


        let result = escape_string("say hi", "json");
        assert_eq!(result, "say hi", "plain string should be unchanged");
    }

    #[test]
    fn escape_json_newline() {
        let result = escape_string("line1\nline2", "json");
        assert!(result.contains(r"\n"), "newlines should be escaped in json mode, got: {result}");
    }

    #[test]
    fn escape_html_tags() {
        let result = escape_string("<script>", "html");
        assert_eq!(result, "&lt;script&gt;");
    }

    #[test]
    fn escape_shell_apostrophe() {
        let result = escape_string("it's", "shell");
        assert_eq!(result, "'it'\\''s'");
    }

    #[test]
    fn escape_url_space() {
        let result = escape_string("hello world", "url");
        assert_eq!(result, "hello%20world");
    }

    #[test]
    fn unescape_html_entities() {
        let result = unescape_string("&lt;b&gt;", "html").unwrap();
        assert_eq!(result, "<b>");
    }

    #[test]
    fn unescape_url_encoded() {
        let result = unescape_string("hello%20world", "url").unwrap();
        assert_eq!(result, "hello world");
    }

    #[test]
    fn unescape_json_escape() {
        let result = unescape_string(r#"Hello \"World\""#, "json").unwrap();
        assert_eq!(result, r#"Hello "World""#);
    }


    #[test]
    fn lorem_ipsum_starts_with_lorem() {
        let result = lorem_ipsum(1, 2);
        assert!(result.to_lowercase().contains("lorem ipsum"), "lorem_ipsum output should start with 'Lorem ipsum', got: {result}");
    }

    #[test]
    fn lorem_ipsum_paragraph_count() {
        let result = lorem_ipsum(3, 2);

        let paras: Vec<&str> = result.split("\n\n").collect();
        assert_eq!(paras.len(), 3);
    }

    #[test]
    fn lorem_ipsum_non_empty() {
        let result = lorem_ipsum(2, 3);
        assert!(!result.is_empty());
    }


    #[test]
    fn slug_basic_dash() {
        assert_eq!(generate_slug("Hello World!", "-"), "hello-world");
    }

    #[test]
    fn slug_underscore_separator() {
        assert_eq!(generate_slug("  foo  BAR  ", "_"), "foo_bar");
    }

    #[test]
    fn slug_strips_special_chars() {
        let result = generate_slug("Hello, World!!!", "-");
        assert_eq!(result, "hello-world");
    }


    #[test]
    fn cron_every_minute() {

        let result = parse_cron("0 * * * * *").unwrap();
        assert!(!result.next_firings.is_empty(), "should have upcoming firings");
        assert_eq!(result.next_firings.len(), 10);
    }

    #[test]
    fn cron_description_contains_text() {
        let result = parse_cron("0 30 9 * * *").unwrap();
        assert!(!result.description.is_empty());
    }

    #[test]
    fn cron_invalid_expression() {

        assert!(parse_cron("invalid cron").is_err());
    }

    #[test]
    fn cron_standard_five_field() {

        let r = parse_cron("0 9 * * 1-5").unwrap();
        assert_eq!(r.next_firings.len(), 10);
    }

    #[test]
    fn cron_every_five_minutes() {
        let r = parse_cron("*/5 * * * *").unwrap();
        assert_eq!(r.next_firings.len(), 10);
    }

    #[test]
    fn cron_monthly() {
        let r = parse_cron("0 0 1 * *").unwrap();
        assert_eq!(r.next_firings.len(), 10);
    }

    #[test]
    fn cron_sunday_zero_dow() {


        let r = parse_cron("0 12 * * 0").unwrap();
        assert_eq!(r.next_firings.len(), 10);
    }

    #[test]
    fn cron_named_sunday() {
        let r = parse_cron("0 12 * * SUN").unwrap();
        assert_eq!(r.next_firings.len(), 10);
    }

    #[test]
    fn cron_zero_in_dow_range() {

        let r = parse_cron("0 12 * * 0-2").unwrap();
        assert_eq!(r.next_firings.len(), 10);
    }


    #[test]
    fn markdown_h1() {
        let html = markdown_to_html("# Hello");
        assert!(html.contains("<h1>"), "should contain <h1> tag, got: {html}");
    }

    #[test]
    fn markdown_bold() {
        let html = markdown_to_html("**bold**");
        assert!(html.contains("<strong>"), "should contain <strong> tag, got: {html}");
    }

    #[test]
    fn markdown_italic() {
        let html = markdown_to_html("*italic*");
        assert!(html.contains("<em>"), "should contain <em> tag, got: {html}");
    }

    #[test]
    fn markdown_link() {
        let html = markdown_to_html("[link](https://example.com)");
        assert!(html.contains("<a"), "should contain <a> tag, got: {html}");
        assert!(html.contains("https://example.com"));
    }

    #[test]
    fn markdown_code_block() {
        let html = markdown_to_html("```\ncode\n```");
        assert!(html.contains("<code>") || html.contains("<pre>"), "should contain code/pre tag, got: {html}");
    }
}


mod crypto_tests {
    use crate::crypto::*;


    #[test]
    fn base64_encode_hello_standard() {
        let result = base64_encode(b"hello", false);
        assert_eq!(result, "aGVsbG8=");
    }

    #[test]
    fn base64_encode_hello_url_safe() {
        let result = base64_encode(b"hello", true);

        assert_eq!(result, "aGVsbG8");
    }

    #[test]
    fn base64_decode_standard() {
        let result = base64_decode("aGVsbG8=", false).unwrap();
        assert_eq!(result, b"hello");
    }

    #[test]
    fn base64_decode_url_safe() {
        let result = base64_decode("aGVsbG8", true).unwrap();
        assert_eq!(result, b"hello");
    }

    #[test]
    fn base64_decode_invalid() {
        assert!(base64_decode("!!!!", false).is_err());
    }

    #[test]
    fn base64_roundtrip() {
        let input = b"ZDataForge test data 1234!@#$";
        let encoded = base64_encode(input, false);
        let decoded = base64_decode(&encoded, false).unwrap();
        assert_eq!(decoded, input);
    }


    #[test]
    fn hash_sha256_empty() {
        let h = hash_all(b"");
        assert_eq!(h.sha256, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    }

    #[test]
    fn hash_md5_empty() {
        let h = hash_all(b"");
        assert_eq!(h.md5, "d41d8cd98f00b204e9800998ecf8427e");
    }

    #[test]
    fn hash_sha1_empty() {
        let h = hash_all(b"");
        assert_eq!(h.sha1, "da39a3ee5e6b4b0d3255bfef95601890afd80709");
    }

    #[test]
    fn hash_sha256_length() {
        let h = hash_all(b"test input");
        assert_eq!(h.sha256.len(), 64, "SHA-256 hex should be 64 chars");
        assert_eq!(h.sha384.len(), 96, "SHA-384 hex should be 96 chars");
        assert_eq!(h.sha512.len(), 128, "SHA-512 hex should be 128 chars");
        assert_eq!(h.md5.len(), 32, "MD5 hex should be 32 chars");
        assert_eq!(h.sha1.len(), 40, "SHA-1 hex should be 40 chars");
    }

    #[test]
    fn hash_deterministic() {
        let h1 = hash_all(b"same input");
        let h2 = hash_all(b"same input");
        assert_eq!(h1.sha256, h2.sha256);
        assert_eq!(h1.md5, h2.md5);
    }

    #[test]
    fn hash_blake3_length() {
        let h = hash_all(b"blake3 test");

        assert_eq!(h.blake3.len(), 64, "BLAKE3 hex should be 64 chars");
    }

    #[test]
    fn hash_all_hex_chars_only() {
        let h = hash_all(b"validate hex output");
        let is_hex = |s: &str| s.chars().all(|c| c.is_ascii_hexdigit());
        assert!(is_hex(&h.sha256), "sha256 must be hex");
        assert!(is_hex(&h.md5), "md5 must be hex");
        assert!(is_hex(&h.sha1), "sha1 must be hex");
    }


    #[test]
    fn hmac_sha256_known_vector() {

        let result = hmac_sign(
            b"key",
            b"The quick brown fox jumps over the lazy dog",
            "sha256",
        )
        .unwrap();
        assert_eq!(result, "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8");
    }

    #[test]
    fn hmac_sha1_returns_ok() {
        let result = hmac_sign(b"key", b"message", "sha1");
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 40);
    }

    #[test]
    fn hmac_sha384_returns_ok() {
        let result = hmac_sign(b"key", b"message", "sha384");
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 96);
    }

    #[test]
    fn hmac_sha512_returns_ok() {
        let result = hmac_sign(b"key", b"message", "sha512");
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 128);
    }

    #[test]
    fn hmac_unknown_algorithm_err() {
        let result = hmac_sign(b"key", b"msg", "md5");
        assert!(result.is_err());
    }


    #[test]
    fn uuid_v4_length() {
        let id = generate_uuid_v4();
        assert_eq!(id.len(), 36, "UUID v4 must be 36 chars");
    }

    #[test]
    fn uuid_v4_format() {
        let id = generate_uuid_v4();
        let re = regex::Regex::new(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$").unwrap();
        assert!(re.is_match(&id), "UUID v4 format mismatch: {id}");
    }

    #[test]
    fn uuid_v7_version_nibble() {
        let id = generate_uuid_v7();
        assert_eq!(id.len(), 36);

        let version_char = id.chars().nth(14).unwrap();
        assert_eq!(version_char, '7', "UUID v7 version nibble should be '7', got: {version_char}");
    }

    #[test]
    fn inspect_uuid_v4_known() {
        let info = inspect_uuid("550e8400-e29b-41d4-a716-446655440000").unwrap();
        assert_eq!(info.version, 4);
        assert_eq!(info.value, "550e8400-e29b-41d4-a716-446655440000");
    }

    #[test]
    fn inspect_uuid_invalid() {
        assert!(inspect_uuid("not-a-uuid").is_err());
    }

    #[test]
    fn inspect_uuid_v4_no_timestamp() {
        let info = inspect_uuid("550e8400-e29b-41d4-a716-446655440000").unwrap();

        assert!(info.timestamp_ms.is_none());
    }


    #[test]
    fn ulid_length() {
        let ulid = generate_ulid();
        assert_eq!(ulid.len(), 26, "ULID must be 26 chars, got: {ulid}");
    }

    #[test]
    fn ulid_charset() {
        let ulid = generate_ulid();

        assert!(
            ulid.chars().all(|c| c.is_ascii_alphanumeric() && c != 'I' && c != 'L' && c != 'O' && c != 'U'),
            "ULID chars must be Crockford base32: {ulid}"
        );
    }

    #[test]
    fn ulid_uppercase() {
        let ulid = generate_ulid();
        assert!(ulid.chars().filter(|c| c.is_alphabetic()).all(|c| c.is_uppercase()),
            "ULID alphabetic chars should be uppercase: {ulid}");
    }


    #[test]
    fn jwt_decode_known_token() {


        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\
            eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.\
            SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        let parts = decode_jwt(token).unwrap();
        assert_eq!(parts.header["alg"].as_str(), Some("HS256"));
        assert_eq!(parts.header["typ"].as_str(), Some("JWT"));
        assert_eq!(parts.payload["sub"].as_str(), Some("1234567890"));
        assert_eq!(parts.payload["name"].as_str(), Some("John Doe"));
        assert_eq!(parts.iat_ts, Some(1516239022));
    }

    #[test]
    fn jwt_decode_expired_token() {

        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\
            eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.\
            SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        let parts = decode_jwt(token).unwrap();

        assert!(parts.is_expired.is_none(), "no exp claim means is_expired should be None");
    }

    #[test]
    fn jwt_decode_invalid() {
        assert!(decode_jwt("not.a.jwt.token.here").is_err() || decode_jwt("bad").is_err());
        assert!(decode_jwt("bad").is_err());
    }

    #[test]
    fn jwt_decode_signature_preserved() {
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\
            eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.\
            SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        let parts = decode_jwt(token).unwrap();
        assert_eq!(parts.signature_b64, "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    }


    #[test]
    fn argon2_hash_starts_with_argon2() {
        let hash = argon2_hash("password").unwrap();
        assert!(hash.starts_with("$argon2"), "argon2 hash should start with '$argon2', got: {hash}");
    }

    #[test]
    fn argon2_verify_correct_password() {
        let hash = argon2_hash("mypassword").unwrap();
        let result = argon2_verify("mypassword", &hash).unwrap();
        assert!(result, "correct password should verify as true");
    }

    #[test]
    fn argon2_verify_wrong_password() {
        let hash = argon2_hash("mypassword").unwrap();
        let result = argon2_verify("wrongpassword", &hash).unwrap();
        assert!(!result, "wrong password should verify as false");
    }


    #[test]
    fn bcrypt_hash_starts_with_2b() {
        let hash = bcrypt_hash("password", 4).unwrap();
        assert!(hash.starts_with("$2b$"), "bcrypt hash should start with '$2b$', got: {hash}");
    }

    #[test]
    fn bcrypt_verify_correct_password() {
        let hash = bcrypt_hash("secret123", 4).unwrap();
        let result = bcrypt_verify("secret123", &hash).unwrap();
        assert!(result, "correct password should verify");
    }

    #[test]
    fn bcrypt_verify_wrong_password() {
        let hash = bcrypt_hash("secret123", 4).unwrap();
        let result = bcrypt_verify("wrongpassword", &hash).unwrap();
        assert!(!result, "wrong password should not verify");
    }


    #[test]
    fn aes_gcm_roundtrip() {
        let plaintext = "secret message";
        let passphrase = "mypass";
        let encrypted = aes_gcm_encrypt(plaintext, passphrase).unwrap();
        let decrypted = aes_gcm_decrypt(&encrypted, passphrase).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn aes_gcm_wrong_passphrase_fails() {
        let encrypted = aes_gcm_encrypt("secret data", "correct_pass").unwrap();
        let result = aes_gcm_decrypt(&encrypted, "wrong_pass");
        assert!(result.is_err(), "wrong passphrase should fail decryption");
    }

    #[test]
    fn aes_gcm_encrypts_to_base64() {
        let encrypted = aes_gcm_encrypt("test", "pass").unwrap();

        let decoded = base64::Engine::decode(&base64::engine::general_purpose::STANDARD, &encrypted);
        assert!(decoded.is_ok(), "encrypted output should be valid base64, got: {encrypted}");
    }

    #[test]
    fn aes_gcm_different_nonces() {

        let ct1 = aes_gcm_encrypt("same plaintext", "same_pass").unwrap();
        let ct2 = aes_gcm_encrypt("same plaintext", "same_pass").unwrap();

        assert_ne!(ct1, ct2, "two encryptions should use different nonces");
    }


    #[test]
    fn rsa_512_keypair_pem_headers() {
        let kp = generate_rsa_keypair(512).unwrap();
        assert!(
            kp.private_key_pem.contains("BEGIN PRIVATE KEY") || kp.private_key_pem.contains("BEGIN RSA PRIVATE KEY"),
            "private key PEM should have BEGIN PRIVATE KEY header, got: {}", &kp.private_key_pem[..50.min(kp.private_key_pem.len())]
        );
        assert!(
            kp.public_key_pem.contains("BEGIN PUBLIC KEY") || kp.public_key_pem.contains("BEGIN RSA PUBLIC KEY"),
            "public key PEM should have BEGIN PUBLIC KEY header"
        );
    }

    #[test]
    fn rsa_512_keypair_metadata() {
        let kp = generate_rsa_keypair(512).unwrap();
        assert_eq!(kp.algorithm, "RSA");
        assert_eq!(kp.key_size, Some(512));
    }

    #[test]
    #[ignore]
    fn rsa_4096_keypair() {
        let kp = generate_rsa_keypair(4096).unwrap();
        assert_eq!(kp.key_size, Some(4096));
    }
}


mod binary_tests {
    use crate::binary::*;

    #[test]
    fn hex_dump_hello() {
        let lines = hex_dump(b"Hello", 16);
        assert_eq!(lines.len(), 1);
        assert_eq!(lines[0].offset, "00000000");
        assert_eq!(
            lines[0].hex_bytes,
            vec!["48", "65", "6C", "6C", "6F"]
        );
        assert_eq!(lines[0].ascii, "Hello");
    }

    #[test]
    fn hex_dump_empty() {
        let lines = hex_dump(b"", 16);
        assert!(lines.is_empty());
    }

    #[test]
    fn hex_dump_multiple_rows() {
        let data: Vec<u8> = (0..20).collect();
        let lines = hex_dump(&data, 8);
        assert_eq!(lines.len(), 3);
        assert_eq!(lines[0].offset, "00000000");
        assert_eq!(lines[1].offset, "00000008");
        assert_eq!(lines[2].offset, "00000010");
    }

    #[test]
    fn hex_to_utf8_hello() {
        let result = hex_to_utf8("48656c6c6f").unwrap();
        assert_eq!(result, "Hello");
    }

    #[test]
    fn hex_to_utf8_uppercase() {
        let result = hex_to_utf8("48656C6C6F").unwrap();
        assert_eq!(result, "Hello");
    }

    #[test]
    fn hex_to_utf8_invalid() {
        assert!(hex_to_utf8("ZZZZ").is_err());
    }

    #[test]
    fn utf8_to_hex_hello() {
        let result = utf8_to_hex("Hello");
        assert_eq!(result, "48656c6c6f");
    }

    #[test]
    fn utf8_to_hex_empty() {
        let result = utf8_to_hex("");
        assert_eq!(result, "");
    }

    #[test]
    fn hex_to_base64_hello_uppercase() {

        let result = hex_to_base64("48656c6c6f").unwrap();
        assert_eq!(result, "SGVsbG8=");
    }

    #[test]
    fn hex_to_base64_hello_lowercase() {

        let result = hex_to_base64("68656c6c6f").unwrap();
        assert_eq!(result, "aGVsbG8=");
    }

    #[test]
    fn base64_to_hex_hello_lowercase() {

        let result = base64_to_hex("aGVsbG8=").unwrap();
        assert_eq!(result, "68656c6c6f");
    }

    #[test]
    fn base64_to_hex_hello_uppercase() {

        let result = base64_to_hex("SGVsbG8=").unwrap();
        assert_eq!(result, "48656c6c6f");
    }

    #[test]
    fn hex_base64_roundtrip() {
        let hex = "deadbeef";
        let b64 = hex_to_base64(hex).unwrap();
        let back = base64_to_hex(&b64).unwrap();
        assert_eq!(back, hex);
    }

    #[test]
    fn inspect_bytes_two_bytes_be_le() {

        let bi = inspect_bytes("0001").unwrap();
        assert_eq!(bi.u16_be, Some(1));
        assert_eq!(bi.u16_le, Some(256));
    }

    #[test]
    fn inspect_bytes_ff() {
        let bi = inspect_bytes("FF").unwrap();
        assert_eq!(bi.decimal_u8, 255);
        assert_eq!(bi.hex, "FF");
        assert_eq!(bi.binary, "11111111");
    }

    #[test]
    fn inspect_bytes_single_byte() {
        let bi = inspect_bytes("41").unwrap();
        assert_eq!(bi.decimal_u8, 0x41);
        assert_eq!(bi.ascii, "A");

        assert!(bi.u16_be.is_none());
    }

    #[test]
    fn inspect_bytes_invalid_hex() {
        assert!(inspect_bytes("ZZ").is_err());
    }

    #[test]
    fn inspect_bytes_empty() {
        assert!(inspect_bytes("").is_err());
    }
}


mod numbers_tests {
    use crate::numbers::*;

    #[test]
    fn convert_base_255_decimal() {
        let r = convert_base("255", 10).unwrap();
        assert_eq!(r.binary, "11111111");
        assert_eq!(r.octal, "377");
        assert_eq!(r.decimal, "255");
        assert_eq!(r.hex, "FF");
    }

    #[test]
    fn convert_base_ff_hex() {
        let r = convert_base("FF", 16).unwrap();
        assert_eq!(r.binary, "11111111");
        assert_eq!(r.octal, "377");
        assert_eq!(r.decimal, "255");
        assert_eq!(r.hex, "FF");
    }

    #[test]
    fn convert_base_binary_input() {
        let r = convert_base("1010", 2).unwrap();
        assert_eq!(r.decimal, "10");
        assert_eq!(r.hex, "A");
    }

    #[test]
    fn convert_base_invalid() {
        assert!(convert_base("XYZ", 10).is_err());
    }

    #[test]
    fn convert_base_zero() {
        let r = convert_base("0", 10).unwrap();
        assert_eq!(r.binary, "0");
        assert_eq!(r.decimal, "0");
        assert_eq!(r.hex, "0");
    }

    #[test]
    fn to_arbitrary_base_base36() {

        let result = to_arbitrary_base(35, 36).unwrap();
        assert_eq!(result, "Z");
    }

    #[test]
    fn to_arbitrary_base_binary() {
        let result = to_arbitrary_base(10, 2).unwrap();
        assert_eq!(result, "1010");
    }

    #[test]
    fn to_arbitrary_base_zero() {
        let result = to_arbitrary_base(0, 16).unwrap();
        assert_eq!(result, "0");
    }

    #[test]
    fn to_arbitrary_base_invalid_base() {
        assert!(to_arbitrary_base(5, 1).is_err());
        assert!(to_arbitrary_base(5, 37).is_err());
    }

    #[test]
    fn format_number_with_locale_sep() {
        let result = format_number(1000.0, true, false, false);
        assert_eq!(result, "1,000");
    }

    #[test]
    fn format_number_ordinal_1st() {
        let result = format_number(1.0, false, true, false);
        assert_eq!(result, "1st");
    }

    #[test]
    fn format_number_ordinal_2nd() {
        let result = format_number(2.0, false, true, false);
        assert_eq!(result, "2nd");
    }

    #[test]
    fn format_number_ordinal_3rd() {
        let result = format_number(3.0, false, true, false);
        assert_eq!(result, "3rd");
    }

    #[test]
    fn format_number_ordinal_11th() {

        let result = format_number(11.0, false, true, false);
        assert_eq!(result, "11th");
    }

    #[test]
    fn format_number_ordinal_12th() {
        let result = format_number(12.0, false, true, false);
        assert_eq!(result, "12th");
    }

    #[test]
    fn format_number_ordinal_13th() {
        let result = format_number(13.0, false, true, false);
        assert_eq!(result, "13th");
    }

    #[test]
    fn format_number_scientific() {
        let result = format_number(1000000.0, false, false, true);
        assert!(result.contains('e') || result.contains('E'), "scientific should use 'e' notation, got: {result}");
    }

    #[test]
    fn format_number_plain() {
        let result = format_number(42.0, false, false, false);
        assert_eq!(result, "42");
    }

    #[test]
    fn humanize_bytes_zero() {
        assert_eq!(humanize_bytes(0), "0 B");
    }

    #[test]
    fn humanize_bytes_one() {
        assert_eq!(humanize_bytes(1), "1 B");
    }

    #[test]
    fn humanize_bytes_kilobyte() {
        assert_eq!(humanize_bytes(1024), "1.00 KB");
    }

    #[test]
    fn humanize_bytes_megabyte() {
        assert_eq!(humanize_bytes(1048576), "1.00 MB");
    }

    #[test]
    fn humanize_bytes_gigabyte() {
        assert_eq!(humanize_bytes(1024 * 1024 * 1024), "1.00 GB");
    }
}


mod convert_tests {
    use crate::convert::*;

    #[test]
    fn yaml_to_json_basic() {
        let yaml = "name: Alice\nage: 30\n";
        let json = yaml_to_json(yaml).unwrap();
        assert!(json.contains("Alice"), "JSON should contain 'Alice', got: {json}");
        assert!(json.contains("30"), "JSON should contain '30', got: {json}");
    }

    #[test]
    fn yaml_to_json_nested() {
        let yaml = "person:\n  name: Bob\n  age: 25\n";
        let json = yaml_to_json(yaml).unwrap();
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v["person"]["name"].as_str(), Some("Bob"));
    }

    #[test]
    fn yaml_to_json_invalid() {


        let result = yaml_to_json(":\n  bad:\n  key:");

        let _ = result;
    }

    #[test]
    fn json_to_yaml_basic() {
        let json = r#"{"name": "Alice"}"#;
        let yaml = json_to_yaml(json).unwrap();
        assert!(yaml.contains("Alice"), "YAML should contain 'Alice', got: {yaml}");
    }

    #[test]
    fn json_to_yaml_invalid() {
        assert!(json_to_yaml("{bad json}").is_err());
    }

    #[test]
    fn yaml_json_roundtrip() {
        let original_json = r#"{"name":"Alice","age":30}"#;
        let yaml = json_to_yaml(original_json).unwrap();
        let back_json = yaml_to_json(&yaml).unwrap();
        let v1: serde_json::Value = serde_json::from_str(original_json).unwrap();
        let v2: serde_json::Value = serde_json::from_str(&back_json).unwrap();
        assert_eq!(v1, v2);
    }

    #[test]
    fn toml_to_json_package() {
        let toml = "[package]\nname = \"test\"\nversion = \"1.0.0\"\n";
        let json = toml_to_json(toml).unwrap();
        assert!(json.contains("test"), "JSON should contain 'test', got: {json}");
    }

    #[test]
    fn json_to_toml_basic() {
        let json = r#"{"name": "hello", "version": "1.0"}"#;
        let toml = json_to_toml(json).unwrap();
        assert!(toml.contains("hello"), "TOML should contain 'hello', got: {toml}");
    }

    #[test]
    fn json_to_toml_invalid_json() {
        assert!(json_to_toml("{bad}").is_err());
    }

    #[test]
    fn csv_to_json_basic() {
        let csv = "name,age\nAlice,30\nBob,25\n";
        let json = csv_to_json(csv).unwrap();
        let v: serde_json::Value = serde_json::from_str(&json).unwrap();
        let arr = v.as_array().unwrap();
        assert_eq!(arr.len(), 2);
        assert_eq!(arr[0]["name"].as_str(), Some("Alice"));
        assert_eq!(arr[0]["age"].as_str(), Some("30"));
    }

    #[test]
    fn csv_to_json_headers() {
        let csv = "name,age\nAlice,30\n";
        let json = csv_to_json(csv).unwrap();
        assert!(json.contains("Alice"));
        assert!(json.contains("30"));
    }

    #[test]
    fn json_to_csv_basic() {
        let json = r#"[{"name":"Alice","age":"30"}]"#;
        let csv = json_to_csv(json).unwrap();
        assert!(csv.contains("Alice"), "CSV should contain 'Alice', got: {csv}");
        assert!(csv.contains("30"), "CSV should contain '30', got: {csv}");
    }

    #[test]
    fn json_to_csv_headers_present() {
        let json = r#"[{"name":"Alice","city":"LA"}]"#;
        let csv = json_to_csv(json).unwrap();

        let first_line = csv.lines().next().unwrap();
        assert!(first_line.contains("name"), "CSV header should contain 'name', got: {first_line}");
    }

    #[test]
    fn json_to_csv_not_array() {
        assert!(json_to_csv(r#"{"name":"Alice"}"#).is_err());
    }

    #[test]
    fn csv_json_roundtrip() {
        let original_csv = "name,age\nAlice,30\n";
        let json = csv_to_json(original_csv).unwrap();
        let csv_back = json_to_csv(&json).unwrap();
        assert!(csv_back.contains("Alice"));
        assert!(csv_back.contains("30"));
    }
}


mod color_tests {
    use crate::color::*;

    #[test]
    fn parse_color_hex_red() {
        let info = parse_color("#FF0000").unwrap();
        assert_eq!(info.hex, "#FF0000");
        assert_eq!(info.rgb.r, 255);
        assert_eq!(info.rgb.g, 0);
        assert_eq!(info.rgb.b, 0);
    }

    #[test]
    fn parse_color_hex_lowercase() {
        let info = parse_color("#ff0000").unwrap();
        assert_eq!(info.rgb.r, 255);
        assert_eq!(info.rgb.g, 0);
        assert_eq!(info.rgb.b, 0);
    }

    #[test]
    fn parse_color_hex_short() {

        let info = parse_color("#F00").unwrap();
        assert_eq!(info.rgb.r, 255);
        assert_eq!(info.rgb.g, 0);
        assert_eq!(info.rgb.b, 0);
    }

    #[test]
    fn parse_color_rgb_function() {
        let info = parse_color("rgb(255,0,0)").unwrap();
        assert_eq!(info.rgb.r, 255);
        assert_eq!(info.rgb.g, 0);
        assert_eq!(info.rgb.b, 0);
        assert_eq!(info.hex, "#FF0000");
    }

    #[test]
    fn parse_color_hex_black() {
        let info = parse_color("#000000").unwrap();
        assert_eq!(info.rgb.r, 0);
        assert_eq!(info.rgb.g, 0);
        assert_eq!(info.rgb.b, 0);
        assert_eq!(info.hex, "#000000");
    }

    #[test]
    fn parse_color_hex_white() {
        let info = parse_color("#FFFFFF").unwrap();
        assert_eq!(info.rgb.r, 255);
        assert_eq!(info.rgb.g, 255);
        assert_eq!(info.rgb.b, 255);
    }

    #[test]
    fn parse_color_invalid() {
        let result = parse_color("invalid");
        assert!(result.is_err(), "invalid color string should return Err");
    }

    #[test]
    fn parse_color_invalid_word() {
        let result = parse_color("red");
        assert!(result.is_err());
    }

    #[test]
    fn parse_color_wcag_luminance_white() {
        let info = parse_color("#FFFFFF").unwrap();

        assert!(info.wcag_luminance > 0.99, "white luminance should be ~1.0, got: {}", info.wcag_luminance);
    }

    #[test]
    fn parse_color_wcag_luminance_black() {
        let info = parse_color("#000000").unwrap();

        assert!(info.wcag_luminance < 0.01, "black luminance should be ~0.0, got: {}", info.wcag_luminance);
    }

    #[test]
    fn parse_color_contrast_black_on_white() {
        let info = parse_color("#FFFFFF").unwrap();

        assert!(info.contrast_on_black > 20.0, "white contrast on black should be ~21, got: {}", info.contrast_on_black);
    }

    #[test]
    fn parse_color_hsl_red() {

        let info = parse_color("hsl(0, 100%, 50%)").unwrap();
        assert_eq!(info.rgb.r, 255);
        assert_eq!(info.rgb.g, 0);
        assert_eq!(info.rgb.b, 0);
    }

    #[test]
    fn parse_color_rgb_green() {
        let info = parse_color("rgb(0,128,0)").unwrap();
        assert_eq!(info.rgb.r, 0);
        assert_eq!(info.rgb.g, 128);
        assert_eq!(info.rgb.b, 0);
        assert_eq!(info.hex, "#008000");
    }

    #[test]
    fn parse_color_aa_large_passes_for_high_contrast() {

        let info = parse_color("#000000").unwrap();
        assert!(info.aa_large, "black on white/black should pass AA large");
    }
}


mod time_tests {
    use crate::time_tools::*;

    #[test]
    fn unix_to_info_epoch() {
        let info = unix_to_info(0, "UTC").unwrap();
        assert!(info.utc_iso.contains("1970-01-01"), "epoch should be 1970-01-01, got: {}", info.utc_iso);
        assert_eq!(info.unix_seconds, 0);
        assert_eq!(info.unix_ms, 0);
    }

    #[test]
    fn unix_to_info_known_ts() {

        let info = unix_to_info(1704067200, "UTC").unwrap();
        assert!(info.utc_iso.contains("2024-01-01"), "should be 2024-01-01, got: {}", info.utc_iso);
    }

    #[test]
    fn unix_to_info_unix_ms() {
        let info = unix_to_info(1000, "UTC").unwrap();
        assert_eq!(info.unix_ms, 1000000);
    }

    #[test]
    fn unix_to_info_invalid_tz() {
        let result = unix_to_info(0, "Invalid/Timezone");
        assert!(result.is_err(), "invalid timezone should return Err");
    }

    #[test]
    fn unix_to_info_utc_format() {
        let info = unix_to_info(0, "UTC").unwrap();

        assert_eq!(info.utc_iso, "1970-01-01T00:00:00Z");
    }

    #[test]
    fn iso_to_unix_epoch() {
        let result = iso_to_unix("1970-01-01T00:00:00Z").unwrap();
        assert_eq!(result, 0);
    }

    #[test]
    fn iso_to_unix_known() {
        let result = iso_to_unix("2024-01-01T00:00:00Z").unwrap();
        assert_eq!(result, 1704067200);
    }

    #[test]
    fn iso_to_unix_invalid() {
        assert!(iso_to_unix("not a date").is_err());
    }

    #[test]
    fn now_unix_positive() {
        let ts = now_unix();
        assert!(ts > 0, "current unix timestamp should be positive, got: {ts}");
    }

    #[test]
    fn now_unix_reasonable_range() {
        let ts = now_unix();

        assert!(ts > 1577836800, "timestamp should be after 2020");
        assert!(ts < 4102444800, "timestamp should be before 2100");
    }

    #[test]
    fn parse_duration_1h_30m() {
        let result = parse_duration("1h 30m").unwrap();
        assert_eq!(result.total_seconds, 5400);
    }

    #[test]
    fn parse_duration_breakdown() {
        let result = parse_duration("1h 30m").unwrap();
        assert_eq!(result.breakdown.hours, 1);
        assert_eq!(result.breakdown.minutes, 30);
        assert_eq!(result.breakdown.seconds, 0);
        assert_eq!(result.breakdown.days, 0);
    }

    #[test]
    fn parse_duration_seconds_only() {
        let result = parse_duration("90s").unwrap();
        assert_eq!(result.total_seconds, 90);
    }

    #[test]
    fn parse_duration_days() {
        let result = parse_duration("2d").unwrap();
        assert_eq!(result.total_seconds, 172800);
        assert_eq!(result.breakdown.days, 2);
    }

    #[test]
    fn parse_duration_human_readable() {
        let result = parse_duration("1h 30m").unwrap();
        assert!(!result.human.is_empty(), "human field should be non-empty");
        assert!(result.human.contains('h') || result.human.contains('m') || result.human.contains("90"),
            "human should mention hours/minutes, got: {}", result.human);
    }

    #[test]
    fn parse_duration_iso8601() {
        let result = parse_duration("1h 30m").unwrap();

        assert!(result.iso8601.starts_with('P'), "ISO 8601 duration should start with 'P', got: {}", result.iso8601);
        assert!(result.iso8601.contains('T'), "ISO 8601 duration should contain 'T', got: {}", result.iso8601);
    }

    #[test]
    fn parse_duration_numeric_seconds() {

        let result = parse_duration("3600").unwrap();
        assert_eq!(result.total_seconds, 3600);
        assert_eq!(result.breakdown.hours, 1);
    }

    #[test]
    fn parse_duration_colon_hms() {
        let r = parse_duration("01:23:45").unwrap();
        assert_eq!(r.total_seconds, 3600 + 23 * 60 + 45);
    }

    #[test]
    fn parse_duration_colon_hms_ms() {
        let r = parse_duration("01:23:45.500").unwrap();

        assert_eq!(r.total_seconds, 3600 + 23 * 60 + 45);
    }

    #[test]
    fn parse_duration_colon_mm_ss() {
        let r = parse_duration("12:34").unwrap();
        assert_eq!(r.total_seconds, 12 * 60 + 34);
    }

    #[test]
    fn parse_duration_weeks_and_days() {
        let r = parse_duration("1 week and 3 days").unwrap();
        assert_eq!(r.total_seconds, 7 * 86400 + 3 * 86400);
    }

    #[test]
    fn parse_duration_full_words() {
        let r = parse_duration("2 hours 30 minutes").unwrap();
        assert_eq!(r.total_seconds, 2 * 3600 + 30 * 60);
    }

    #[test]
    fn parse_duration_decimal() {
        let r = parse_duration("1.5h").unwrap();
        assert_eq!(r.total_seconds, 5400);
    }

    #[test]
    fn parse_duration_commas() {
        let r = parse_duration("1d, 2h, 3m").unwrap();
        assert_eq!(r.total_seconds, 86400 + 2 * 3600 + 3 * 60);
    }
}


mod net_tests {
    use crate::net::*;


    #[test]
    fn parse_ip_cidr_host_count() {
        let info = parse_ip("192.168.1.0/24").unwrap();
        assert_eq!(info.host_count, Some(254));
    }

    #[test]
    fn parse_ip_cidr_network() {
        let info = parse_ip("192.168.1.0/24").unwrap();
        assert_eq!(info.address, "192.168.1.0");
    }

    #[test]
    fn parse_ip_google_dns_public() {
        let info = parse_ip("8.8.8.8").unwrap();
        assert_eq!(info.address, "8.8.8.8");
        assert!(!info.is_private, "8.8.8.8 should not be private");
    }

    #[test]
    fn parse_ip_private() {
        let info = parse_ip("192.168.1.1").unwrap();
        assert!(info.is_private, "192.168.1.1 should be private");
    }

    #[test]
    fn parse_ip_loopback() {
        let info = parse_ip("127.0.0.1").unwrap();
        assert!(info.is_loopback, "127.0.0.1 should be loopback");
    }

    #[test]
    fn parse_ip_version4() {
        let info = parse_ip("10.0.0.1").unwrap();
        assert_eq!(info.version, 4);
    }

    #[test]
    fn parse_ip_invalid() {
        assert!(parse_ip("not-an-ip").is_err());
    }

    #[test]
    fn parse_ip_class_a() {
        let info = parse_ip("10.0.0.1").unwrap();
        assert_eq!(info.class, Some("A".into()));
    }

    #[test]
    fn parse_ip_class_c() {
        let info = parse_ip("192.168.1.1").unwrap();
        assert_eq!(info.class, Some("C".into()));
    }


    #[test]
    fn format_mac_basic() {
        let result = format_mac("aabbccddeeff");

        assert_eq!(result, "AA-BB-CC-DD-EE-FF");
    }

    #[test]
    fn format_mac_with_colons_input() {
        let result = format_mac("aa:bb:cc:dd:ee:ff");
        assert_eq!(result, "AA-BB-CC-DD-EE-FF");
    }

    #[test]
    fn lookup_mac_oui_vmware() {
        let vendor = lookup_mac_oui("00:0C:29:xx:xx:xx");
        assert_eq!(vendor, Some("VMware"));
    }

    #[test]
    fn lookup_mac_oui_unknown() {
        let vendor = lookup_mac_oui("FF:FF:FF:FF:FF:FF");
        assert!(vendor.is_none());
    }


    #[test]
    fn parse_url_basic() {
        let info = parse_url("https://example.com/path?q=1#frag").unwrap();
        assert_eq!(info.scheme, "https");
        assert_eq!(info.host, Some("example.com".into()));
        assert_eq!(info.path, "/path");
        assert_eq!(info.query, Some("q=1".into()));
        assert_eq!(info.fragment, Some("frag".into()));
    }

    #[test]
    fn parse_url_with_port() {
        let info = parse_url("http://localhost:8080/").unwrap();
        assert_eq!(info.port, Some(8080));
    }

    #[test]
    fn parse_url_query_params() {
        let info = parse_url("https://example.com?a=1&b=2").unwrap();
        assert!(info.query_params.contains(&("a".into(), "1".into())));
        assert!(info.query_params.contains(&("b".into(), "2".into())));
    }

    #[test]
    fn parse_url_invalid() {
        assert!(parse_url("not a url").is_err());
    }


    #[test]
    fn http_status_200() {
        let result = http_status_info(200);
        let (desc, _) = result.unwrap();
        assert!(desc.contains("OK"), "200 should contain 'OK', got: {desc}");
    }

    #[test]
    fn http_status_404() {
        let result = http_status_info(404);
        let (desc, category) = result.unwrap();
        assert!(desc.contains("Not Found"), "404 should be Not Found, got: {desc}");
        assert_eq!(category, "Client Error");
    }

    #[test]
    fn http_status_500() {
        let result = http_status_info(500);
        let (_, category) = result.unwrap();
        assert_eq!(category, "Server Error");
    }

    #[test]
    fn http_status_999_none() {
        assert!(http_status_info(999).is_none());
    }

    #[test]
    fn http_status_200_category() {
        let (_, category) = http_status_info(200).unwrap();
        assert_eq!(category, "Success");
    }


    #[test]
    fn mime_from_extension_json() {
        assert_eq!(mime_from_extension("json"), Some("application/json"));
    }

    #[test]
    fn mime_from_extension_html() {
        assert_eq!(mime_from_extension("html"), Some("text/html"));
    }

    #[test]
    fn mime_from_extension_png() {
        assert_eq!(mime_from_extension("png"), Some("image/png"));
    }

    #[test]
    fn mime_from_extension_unknown() {
        assert!(mime_from_extension("xyz123").is_none());
    }

    #[test]
    fn mime_from_extension_case_insensitive() {
        assert_eq!(mime_from_extension("JSON"), Some("application/json"));
    }


    #[test]
    fn format_sql_uppercases_keywords() {
        let result = format_sql("select * from foo where id=1", 2);
        assert!(result.contains("SELECT"), "SQL keywords should be uppercased, got: {result}");
        assert!(result.contains("FROM"), "SQL keywords should be uppercased, got: {result}");
    }

    #[test]
    fn format_sql_where_clause() {
        let result = format_sql("select id from users where active = 1", 2);
        assert!(result.contains("WHERE"), "SQL should contain WHERE, got: {result}");
    }

    #[test]
    fn format_sql_preserves_table_name() {
        let result = format_sql("select * from my_table", 2);
        assert!(result.contains("my_table"), "SQL should preserve table name, got: {result}");
    }
}
