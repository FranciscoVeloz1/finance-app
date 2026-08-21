import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AccountsPage } from '../../pages/AccountsPage';
import { configureHttp } from '../../api/http';
import { ToastProvider } from '../../components/feedback/Toast';

const DEBIT_ID = '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderAccounts() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/cuentas']}>
          <AccountsPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('AccountsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads accounts from the API and deactivates through POST /deactivate', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/deactivate')) {
        return new Response(null, { status: 204 });
      }
      if (url.includes('/finance/accounts')) {
        return jsonResponse({
          accounts: [
            {
              id: DEBIT_ID,
              name: 'Débito Principal',
              type: 'DEBIT',
              status: 'ACTIVE',
              initialBalance: '20000.00',
              creditLimit: null,
              openingDebt: null,
              statementDay: null,
              paymentDay: null,
              includeInProjections: true,
              startsOn: '2026-01-01',
              derivedBalance: '21350.00',
            },
          ],
        });
      }
      if (url.includes('/finance/periods')) {
        return jsonResponse({ periods: [] });
      }
      void init;
      return jsonResponse({ error: 'NOT_FOUND', message: 'no' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAccounts();
    expect(await screen.findByText('Débito Principal')).toBeInTheDocument();
    expect(screen.queryByText('Cuenta de nómina')).toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Acciones de Débito Principal' }));
    await user.click(screen.getByRole('menuitem', { name: 'Desactivar' }));
    await user.click(screen.getByRole('button', { name: 'Desactivar' }));

    expect(await screen.findByText('Cuenta desactivada.')).toBeInTheDocument();
    const deactivateCall = fetchMock.mock.calls.find((call) => {
      return String(call[0]).includes('/deactivate');
    });
    expect(deactivateCall).toBeDefined();
    expect((deactivateCall?.[1] as RequestInit | undefined)?.method).toBe('POST');
  });
});
