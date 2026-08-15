import type { ReactNode } from 'react';
import type { Movement } from '../../../types/finance';
import { classNames } from '../../../utils/classNames';
import { formatCalendarDate } from '../../../utils/dates';
import { Amount } from '../Amount';
import { PlainBadge, StatusBadge } from '../StatusBadge';
import { Button } from '../../forms/Button';
import { MoreIcon } from '../../icons';
import styles from './ItemList.module.css';

interface ItemListProps {
  items: Movement[];
  emptyState: ReactNode;
  /** Rendered under the concept, e.g. a paused or extraordinary marker. */
  markerOf?: (item: Movement) => string | null;
  onEdit: (item: Movement) => void;
}

/**
 * The shared row grammar for services, budget slots, extras, credit lists and
 * fund movements. One row, one meaning, whatever the section.
 */
export function ItemList({ items, emptyState, markerOf, onEdit }: ItemListProps) {
  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const transfer = item.kind === 'transfer';
        const marker = markerOf?.(item) ?? null;

        return (
          <li
            key={item.id}
            className={classNames(styles.row, item.status === 'cancelled' && styles.dimmed)}
          >
            <div className={styles.text}>
              <span className={styles.concept}>
                {item.concept}
                {item.overridden === true ? (
                  <PlainBadge tone="override">Override</PlainBadge>
                ) : null}
                {marker === null ? null : <PlainBadge tone="muted">{marker}</PlainBadge>}
              </span>
              <span className={styles.meta}>
                {formatCalendarDate(item.date)} · {item.accountLabel}
              </span>
            </div>

            <div className={styles.right}>
              <Amount value={item.amount} size="derived" tone="neutral" />
              <StatusBadge state={transfer ? 'transfer' : item.status} />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Acciones de ${item.concept}`}
                onClick={() => {
                  onEdit(item);
                }}
              >
                <MoreIcon size={16} />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
