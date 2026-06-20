use criterion::{black_box, criterion_group, criterion_main, Criterion};
use forge_core::{crypto::hash_all, json::format_json, text::test_regex};


fn bench_json_format(c: &mut Criterion) {

    let entry = r#"{"id":123456789,"name":"benchmark-entry","active":true,"score":3.14159,"tags":["alpha","beta","gamma"]}"#;
    let mut items: Vec<&str> = Vec::with_capacity(8_000);
    let mut approx_size = 2usize;
    while approx_size < 1_048_576 {
        items.push(entry);
        approx_size += entry.len() + 1;
    }
    let json = format!("[{}]", items.join(","));

    c.bench_function("json_format_1mb", |b| {
        b.iter(|| {
            let result = format_json(black_box(&json), 2);
            black_box(result)
        })
    });
}


fn bench_regex_match(c: &mut Criterion) {

    let mut lines = Vec::with_capacity(100_000);
    for i in 0..100_000usize {
        if i % 100 == 0 {
            lines.push(format!("ERROR [{}] Connection refused: timeout after 30s", i));
        } else {
            lines.push(format!("INFO  [{}] Request processed successfully in 12ms", i));
        }
    }
    let input = lines.join("\n");
    let pattern = r"ERROR.*timeout";

    c.bench_function("regex_match_100k_lines", |b| {
        b.iter(|| {
            let result = test_regex(black_box(pattern), black_box(""), black_box(&input), None);
            black_box(result)
        })
    });
}


fn bench_sha256_10mb(c: &mut Criterion) {

    let data: Vec<u8> = (0..10_485_760usize).map(|i| (i.wrapping_mul(6364136223846793005) >> 56) as u8).collect();

    c.bench_function("sha256_10mb", |b| {
        b.iter(|| {
            let result = hash_all(black_box(&data));
            black_box(result.sha256)
        })
    });
}

criterion_group!(benches, bench_json_format, bench_regex_match, bench_sha256_10mb);
criterion_main!(benches);
