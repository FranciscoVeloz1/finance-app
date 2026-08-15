import { afterEach, describe, expect, it, vi } from 'vitest';
import { listAccounts, listAccountsUrl } from '../../api/finance';
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
});
