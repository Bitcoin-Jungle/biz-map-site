type FetchLike = typeof fetch;

interface RpcResponse<T> {
  jsonrpc: '2.0';
  id: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type SubmitPlaceParams = Record<string, unknown> & {
  external_id: string;
};

let fetchOverride: FetchLike | null = null;
let rpcId = 0;

export function setImportRpcFetchForTest(fetchImpl: FetchLike | null): void {
  fetchOverride = fetchImpl;
}

async function callRpc<T>(
  method: string,
  params: Record<string, unknown>,
  fetchImpl: FetchLike = fetchOverride ?? fetch,
): Promise<T> {
  const token = process.env.IMPORT_TOKEN;
  if (!token) {
    throw new Error('IMPORT_TOKEN not configured');
  }

  const url = process.env.BTCMAP_RPC_URL ?? 'https://api.btcmap.org/rpc';
  const id = `bj-${Date.now()}-${++rpcId}`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`BTC Map RPC HTTP ${response.status}`);
  }

  const body = (await response.json()) as RpcResponse<T>;
  if (body.error) {
    throw new Error(`BTC Map RPC ${method} failed: ${body.error.message}`);
  }

  return body.result as T;
}

export function submitPlace<T = unknown>(
  params: SubmitPlaceParams,
  fetchImpl?: FetchLike,
): Promise<T> {
  return callRpc<T>(
    'submit_place',
    {
      ...params,
      origin: 'bitcoin-jungle',
    },
    fetchImpl,
  );
}

export function getSubmittedPlace<T = unknown>(
  externalId: string,
  fetchImpl?: FetchLike,
): Promise<T> {
  return callRpc<T>('get_submitted_place', { origin: 'bitcoin-jungle', external_id: externalId }, fetchImpl);
}

export function revokeSubmittedPlace<T = unknown>(
  externalId: string,
  fetchImpl?: FetchLike,
): Promise<T> {
  return callRpc<T>('revoke_submitted_place', { origin: 'bitcoin-jungle', external_id: externalId }, fetchImpl);
}
