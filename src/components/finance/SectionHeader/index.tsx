import type { ReactNode } from 'react';
import { Amount } from '../Amount';
import styles from './SectionHeader.module.css';

export interface SectionTotals {
  planned: number;
  real: number;
  remaining?: number;
}

interface SectionHeaderProps {
  id: string;
  title: string;
  totals?: SectionTotals;
  action?: ReactNode;
}

/** Shared heading for every month-detail section: title, totals, add action. */
export function SectionHeader({ id, title, totals, action }: SectionHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h2 className={styles.title} id={id}>
          {title}
        </h2>
        {totals === undefined ? null : (
          <dl className={styles.totals}>
            <div className={styles.total}>
              <dt>Planeado</dt>
              <dd>
                <Amount value={totals.planned} size="derived" tone="neutral" />
              </dd>
            </div>
            <div className={styles.total}>
              <dt>Real</dt>
              <dd>
                <Amount value={totals.real} size="derived" tone="neutral" />
              </dd>
            </div>
            {totals.remaining === undefined ? null : (
              <div className={styles.total}>
                <dt>Restante</dt>
                <dd>
                  <Amount value={totals.remaining} size="derived" signed />
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
      {action === undefined ? null : <div className={styles.action}>{action}</div>}
    </header>
  );
}
