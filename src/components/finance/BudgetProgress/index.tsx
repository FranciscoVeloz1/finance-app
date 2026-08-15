import { classNames } from '../../../utils/classNames';
import { budgetLevel, formatMXN, percentOf } from '../../../utils/money';
import styles from './BudgetProgress.module.css';

interface BudgetProgressProps {
  label: string;
  consumed: number;
  limit: number | null;
  remaining: number;
  /** Renders a second, lighter marker for the projected scenario. */
  projectedConsumed?: number | null;
  className?: string;
}

export function BudgetProgress({
  label,
  consumed,
  limit,
  remaining,
  projectedConsumed = null,
  className,
}: BudgetProgressProps) {
  const level = budgetLevel(consumed, limit);
  const projectedLevel =
    projectedConsumed === null ? null : budgetLevel(projectedConsumed, limit);
  const filled = limit === null ? 0 : percentOf(consumed, limit);
  const projectedFilled =
    limit === null || projectedConsumed === null ? null : percentOf(projectedConsumed, limit);

  return (
    <div className={classNames(styles.wrapper, className)}>
      {/* <progress> can't stack the projected marker over the real one. */}
      <div
        className={classNames(styles.track, styles[level])}
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(filled)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={
          limit === null
            ? 'Sin límite definido'
            : `${formatMXN(consumed)} de ${formatMXN(limit)}`
        }
      >
        {projectedFilled === null ? null : (
          <span
            className={classNames(
              styles.projected,
              projectedLevel === null ? undefined : styles[`${projectedLevel}Projected`],
            )}
            style={{ width: `${projectedFilled}%` }}
          />
        )}
        <span className={styles.fill} style={{ width: `${filled}%` }} />
      </div>

      <p className={styles.legend}>
        <span className="tabular">
          {limit === null ? 'Sin límite' : `Límite ${formatMXN(limit)}`}
        </span>
        <span className={classNames('tabular', styles[`${level}Text`])}>
          {remaining < 0 ? 'Excedido ' : 'Restante '}
          {formatMXN(Math.abs(remaining))}
        </span>
      </p>
    </div>
  );
}
