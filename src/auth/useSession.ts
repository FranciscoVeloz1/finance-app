import { createContext, useContext } from 'react';
import type { MeUser } from '../api/auth';

export type SessionStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

export interface SessionApi {
  status: SessionStatus;
  identifier: string | null;
  user: MeUser | null;
  expired: boolean;
  signIn: (identifier: string, credential: string) => Promise<void>;
  signOut: () => void;
  expire: () => void;
}

export const SessionContext = createContext<SessionApi | null>(null);

export function useSession(): SessionApi {
  const api = useContext(SessionContext);

  if (api === null) {
    throw new Error('useSession must be used inside <AuthProvider>.');
  }

  return api;
}
