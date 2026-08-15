import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContext, type Toast } from '../../../hooks/useToast';
import type { BannerTone } from '../Banner';
import { Button } from '../../forms/Button';
import { CloseIcon } from '../../icons';
import { classNames } from '../../../utils/classNames';
import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => {
      return current.filter((toast) => {
        return toast.id !== id;
      });
    });
  }, []);

  const notify = useCallback(
    (tone: BannerTone, message: string) => {
      const id = crypto.randomUUID();
      setToasts((current) => {
        return [...current, { id, tone, message }];
      });
      window.setTimeout(() => {
        dismiss(id);
      }, AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => {
    return { toasts, notify, dismiss };
  }, [toasts, notify, dismiss]);

  return (
    <ToastContext value={api}>
      {children}
      {/* Polite live region: confirmations are announced without stealing focus. */}
      <div className={styles.viewport} aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          return (
            <div key={toast.id} className={classNames(styles.toast, styles[toast.tone])}>
              <span className={styles.message}>{toast.message}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Descartar notificación"
                onClick={() => {
                  dismiss(toast.id);
                }}
              >
                <CloseIcon size={16} />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}
