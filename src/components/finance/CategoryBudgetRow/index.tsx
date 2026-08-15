import { Link } from 'react-router-dom';
import type { CategoryBudget, PeriodId } from '../../../types/finance';
import { Amount } from '../Amount';
import { BudgetProgress } from '../BudgetProgress';
import { PlainBadge } from '../StatusBadge';
import { budgetLevel } from '../../../utils/money';
import { ChevronRightIcon } from '../../icons';
import styles from './CategoryBudgetRow.module.css';

interface CategoryBudgetRowProps {
  category: CategoryBudget;
  periodId: PeriodId;
}

/**
 * Whole row is one activation target that hands off to the month detail with
 * this category already focused (spec 13 receives `seccion`).
 */
export function CategoryBudgetRow({ category, periodId }: CategoryBudgetRowProps) {
  const level = budgetLevel(category.real, category.limit);
  const projectedLevel =
    category.remainingProjected === null
      ? null
      : budgetLevel(category.planned + category.real, category.limit);

  return (
    <li className={styles.item}>
      <Link
        className={styles.row}
        to={`/mes?periodo=${periodId}&seccion=${category.id}`}
        aria-label={`Ver detalle de ${category.label}`}
      >
        <div className={styles.head}>
          <span className={styles.label}>
            {category.label}
            {level === 'over' ? <PlainBadge tone="override">Sobre límite</PlainBadge> : null}
            {level !== 'over' && projectedLevel === 'over' ? (
              <PlainBadge tone="override">Proyección sobre límite</PlainBadge>
            ) : null}
          </span>
          <span className={styles.chevron} aria-hidden="true">
            Ver detalle
            <ChevronRightIcon size={16} />
          </span>
        </div>

        <dl className={styles.totals}>
          <div className={styles.total}>
            <dt>Planeado</dt>
            <dd>
              <Amount value={category.planned} size="derived" tone="neutral" />
            </dd>
          </div>
          <div className={styles.total}>
            <dt>Real</dt>
            <dd>
              <Amount value={category.real} size="derived" tone="neutral" />
            </dd>
          </div>
          <div className={styles.total}>
            <dt>Restante real</dt>
            <dd>
              <Amount value={category.remainingReal} size="derived" signed />
            </dd>
          </div>
          {/* Only rendered while planned items are still pending. */}
          {category.remainingProjected === null ? null : (
            <div className={styles.total}>
              <dt>Restante proyectado</dt>
              <dd>
                <Amount value={category.remainingProjected} size="derived" signed />
              </dd>
            </div>
          )}
        </dl>

        <BudgetProgress
          label={`Presupuesto de ${category.label}`}
          consumed={category.real}
          limit={category.limit}
          remaining={category.remainingReal}
          projectedConsumed={
            category.remainingProjected === null ? null : category.real + category.planned
          }
        />
      </Link>
    </li>
  );
}
