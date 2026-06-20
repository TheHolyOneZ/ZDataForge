

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { invoke } from '@tauri-apps/api/core';
import { Suspense } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockInvoke = invoke as ReturnType<typeof vi.fn>;


vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange, placeholder }: { value: string; onChange?: (v: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="codemirror"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@codemirror/lang-json', () => ({ json: () => ({}) }));
vi.mock('@codemirror/view', () => ({ EditorView: { theme: () => ({}) } }));
vi.mock('@codemirror/language', () => ({
  HighlightStyle: { define: () => ({}) },
  syntaxHighlighting: () => ({}),
}));
vi.mock('@codemirror/state', () => ({}));
vi.mock('@lezer/highlight', () => ({ tags: new Proxy({}, { get: () => ({}) }) }));

function renderWithSuspense(ui: React.ReactElement) {
  return render(<Suspense fallback={<div>Loading...</div>}>{ui}</Suspense>);
}


describe('JSON Formatter', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('formats JSON and shows output when Format button is clicked', async () => {
    mockInvoke.mockResolvedValue({ output: '{\n  "a": 1\n}', byte_count: 10, elapsed_ms: 0.5 });

    const { default: JsonFormatter } = await import('../tools/json-formatter/index');
    renderWithSuspense(<JsonFormatter />);


    const formatBtn = await screen.findByText('Format');
    await act(async () => { fireEvent.click(formatBtn); });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('format_json', expect.any(Object));
    });


    await waitFor(() => {
      const outputs = screen.getAllByTestId('codemirror');
      const outputEditor = outputs.find(el => (el as HTMLTextAreaElement).value === '{\n  "a": 1\n}');
      expect(outputEditor).toBeTruthy();
    });
  });
});

describe('JSON Diff', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows diff result when both panes have JSON', async () => {
    mockInvoke.mockResolvedValue({
      diff: [
        { kind: 'removed', content: '"a": 1' },
        { kind: 'added', content: '"a": 2' },
      ],
      elapsed_ms: 0.3,
    });

    const { default: JsonDiff } = await import('../tools/json-diff/index');
    renderWithSuspense(<JsonDiff />);

    const editors = await screen.findAllByTestId('codemirror');

    await act(async () => {
      fireEvent.change(editors[0], { target: { value: '{"a":1}' } });
    });

    await act(async () => {
      fireEvent.change(editors[1], { target: { value: '{"a":2}' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('json_diff', expect.objectContaining({ left: '{"a":1}', right: '{"a":2}' }));
    });
  });
});


describe('Case Converter', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('converts input text and shows all cases', async () => {
    mockInvoke.mockResolvedValue({
      snake: 'hello_world',
      camel: 'helloWorld',
      pascal: 'HelloWorld',
      kebab: 'hello-world',
      screaming: 'HELLO_WORLD',
      title: 'Hello World',
      train: 'Hello-World',
    });

    const { default: CaseConverter } = await import('../tools/case-converter/index');
    renderWithSuspense(<CaseConverter />);

    const input = await screen.findByPlaceholderText('Type or paste text to convert…');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'hello world' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('convert_case', expect.objectContaining({ input: 'hello world' }));
    });

    await waitFor(() => {
      expect(screen.getByText('hello_world')).toBeInTheDocument();
      expect(screen.getByText('helloWorld')).toBeInTheDocument();
      expect(screen.getByText('HelloWorld')).toBeInTheDocument();
    });
  });
});

describe('Regex Tester', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows match count from IPC result', async () => {
    mockInvoke.mockResolvedValue({
      matches: [
        { start: 0, end: 5, text: 'hello', groups: [] },
      ],
      match_count: 1,
      replaced: null,
      elapsed_ms: 0.1,
    });

    const { default: RegexTester } = await import('../tools/regex-tester/index');
    renderWithSuspense(<RegexTester />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('test_regex', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText(/1 match/)).toBeInTheDocument();
    });
  });
});


describe('Base64', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('encodes input and shows output', async () => {
    mockInvoke.mockResolvedValue('aGVsbG8=');

    const { default: Base64Tool } = await import('../tools/base64/index');
    renderWithSuspense(<Base64Tool />);

    const textareas = await screen.findAllByRole('textbox');
    const inputTextarea = textareas[0];

    await act(async () => {
      fireEvent.change(inputTextarea, { target: { value: 'hello' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('base64_encode', expect.any(Object));
    });

    await waitFor(() => {
      const allTextareas = screen.getAllByRole('textbox');
      const outArea = allTextareas.find(
        el => (el as HTMLTextAreaElement).readOnly && (el as HTMLTextAreaElement).value === 'aGVsbG8='
      );
      expect(outArea).toBeTruthy();
    });
  });
});

describe('JWT Decoder', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('decodes a JWT and shows header and payload fields', async () => {
    mockInvoke.mockResolvedValue({
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: '1', name: 'Alice' },
      signature_b64: 'xxx',
      is_expired: false,
      exp_ts: null,
      iat_ts: null,
      nbf_ts: null,
      verified: null,
      verify_error: null,
    });

    const { default: JwtDecoder } = await import('../tools/jwt-decoder/index');
    renderWithSuspense(<JwtDecoder />);


    const textarea = await screen.findByPlaceholderText('Paste JWT token here…');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.signature' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('decode_jwt', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('alg')).toBeInTheDocument();
      expect(screen.getByText('HS256')).toBeInTheDocument();
      expect(screen.getByText('sub')).toBeInTheDocument();
    });
  });
});


describe('Hash Generator', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('displays all hash values from IPC', async () => {
    mockInvoke.mockResolvedValue({
      md5: 'abc123',
      sha1: 'def456',
      sha256: 'ghi789',
      sha384: 'jkl012',
      sha512: 'mno345',
      blake3: 'pqr678',
    });

    const { default: HashGenerator } = await import('../tools/hash-generator/index');
    renderWithSuspense(<HashGenerator />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('hash_text', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('abc123')).toBeInTheDocument();
      expect(screen.getByText('def456')).toBeInTheDocument();
      expect(screen.getByText('ghi789')).toBeInTheDocument();
    });
  });
});

describe('UUID Generator', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('generates UUIDs when clicking Generate button', async () => {
    const fakeUuid = '550e8400-e29b-41d4-a716-446655440000';
    mockInvoke.mockResolvedValue(fakeUuid);

    const { default: UuidGenerator } = await import('../tools/uuid-generator/index');
    renderWithSuspense(<UuidGenerator />);


    const generateBtn = await screen.findByRole('button', { name: /Generate 10/ });
    await act(async () => { fireEvent.click(generateBtn); });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('generate_uuid', expect.any(Object));
    });

    await waitFor(() => {
      const uuidElements = screen.getAllByText(fakeUuid);
      expect(uuidElements.length).toBeGreaterThan(0);
    });
  });
});


describe('Hex Viewer', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows hex dump from IPC', async () => {
    mockInvoke.mockResolvedValue([
      { offset: '00000000', hex_bytes: ['48', '65', '6c', '6c', '6f'], ascii: 'Hello' },
    ]);

    const { default: HexViewer } = await import('../tools/hex-viewer/index');
    renderWithSuspense(<HexViewer />);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('hex_dump', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('00000000')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });
});

describe('Base Converter', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('converts number and shows all bases', async () => {
    mockInvoke.mockResolvedValue({
      binary: '1010',
      octal: '12',
      decimal: '10',
      hex: 'A',
    });

    const { default: BaseConverter } = await import('../tools/base-converter/index');
    renderWithSuspense(<BaseConverter />);


    const input = await screen.findByPlaceholderText(/Enter DEC value/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '10' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('convert_base', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('1010')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });
});


describe('Unix Timestamp', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows timestamp info when unix timestamp is entered', async () => {
    mockInvoke.mockImplementation((cmd: string) => {
      if (cmd === 'now_unix') return Promise.resolve(1716239022);
      if (cmd === 'unix_to_info') return Promise.resolve({
        unix_seconds: 0,
        unix_ms: 0,
        utc_iso: '1970-01-01T00:00:00Z',
        utc_rfc2822: 'Thu, 01 Jan 1970 00:00:00 +0000',
        local_display: '1970-01-01T00:00:00',
        relative: '56 years ago',
        tz_name: 'UTC',
      });
      return Promise.resolve(null);
    });

    const { default: Timestamp } = await import('../tools/timestamp/index');
    renderWithSuspense(<Timestamp />);

    const unixInput = await screen.findByPlaceholderText(/e\.g\. 1716239022/);
    await act(async () => {
      fireEvent.change(unixInput, { target: { value: '0' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('unix_to_info', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('1970-01-01T00:00:00Z')).toBeInTheDocument();
    });
  });
});


describe('IP Calculator', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows subnet info for CIDR input', async () => {
    mockInvoke.mockResolvedValue({
      address: '192.168.1.0',
      version: 4,
      network: '192.168.1.0/24',
      netmask: '255.255.255.0',
      broadcast: '192.168.1.255',
      host_min: '192.168.1.1',
      host_max: '192.168.1.254',
      host_count: 254,
      prefix_len: 24,
      is_private: true,
      is_loopback: false,
      is_multicast: false,
      is_link_local: false,
      class: 'C',
    });

    const { default: IpCalculator } = await import('../tools/ip-calculator/index');
    renderWithSuspense(<IpCalculator />);


    const ipInput = await screen.findByPlaceholderText(/IP address or CIDR/i);
    await act(async () => {
      fireEvent.change(ipInput, { target: { value: '10.0.0.0/8' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('parse_ip', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('255.255.255.0')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.255')).toBeInTheDocument();
    });
  });
});

describe('URL Parser', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows parsed URL components', async () => {
    mockInvoke.mockResolvedValue({
      scheme: 'https',
      host: 'example.com',
      port: 8080,
      path: '/v1/search',
      query: 'q=hello',
      query_params: [['q', 'hello']],
      fragment: 'results',
      username: null,
    });

    const { default: UrlParser } = await import('../tools/url-parser/index');
    renderWithSuspense(<UrlParser />);


    const urlInput = await screen.findByPlaceholderText(/Paste a URL to parse/i);
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com:8080/v1/search?q=hello#results' } });
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('parse_url_tool', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('https')).toBeInTheDocument();
      expect(screen.getByText('example.com')).toBeInTheDocument();
      expect(screen.getByText('/v1/search')).toBeInTheDocument();
    });
  });
});

describe('QR Generator', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('renders QR SVG after input', async () => {
    mockInvoke.mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>');

    const { default: QrGenerator } = await import('../tools/qr-generator/index');
    renderWithSuspense(<QrGenerator />);


    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('generate_qr_svg', expect.any(Object));
    });


    await waitFor(() => {
      const svgEl = document.querySelector('svg');
      expect(svgEl).toBeTruthy();
    });
  });
});


describe('X.509 Inspector', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('shows cert info after clicking Inspect Certificate', async () => {
    mockInvoke.mockResolvedValue({
      subject: 'CN=example.com',
      issuer: 'CN=My CA',
      serial: '01',
      notBefore: '2024-01-01T00:00:00Z',
      notAfter: '2025-01-01T00:00:00Z',
      daysRemaining: 200,
      keyAlgorithm: 'RSA (2048 bits)',
      sigAlgorithm: 'SHA256WithRSA',
      sans: ['example.com', 'www.example.com'],
      isCa: false,
      fingerprintSha256: 'AA:BB:CC:DD',
    });

    const { default: X509Inspector } = await import('../tools/x509-inspector/index');
    renderWithSuspense(<X509Inspector />);


    const textarea = await screen.findByPlaceholderText(/Paste PEM certificate/);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '-----BEGIN CERTIFICATE-----\nfake\n-----END CERTIFICATE-----' } });
    });


    const inspectBtn = screen.getByRole('button', { name: /Inspect Certificate/ });
    await act(async () => { fireEvent.click(inspectBtn); });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('inspect_x509_cmd', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('CN=example.com')).toBeInTheDocument();
      expect(screen.getByText('SHA256WithRSA')).toBeInTheDocument();
    });
  });
});

describe('MessagePack', () => {
  beforeEach(() => { mockInvoke.mockReset(); });

  it('converts JSON to MessagePack hex', async () => {
    mockInvoke.mockResolvedValue('81 a3 foo a3 bar');

    const { default: MsgpackTool } = await import('../tools/msgpack/index');
    renderWithSuspense(<MsgpackTool />);


    const convertBtn = await screen.findByRole('button', { name: /^Convert$/ });
    await act(async () => { fireEvent.click(convertBtn); });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('json_to_msgpack_cmd', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('81 a3 foo a3 bar')).toBeInTheDocument();
    });
  });
});
