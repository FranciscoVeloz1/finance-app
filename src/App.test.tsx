import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { queryClient } from './api/query-client';
import { writeRefreshToken } from './auth/session-storage';
import { configureHttp } from './api/http';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('App routes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    queryClient.clear();
    sessionStorage.clear();
    writeRefreshToken('refresh-token');
    configureHttp({
      getAccessToken: () => 'access-token',
      refreshSession: async () => 'access-token',
      onSessionExpired: () => {},
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/auth/refresh')) {
          return jsonResponse({ accessToken: 'access-token', refreshToken: 'refresh-token' });
        }
        if (url.includes('/auth/me')) {
          return jsonResponse({
            user: {
              id: '11111111-1111-4111-8111-111111111111',
              email: 'persona@example.com',
              name: 'Persona',
              role: 'READ_ONLY',
            },
          });
        }
        if (url.includes('/finance/periods') && url.includes('/summary')) {
          return jsonResponse({ error: 'NOT_FOUND', message: 'Period not found' }, 404);
        }
        if (url.includes('/finance/periods')) {
          return jsonResponse({ periods: [] });
        }
        if (url.includes('/finance/accounts')) {
          return jsonResponse({ accounts: [] });
        }
        if (url.includes('/finance/transactions')) {
          return jsonResponse({ transactions: [], nextCursor: null });
        }
        return jsonResponse({ error: 'NOT_FOUND', message: 'no' }, 404);
      }),
    );
  });

  it('shows the login screen when there is no session', async () => {
    sessionStorage.clear();
    renderAt('/login');

    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('renders the dashboard behind the auth guard', async () => {
    renderAt('/');

    expect(await screen.findByRole('link', { name: /saltar al contenido/i })).toBeInTheDocument();
    expect(await screen.findByRole('navigation', { name: /principal/i })).toBeInTheDocument();
  });

  it.each([
    ['/mes', /periodo|marzo|detalle/i],
    ['/cuentas', /cuentas/i],
    ['/cuentas/acc-credit', /crédito|tarjeta/i],
    ['/configuracion', /configuración/i],
    ['/configuracion/categorias', /categorías/i],
    ['/configuracion/reglas', /reglas recurrentes/i],
  ])('renders %s without crashing', async (path, heading) => {
    renderAt(path);

    expect(await screen.findByRole('heading', { name: heading, level: 1 })).toBeInTheDocument();
  });
});
