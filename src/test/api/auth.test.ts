import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMe, login, refreshAuth } from '../../api/auth';
import { configureHttp } from '../../api/http';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('auth api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('login user has no role; me.user does', async () => {
    configureHttp({
      getAccessToken: () => 'token',
      refreshSession: async () => 'token',
      onSessionExpired: () => {},
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/auth/login')) {
          return jsonResponse({
            accessToken: 'a',
            refreshToken: 'r',
            user: { id: '11111111-1111-4111-8111-111111111111', email: 'a@b.c', name: 'A' },
          });
        }
        if (url.includes('/auth/me')) {
          return jsonResponse({
            user: {
              id: '11111111-1111-4111-8111-111111111111',
              email: 'a@b.c',
              name: 'A',
              role: 'READ_ONLY',
            },
          });
        }
        return jsonResponse({ error: 'NOT_FOUND', message: 'no' }, 404);
      }),
    );

    const logged = await login('a@b.c', 'x');
    expect(logged.user).not.toHaveProperty('role');
    const me = await getMe();
    expect(me.user.role).toBe('READ_ONLY');
  });

  it('refresh returns only tokens', async () => {
    configureHttp({
      getAccessToken: () => null,
      refreshSession: async () => 'token',
      onSessionExpired: () => {},
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ accessToken: 'a2', refreshToken: 'r2' })),
    );
    const tokens = await refreshAuth('r1');
    expect(tokens).toEqual({ accessToken: 'a2', refreshToken: 'r2' });
    expect(tokens).not.toHaveProperty('user');
  });
});
