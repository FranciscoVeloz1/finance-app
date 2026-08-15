import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getMe, login, logout, refreshAuth, type MeUser } from '../api/auth';
import { configureHttp } from '../api/http';
import { queryClient } from '../api/query-client';
import { ApiError } from '../api/types';
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from './session-storage';
import { SessionContext, type SessionApi, type SessionStatus } from './useSession';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('bootstrapping');
  const [user, setUser] = useState<MeUser | null>(null);
  const [expired, setExpired] = useState(false);
  const accessTokenRef = useRef<string | null>(null);

  const clearLocalSession = useCallback((nextExpired: boolean) => {
    accessTokenRef.current = null;
    clearRefreshToken();
    queryClient.clear();
    setUser(null);
    setExpired(nextExpired);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    configureHttp({
      getAccessToken: () => {
        return accessTokenRef.current;
      },
      refreshSession: async () => {
        const stored = readRefreshToken();
        if (stored === null) {
          throw new ApiError(401, { error: 'UNAUTHORIZED', message: 'Missing refresh token' });
        }
        const tokens = await refreshAuth(stored);
        accessTokenRef.current = tokens.accessToken;
        writeRefreshToken(tokens.refreshToken);
        return tokens.accessToken;
      },
      onSessionExpired: () => {
        clearLocalSession(true);
      },
    });

    const stored = readRefreshToken();
    if (stored === null) {
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const tokens = await refreshAuth(stored);
        if (cancelled) {
          return;
        }
        accessTokenRef.current = tokens.accessToken;
        writeRefreshToken(tokens.refreshToken);
        const me = await getMe();
        if (cancelled) {
          return;
        }
        setUser(me.user);
        setExpired(false);
        setStatus('authenticated');
      } catch {
        if (!cancelled) {
          clearLocalSession(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearLocalSession]);

  const signIn = useCallback(async (nextIdentifier: string, credential: string) => {
    if (nextIdentifier.trim().length === 0 || credential.length === 0) {
      throw new Error('Revisa tu correo y contraseña.');
    }

    try {
      const result = await login(nextIdentifier.trim(), credential);
      accessTokenRef.current = result.accessToken;
      writeRefreshToken(result.refreshToken);
      const me = await getMe();
      setUser(me.user);
      setExpired(false);
      setStatus('authenticated');
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 0) {
        throw new Error(cause.message);
      }
      throw new Error('Revisa tu correo y contraseña.');
    }
  }, []);

  const signOut = useCallback(() => {
    const refresh = readRefreshToken();
    if (refresh !== null) {
      void logout(refresh).catch(() => {});
    }
    clearLocalSession(false);
  }, [clearLocalSession]);

  const expire = useCallback(() => {
    clearLocalSession(true);
  }, [clearLocalSession]);

  const api = useMemo<SessionApi>(() => {
    return {
      status,
      identifier: user?.email ?? null,
      user,
      expired,
      signIn,
      signOut,
      expire,
    };
  }, [status, user, expired, signIn, signOut, expire]);

  return <SessionContext value={api}>{children}</SessionContext>;
}
