import { useEffect, useRef, useState } from 'react';
import { classNames } from '../../../utils/classNames';
import { Button } from '../Button';
import { MoreIcon } from '../../icons';
import styles from './RowMenu.module.css';

export interface RowMenuAction {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface RowMenuProps {
  label: string;
  actions: RowMenuAction[];
}

/** The `⋯` menu shared by accounts, categories and recurring rules. */
export function RowMenu({ label, actions }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node) !== true) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div className={styles.container} ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Acciones de ${label}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((current) => {
            return !current;
          });
        }}
      >
        <MoreIcon size={16} />
      </Button>

      {open ? (
        <ul className={styles.menu} role="menu">
          {actions.map((action) => {
            return (
              <li key={action.id} role="none">
                <button
                  className={classNames(styles.item, action.destructive === true && styles.danger)}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    action.onSelect();
                  }}
                >
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
