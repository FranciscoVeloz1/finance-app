import { classNames } from '../../../utils/classNames';
import type { PlanVsRealTotals, ZoneStatus } from '../../../types/finance';
import { Amount } from '../Amount';
import { Skeleton } from '../../feedback/Skeleton';
import styles from './PlanVsReal.module.css';

interface PlanVsRealProps {
  label: string;
  totals: PlanVsRealTotals;
  status?: ZoneStatus;
  /** For expenses, spending less than expected is the favourable outcome. */
  favourable?: 'higher-real' | 'lower-real';
  emptyMessage?: string;
  className?: string;
}

/**
 * The fixed Esperado | Real | Diferencia grammar. Every plan-vs-real pair in the
 * app uses this component so the three columns always align across sections.
 */
export function PlanVsReal({
  label,
  totals,
  status = 'ready',
  favourable = 'higher-real',
  emptyMessage = 'Sin datos para comparar.',
  className,
}: PlanVsRealProps) {
  const rawDifference = totals.real - totals.expected;
  const signedDifference = favourable === 'higher-real' ? rawDifference : -rawDifference;

  return (
    <section className={classNames(styles.group, className)} aria-label={label}>
      <h3 className={styles.title}>{label}</h3>

      {status === 'loading' ? (
        <div className={styles.columns}>
          <Skeleton height="1.5rem" />
          <Skeleton height="1.5rem" />
          <Skeleton height="1.5rem" />
        </div>
      ) : null}

      {status === 'empty' ? <p className={styles.muted}>{emptyMessage}</p> : null}

      {status === 'ready' ? (
        <dl className={styles.columns}>
          <div className={styles.column}>
            <dt className={styles.columnLabel}>Esperado</dt>
            <dd className={styles.columnValue}>
              <Amount value={totals.expected} size="secondary" tone="neutral" />
            </dd>
          </div>
          <div className={styles.column}>
            <dt className={styles.columnLabel}>Real</dt>
            <dd className={styles.columnValue}>
              <Amount value={totals.real} size="secondary" tone="neutral" />
            </dd>
          </div>
          <div className={classNames(styles.column, styles.difference)}>
            <dt className={styles.columnLabel}>Diferencia</dt>
            <dd className={styles.columnValue}>
              {/* Value keeps the raw magnitude; the tone reflects whether it helps. */}
              <Amount
                value={rawDifference}
                size="secondary"
                signed
                tone={signedDifference === 0 ? 'neutral' : 'auto'}
                className={signedDifference < 0 ? styles.unfavourable : styles.favourable}
              />
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
