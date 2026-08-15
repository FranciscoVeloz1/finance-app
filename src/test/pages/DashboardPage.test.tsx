import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../../pages/DashboardPage';
import { configureHttp } from '../../api/http';
import { ToastProvider } from '../../components/feedback/Toast';

const marchSummary = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../api/fixtures/march-summary.json'), 'utf8'),
) as unknown;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/?periodo=4bc02a91-6ad8-4627-8ab9-01c3ee0a1003']}>
          <DashboardPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the March expected savings from the summary fixture', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/transactions')) {
          return jsonResponse({
            transactions: [
              {
                id: 'e8c54f93-3b6d-4c28-8e8b-4fcd709e4005',
                periodId: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003',
                type: 'INCOME',
                accountId: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001',
                counterpartyAccountId: null,
                categoryId: '9bde3079-486b-44f1-97d5-49a0d3e91001',
                occurredOn: '2026-03-01',
                amount: '10000.00',
                concept: 'Ingreso marzo',
                notes: null,
                isHidden: false,
                planItemId: 'd0bf673e-d70c-4a8d-9ed2-7418f2073003',
              },
            ],
            nextCursor: null,
          });
        }
        if (url.includes('/summary')) {
          return jsonResponse(marchSummary);
        }
        if (url.includes('/finance/periods')) {
          return jsonResponse({
            periods: [
              {
                id: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003',
                year: 2026,
                month: 3,
                label: 'Marzo 2026',
                classification: 'CURRENT',
                version: 1,
                summary: {
                  expectedIncome: '10000.00',
                  receivedIncome: '10000.00',
                  expectedExpense: '19400.00',
                  actualExpense: '10850.00',
                  expectedSavings: '29650.00',
                  actualSavings: '39650.00',
                  cashRemaining: '750.00',
                  creditAvailable: '46500.00',
                  projectedCreditAvailable: '46500.00',
                },
              },
            ],
          });
        }
        if (url.includes('/finance/accounts')) {
          return jsonResponse({
            periodId: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003',
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
                derivedBalance: '38900.00',
              },
            ],
          });
        }
        return jsonResponse({ error: 'NOT_FOUND', message: 'no' }, 404);
      }),
    );

    renderDashboard();
    expect(await screen.findAllByText(/29,650\.00/)).not.toHaveLength(0);
  });
});
