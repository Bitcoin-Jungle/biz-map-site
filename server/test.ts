import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';

interface TestResult {
  name: string;
  pass: boolean;
  detail?: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, detail?: string): void {
  results.push({ name, pass: condition, detail });
}

function assertEqual<T>(name: string, actual: T, expected: T): void {
  assert(name, Object.is(actual, expected), `expected ${String(expected)}, got ${String(actual)}`);
}

async function main(): Promise<void> {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

  process.env.APPLE_MAPS_KEY = privatePem.replace(/\n/g, '\\n');
  process.env.APPLE_TEAM_ID = 'TESTTEAMID';
  process.env.MAPS_KEY_ID = 'TESTKEYID';
  process.env.SITE_ORIGIN = 'http://localhost:5173';
  process.env.APPROVE_KEY = 'approve-test-key';
  process.env.PUBLIC_URL = 'http://localhost:8080';
  process.env.IMPORT_TOKEN = 'test-import-token';
  process.env.BTCMAP_RPC_URL = 'https://example.test/rpc';
  process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), 'biz-map-site-')), 'submissions.db');
  // Set to empty (NOT delete): app.ts runs dotenv.config() on import, which
  // re-populates any *absent* key from the real .env. A present-but-empty value
  // is left alone by dotenv and read as falsy by mail.ts, so the self-test logs
  // instead of sending a real email. Deleting it would let dotenv refill it.
  process.env.SENDGRID_API_KEY = '';

  const [{ buildApp }, importRpc, db] = await Promise.all([
    import('./app'),
    import('./lib/importRpc'),
    import('./lib/db'),
  ]);

  const rpcCalls: Array<{ method: string; params: Record<string, unknown> }> = [];
  importRpc.setImportRpcFetchForTest((async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { method: string; params: Record<string, unknown> };
    rpcCalls.push({ method: body.method, params: body.params });

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-rpc-id',
        result: { ok: true },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }) as typeof fetch);

  const app = buildApp();

  try {
    const tokenResponse = await app.inject({ method: 'GET', url: '/api/token' });
    const token = tokenResponse.body;
    const decoded = jwt.decode(token, { complete: true });
    assert('GET /api/token returns non-empty token', tokenResponse.statusCode === 200 && token.length > 0);
    assertEqual('MapKit token algorithm is ES256', decoded?.header.alg, 'ES256');
    assertEqual('MapKit token kid is configured key id', decoded?.header.kid, 'TESTKEYID');

    const addBody = {
      name: 'Test Merchant',
      coordinates: { latitude: 9.65, longitude: -85.17 },
      categories: ['restaurant'],
      phone: '+506 0000 0000',
      website: 'https://example.test',
      description: 'Accepts bitcoin.',
    };
    const submitResponse = await app.inject({
      method: 'POST',
      url: '/api/submit',
      payload: addBody,
    });
    const submitJson = submitResponse.json<{ success: boolean; id: number }>();
    const pending = db.getSubmission(submitJson.id);
    assert('POST /api/submit creates a pending row', submitJson.success && pending?.status === 'pending');

    const approveResponse = await app.inject({
      method: 'GET',
      url: `/api/approve?id=${submitJson.id}&key=${process.env.APPROVE_KEY}`,
    });
    const approved = db.getSubmission(submitJson.id);
    assert('Approving add row succeeds', approveResponse.statusCode === 200 && approved?.status === 'approved');
    assertEqual('submit_place is called once for add approval', rpcCalls.length, 1);
    assertEqual('submit_place receives namespaced external_id', rpcCalls[0]?.params.external_id, `sub:${submitJson.id}`);
    assertEqual('submit_place receives bitcoin-jungle origin', rpcCalls[0]?.params.origin, 'bitcoin-jungle');

    const originalCreatedAt = approved?.created_at;
    await app.inject({
      method: 'GET',
      url: `/api/approve?id=${submitJson.id}&key=${process.env.APPROVE_KEY}`,
    });
    const afterReclick = db.getSubmission(submitJson.id);
    assertEqual('Re-clicking approve does not duplicate RPC calls', rpcCalls.length, 1);
    assertEqual('Re-clicking approve keeps same external_id', afterReclick?.btcmap_external_id, `sub:${submitJson.id}`);
    assertEqual('Re-clicking approve keeps same submission row', afterReclick?.created_at, originalCreatedAt);

    const wrongKeyResponse = await app.inject({
      method: 'GET',
      url: `/api/approve?id=${submitJson.id}&key=wrong`,
    });
    assertEqual('GET /api/approve with wrong key is rejected', wrongKeyResponse.statusCode, 403);

    const verifyResponse = await app.inject({
      method: 'POST',
      url: '/api/verify',
      payload: { target_place_id: 'btcmap-place-1' },
    });
    const verifyJson = verifyResponse.json<{ success: boolean; id: number }>();
    await app.inject({
      method: 'GET',
      url: `/api/approve?id=${verifyJson.id}&key=${process.env.APPROVE_KEY}`,
    });
    const verifySubmission = db.getSubmission(verifyJson.id);
    assert('Verify approval with unresolved ownership is handled', verifySubmission?.status === 'handled');
    assertEqual('Verify approval with unresolved ownership does not call RPC', rpcCalls.length, 1);
  } finally {
    importRpc.setImportRpcFetchForTest(null);
    await app.close();
  }

  for (const result of results) {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name}${result.pass || !result.detail ? '' : ` (${result.detail})`}`);
  }

  if (results.some((result) => !result.pass)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
