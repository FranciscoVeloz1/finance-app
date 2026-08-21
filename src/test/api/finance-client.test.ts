import { afterEach, describe, expect, it, vi } from 'vitest';
import { listAccounts, listAccountsUrl } from '../../api/finance';
import { createAccount, createPeriod, deactivateAccount } from '../../api/finance-mutations';
import { configureHttp } from '../../api/http';
import { ApiError } from '../../api/types';

describe('finance client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes includeBalances=true with a canonical period UUID', () => {
    expect(
      listAccountsUrl({
        periodId: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003',
        includeBalances: true,
      }),
    ).toBe(
      '/api/v1/finance/accounts?periodId=4bc02a91-6ad8-4627-8ab9-01c3ee0a1003&includeBalances=true',
    );
  });

  it('rejects aliases and non-v4 ids before fetch', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      listAccounts({ periodId: '11111111-1111-1111-8111-111111111111', includeBalances: true }),
    ).rejects.toBeInstanceOf(ApiError);
    await expect(
      listAccounts({ period_id: '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003' } as never),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs a period body to /api/v1/finance/periods', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          period: {
            id: '6e8f0c12-4b3a-4d21-9f10-7c5e2a91b001',
            year: 2026,
            month: 8,
            label: null,
            notes: null,
            version: 1,
            createdAt: '2026-08-18T00:00:00.000Z',
            updatedAt: '2026-08-18T00:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await createPeriod({ year: 2026, month: 8 });

    expect(result.period.id).toBe('6e8f0c12-4b3a-4d21-9f10-7c5e2a91b001');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/finance/periods');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ year: 2026, month: 8 });
  });

  it('POSTs a create-account body and deactivates with 204', async () => {
    configureHttp({
      getAccessToken: () => 't',
      refreshSession: async () => 't',
      onSessionExpired: () => {},
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/deactivate')) {
        return new Response(null, { status: 204 });
      }
      return new Response(
        JSON.stringify({
          account: {
            id: '7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001',
            name: 'Nómina',
            type: 'DEBIT',
            status: 'ACTIVE',
            initialBalance: '100.00',
            creditLimit: null,
            openingDebt: null,
            statementDay: null,
            paymentDay: null,
            includeInProjections: true,
            startsOn: '2026-08-01',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const created = await createAccount({
      name: 'Nómina',
      type: 'DEBIT',
      initialBalance: '100.00',
      startsOn: '2026-08-01',
    });
    expect(created.account.name).toBe('Nómina');
    await expect(deactivateAccount(created.account.id)).resolves.toBeUndefined();
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      '/api/v1/finance/accounts/7f5c8b0d-771c-4d4c-8cbd-7e7f318f1001/deactivate',
    );
  });
});
