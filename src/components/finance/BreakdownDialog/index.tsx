import type { Movement } from '../../../types/finance';
import { formatCalendarDate } from '../../../utils/dates';
import { Amount } from '../Amount';
import { StatusBadge } from '../StatusBadge';
import { Dialog } from '../../forms/Dialog';
import { EmptyState } from '../../feedback/EmptyState';
import styles from './BreakdownDialog.module.css';

interface BreakdownDialogProps {
  open: boolean;
  title: string;
  description?: string;
  movements: Movement[];
  onClose: () => void;
}

/** Every aggregate in the app can open the records that explain it. */
export function BreakdownDialog({
  open,
  title,
  description,
  movements,
  onClose,
}: BreakdownDialogProps) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onClose}>
      {movements.length === 0 ? (
        <EmptyState
          compact
          title="Sin registros"
          description="Este total todavía no tiene movimientos que lo expliquen."
        />
      ) : (
        <ul className={styles.list}>
          {movements.map((movement) => {
            return (
              <li key={movement.id} className={styles.row}>
                <div className={styles.text}>
                  <span className={styles.concept}>{movement.concept}</span>
                  <span className={styles.meta}>
                    {formatCalendarDate(movement.date)} · {movement.accountLabel}
                  </span>
                </div>
                <div className={styles.right}>
                  <Amount value={movement.amount} size="derived" tone="neutral" />
                  <StatusBadge
                    state={movement.kind === 'transfer' ? 'transfer' : movement.status}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Dialog>
  );
}
