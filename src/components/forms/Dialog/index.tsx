import { useEffect, useRef, type ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import { Button } from '../Button';
import { CloseIcon } from '../../icons';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** Blocks Escape and backdrop dismissal while a confirmation is in flight. */
  busy?: boolean;
  size?: 'md' | 'lg';
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Built on the native <dialog>: focus trapping, Escape handling, inertness of
 * the page behind and the top layer come from the platform instead of a
 * hand-rolled implementation.
 */
export function Dialog({
  open,
  title,
  description,
  onClose,
  busy = false,
  size = 'md',
  footer,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialogRef.current;

    if (element === null) {
      return;
    }

    if (open && !element.open) {
      element.showModal();
    }

    if (!open && element.open) {
      element.close();
    }
  }, [open]);

  return (
    // The click handler only implements backdrop dismissal, which the platform
    // exposes through the dialog element itself; Escape covers the keyboard.
    /* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={dialogRef}
      className={classNames(styles.dialog, styles[size])}
      aria-busy={busy || undefined}
      onCancel={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // The backdrop is part of the dialog box, so a click outside the panel
        // lands on the dialog element itself.
        if (busy) {
          return;
        }

        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {description === undefined ? null : (
              <p className={styles.description}>{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar"
            disabled={busy}
            onClick={onClose}
          >
            <CloseIcon size={18} />
          </Button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer === undefined ? null : <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
