import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './useSession';
import { SessionBootstrap } from '../components/layout/SessionBootstrap';

/**
 * Financial data must never paint before the session is resolved, so bootstrap
 * renders a full-screen shell skeleton instead of the route.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const location = useLocation();

  if (status === 'bootstrapping') {
    return <SessionBootstrap />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
