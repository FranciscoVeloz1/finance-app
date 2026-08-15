import { createContext, useContext } from 'react';
import type { BannerTone } from '../components/feedback/Banner';

export interface Toast {
  id: string;
  tone: BannerTone;
  message: string;
}

export interface ToastApi {
  toasts: Toast[];
  notify: (tone: BannerTone, message: string) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);

  if (api === null) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }

  return api;
}
