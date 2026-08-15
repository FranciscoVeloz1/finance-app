import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a boolean, not to a continuous width, so a resize only
 * re-renders when the breakpoint actually flips.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', onChange);

    return () => {
      list.removeEventListener('change', onChange);
    };
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const MOBILE_QUERY = '(max-width: 767px)';
export const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
