import { ApiError, NETWORK_ERROR_MESSAGE, type ApiErrorBody } from './types';

export type HttpRequestInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
};

export interface HttpClientDeps {
  getAccessToken: () => string | null;
  refreshSession: () => Promise<string>;
  onSessionExpired: () => void;
}

function apiOrigin(): string {
  const origin = import.meta.env.VITE_API_BASE_URL;
  return typeof origin === 'string' ? origin.replace(/\/$/, '') : '';
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (text.length === 0) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function createHttpClient(deps: HttpClientDeps) {
  let refreshLock: Promise<string> | null = null;

  const refreshOnce = (): Promise<string> => {
    if (refreshLock === null) {
      refreshLock = deps.refreshSession().finally(() => {
        refreshLock = null;
      });
    }

    return refreshLock;
  };

  const execute = async <T>(path: string, init: HttpRequestInit = {}, didRetry: boolean): Promise<T> => {
    const headers: Record<string, string> = { ...init.headers };
    if (init.body !== undefined && headers['Content-Type'] === undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (!init.skipAuth) {
      const token = deps.getAccessToken();
      if (token !== null) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const { skipAuth, skipRefreshRetry, headers: _headers, ...rest } = init;
    void _headers;

    let res: Response;
    try {
      res = await fetch(`${apiOrigin()}${path}`, { ...rest, headers });
    } catch {
      throw new ApiError(0, { error: 'NETWORK_ERROR', message: NETWORK_ERROR_MESSAGE });
    }

    if (res.status !== 401) {
      if (!res.ok) {
        throw await ApiError.fromResponse(res);
      }

      return parseBody<T>(res);
    }

    if (skipAuth || skipRefreshRetry || didRetry) {
      if (!skipAuth && !skipRefreshRetry) {
        deps.onSessionExpired();
      }
      throw await ApiError.fromResponse(res);
    }

    try {
      await refreshOnce();
    } catch (cause) {
      deps.onSessionExpired();
      if (cause instanceof ApiError) {
        throw cause;
      }
      throw new ApiError(401, { error: 'UNAUTHORIZED', message: 'Session expired' } satisfies ApiErrorBody);
    }

    return execute<T>(path, init, true);
  };

  return {
    request<T>(path: string, init?: HttpRequestInit): Promise<T> {
      return execute<T>(path, init ?? {}, false);
    },
  };
}

const unsetDeps: HttpClientDeps = {
  getAccessToken: () => {
    return null;
  },
  refreshSession: async () => {
    throw new ApiError(401, { error: 'UNAUTHORIZED', message: 'Not configured' });
  },
  onSessionExpired: () => {},
};

let client = createHttpClient(unsetDeps);

export function configureHttp(deps: HttpClientDeps): void {
  client = createHttpClient(deps);
}

export function request<T>(path: string, init?: HttpRequestInit): Promise<T> {
  return client.request<T>(path, init);
}
