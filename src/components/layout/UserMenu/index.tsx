import { useEffect, useRef, useState } from 'react';
import { useSession } from '../../../auth/useSession';
import { Button } from '../../forms/Button';
import { ChevronDownIcon, LogoutIcon } from '../../icons';
import styles from './UserMenu.module.css';

function initialsOf(identifier: string): string {
  const trimmed = identifier.trim();

  if (trimmed.length === 0) {
    return '?';
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { identifier, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node) === false) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <Button
        variant="ghost"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((current) => {
            return !current;
          });
        }}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initialsOf(identifier ?? '')}
        </span>
        <span className="visually-hidden">Menú de usuario</span>
        <ChevronDownIcon size={16} />
      </Button>

      {open ? (
        <div className={styles.menu} role="menu">
          <p className={styles.identifier}>{identifier}</p>
          <Button
            variant="ghost"
            role="menuitem"
            className={styles.item}
            icon={<LogoutIcon size={16} />}
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      ) : null}
    </div>
  );
}
