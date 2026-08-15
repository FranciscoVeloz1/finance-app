import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/types';
import { configureHttp, createHttpClient } from '../../api/http';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('http client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retries a 401 exactly once after refresh', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'UNAUTHORIZED', message: 'expired' }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const refreshSession = vi.fn().mockResolvedValue('new-token');
    const client = createHttpClient({
      getAccessToken: () => 'old-token',
      refreshSession,
      onSessionExpired: vi.fn(),
    });

    await expect(client.request('/api/v1/finance/periods')).resolves.toEqual({ ok: true });
    expect(refreshSession).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('expires the session when the retry still returns 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'UNAUTHORIZED', message: 'expired' }, 401)),
    );
    const onSessionExpired = vi.fn();
    const client = createHttpClient({
      getAccessToken: () => 'old-token',
      refreshSession: vi.fn().mockResolvedValue('new-token'),
      onSessionExpired,
    });

    await expect(client.request('/api/v1/finance/periods')).rejects.toBeInstanceOf(ApiError);
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it('propagates 404 codes without retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'NOT_FOUND', message: 'missing' }, 404)),
    );
    const refreshSession = vi.fn();
    const client = createHttpClient({
      getAccessToken: () => 'token',
      refreshSession,
      onSessionExpired: vi.fn(),
    });

    const error = await client.request('/api/v1/finance/periods/x').catch((cause) => cause);
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' });
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('maps a network failure to the CORS copy', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const client = createHttpClient({
      getAccessToken: () => null,
      refreshSession: vi.fn(),
      onSessionExpired: vi.fn(),
    });

    await expect(client.request('/api/v1/finance/periods', { skipAuth: true })).rejects.toMatchObject({
      status: 0,
      message: 'No se pudo conectar con el servidor',
    });
  });

  it('exposes configureHttp for the auth provider', () => {
    expect(typeof configureHttp).toBe('function');
  });
});
