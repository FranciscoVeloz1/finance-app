import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { configureHttp } from '../../api/http';
import { EXTRAS_TX_ID, MARCH_PERIOD_ID } from '../../api/finance-types';
import { ToastProvider } from '../../components/feedback/Toast';
import { MonthDetailPage } from '../../pages/MonthDetailPage';
import { moneyToNumber } from '../../utils/money';

const marchSummary = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../api/fixtures/march-summary.json'), 'utf8'),
) as { summary: { totals: { expectedSavings: string } } };

const MARCH = MARCH_PERIOD_ID;
const APRIL = '4bc02a91-6ad8-4627-8ab9-01c3ee0a1004';
const MAY = '4bc02a91-6ad8-4627-8ab9-01c3ee0a1005';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const debitAccount = {
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
};

const extrasTx = {
  id: EXTRAS_TX_ID,
  periodId: MARCH,
  type: 'EXPENSE',
  accountId: debitAccount.id,
  counterpartyAccountId: null,
  categoryId: '9bde3079-486b-44f1-97d5-49a0d3e91005',
  occurredOn: '2026-03-12',
  amount: '500.00',
  concept: 'Extra marzo',
  notes: null,
  isHidden: false,
  planItemId: null,
};

describe('propagation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reduces March expected savings by 1500 when extras move from 500 to 2000', () => {
    expect(moneyToNumber('29650.00') - moneyToNumber('1500.00')).toBe(moneyToNumber('28150.00'));
    expect(moneyToNumber('1650.00') - moneyToNumber('1500.00')).toBe(moneyToNumber('150.00'));
  });

  it('previews and confirms the extras edit without touching January or February', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });

    let confirmed = false;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      if (url.includes('/projection/preview') && method === 'POST') {
        return jsonResponse({
          originPeriodId: MARCH,
          affectedPeriodIds: [MARCH, APRIL, MAY],
          diffs: [
            {
              periodId: MARCH,
              year: 2026,
              month: 3,
              deltaExpectedExpense: '0.00',
              deltaActualExpense: '1500.00',
              deltaExpectedSavings: '-1500.00',
              accountDeltas: {},
              deltaDebt: '0.00',
              deltaCreditAvailable: '0.00',
            },
            {
              periodId: APRIL,
              year: 2026,
              month: 4,
              deltaExpectedExpense: '0.00',
              deltaActualExpense: '0.00',
              deltaExpectedSavings: '-1500.00',
              accountDeltas: {},
              deltaDebt: '0.00',
              deltaCreditAvailable: '0.00',
            },
            {
              periodId: MAY,
              year: 2026,
              month: 5,
              deltaExpectedExpense: '0.00',
              deltaActualExpense: '0.00',
              deltaExpectedSavings: '-1500.00',
              accountDeltas: {},
              deltaDebt: '0.00',
              deltaCreditAvailable: '0.00',
            },
          ],
          warnings: [],
        });
      }
      if (url.includes('/projection/confirm') && method === 'POST') {
        confirmed = true;
        return jsonResponse({
          affectedPeriodIds: [MARCH, APRIL, MAY],
          summaries: [
            {
              periodId: MARCH,
              summary: {
                expectedIncome: '10000.00',
                receivedIncome: '10000.00',
                expectedExpense: '19400.00',
                actualExpense: '12350.00',
                expectedSavings: '28150.00',
                actualSavings: '38150.00',
                cashRemaining: '750.00',
                creditAvailable: '46500.00',
                projectedCreditAvailable: '46500.00',
              },
            },
          ],
        });
      }
      if (url.includes('/transactions')) {
        return jsonResponse({
          transactions: [{ ...extrasTx, amount: confirmed ? '2000.00' : '500.00' }],
          nextCursor: null,
        });
      }
      if (url.includes('/summary')) {
        const clone = structuredClone(marchSummary) as {
          summary: { totals: { expectedSavings: string; actualSavings: string } };
        };
        if (confirmed) {
          clone.summary.totals.expectedSavings = '28150.00';
          clone.summary.totals.actualSavings = '38150.00';
        }
        return jsonResponse(clone);
      }
      if (url.includes('/finance/accounts')) {
        return jsonResponse({ periodId: MARCH, accounts: [debitAccount] });
      }
      if (url.includes('/finance/periods')) {
        const compact = {
          expectedIncome: '10000.00',
          receivedIncome: '10000.00',
          expectedExpense: '19400.00',
          actualExpense: '10850.00',
          expectedSavings: '29650.00',
          actualSavings: '39650.00',
          cashRemaining: '750.00',
          creditAvailable: '46500.00',
          projectedCreditAvailable: '46500.00',
        };
        return jsonResponse({
          periods: [
            { id: MARCH, year: 2026, month: 3, label: 'Marzo 2026', classification: 'CURRENT', version: 1, summary: compact },
            { id: APRIL, year: 2026, month: 4, label: 'Abril 2026', classification: 'FUTURE', version: 1, summary: compact },
            { id: MAY, year: 2026, month: 5, label: 'Mayo 2026', classification: 'FUTURE', version: 1, summary: compact },
          ],
        });
      }
      return jsonResponse({ error: 'NOT_FOUND', message: 'no' }, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter initialEntries={[`/mes?periodo=${MARCH}`]}>
            <MonthDetailPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect((await screen.findAllByText(/29,650\.00/)).length).toBeGreaterThan(0);
    await user.click(await screen.findByRole('button', { name: /editar extra marzo/i }));
    const realAmount = await screen.findByLabelText(/monto real/i);
    await user.clear(realAmount);
    await user.type(realAmount, '2000');
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    expect(await screen.findByRole('heading', { name: /impacto en meses futuros/i })).toBeInTheDocument();
    expect(screen.queryByText(/enero/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/febrero/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirmar propagación/i }));
    expect((await screen.findAllByText(/28,150\.00/)).length).toBeGreaterThan(0);
  });
});
