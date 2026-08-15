import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { configureHttp } from '../../api/http';
import { ToastProvider } from '../../components/feedback/Toast';
import { DashboardPage } from '../../pages/DashboardPage';
import { mapTransaction } from '../../utils/map-finance';

const marchSummary = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../api/fixtures/march-summary.json'), 'utf8'),
) as {
  summary: { totals: { actualExpense: string } };
  suggestions: unknown[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('credit Klar double count', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps credit payments, Klar flows and cash withdrawals out of actual expense', () => {
    const payment = mapTransaction(
      {
        id: 'e8c54f93-3b6d-4c28-8e8b-4fcd709e4014',
        periodId: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1004',
        type: 'CREDIT_PAYMENT',
        accountId: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001',
        counterpartyAccountId: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1003',
        categoryId: '9bde3079-486b-44f1-97d5-49a0d3e91007',
        occurredOn: '2026-04-05',
        amount: '3500.00',
        concept: 'Pago TDC marzo',
        notes: null,
        isHidden: false,
        planItemId: null,
      },
      [],
    );
    expect(payment.kind).toBe('credit-payment');
    expect(payment.kind).not.toBe('expense');
  });

  it('renders April-style actual expense of zero and dismisses suggestions locally', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });

    const summary = structuredClone(marchSummary);
    summary.summary.totals.actualExpense = '0.00';

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/transactions')) {
        return jsonResponse({
          transactions: [
            {
              id: 'e8c54f93-3b6d-4c28-8e8b-4fcd709e4014',
              periodId: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1004',
              type: 'CREDIT_PAYMENT',
              accountId: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001',
              counterpartyAccountId: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1003',
              categoryId: '9bde3079-486b-44f1-97d5-49a0d3e91007',
              occurredOn: '2026-04-05',
              amount: '3500.00',
              concept: 'Pago TDC marzo',
              notes: null,
              isHidden: false,
              planItemId: null,
            },
          ],
          nextCursor: null,
        });
      }
      if (url.includes('/summary')) {
        return jsonResponse(summary);
      }
      if (url.includes('/finance/periods')) {
        return jsonResponse({
          periods: [
            {
              id: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1004',
              year: 2026,
              month: 4,
              label: 'Abril 2026',
              classification: 'FUTURE',
              version: 1,
              summary: {
                expectedIncome: '10000.00',
                receivedIncome: '0.00',
                expectedExpense: '10350.00',
                actualExpense: '0.00',
                expectedSavings: '1650.00',
                actualSavings: '0.00',
                cashRemaining: '0.00',
                creditAvailable: '50000.00',
                projectedCreditAvailable: '50000.00',
              },
            },
          ],
        });
      }
      if (url.includes('/finance/accounts')) {
        return jsonResponse({
          periodId: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1004',
          accounts: [
            {
              id: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001',
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
              derivedBalance: '900.00',
            },
          ],
        });
      }
      return jsonResponse({ error: 'NOT_FOUND', message: url }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/?periodo=4bc02a91-6ad8-4627-8ab9-01c3ee0a1004']}>
            <DashboardPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    const gasto = await screen.findByRole('region', { name: /gasto del periodo/i });
    expect(await within(gasto).findByText('Real')).toBeInTheDocument();
    const realColumn = within(gasto).getByText('Real').closest('div');
    expect(realColumn).not.toBeNull();
    expect(within(realColumn as HTMLElement).getAllByText(/0\.00/).length).toBeGreaterThan(0);
    expect(within(gasto).queryByText(/3[,.]500/)).toBeNull();

    await user.click(await screen.findByText(/sugerencias informativas/i));
    const callsBeforeDismiss = fetchMock.mock.calls.length;
    await user.click(screen.getAllByRole('button', { name: /descartar/i })[0]!);
    const later = fetchMock.mock.calls.slice(callsBeforeDismiss);
    expect(
      later.some((call) => {
        const method = String((call[1] as RequestInit | undefined)?.method ?? 'GET').toUpperCase();
        return method !== 'GET';
      }),
    ).toBe(false);
  });
});
