import type { ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import { Amount, type AmountSize } from '../Amount';
import { Button } from '../../forms/Button';
import { ChevronRightIcon } from '../../icons';
import styles from './FigureGrid.module.css';

export interface Figure {
  id: string;
  label: string;
  value: number;
  size?: AmountSize;
  signed?: boolean;
  tone?: 'auto' | 'neutral';
  hint?: string;
  badge?: ReactNode;
  onBreakdown?: () => void;
}

interface FigureGridProps {
  figures: Figure[];
  columns?: 1 | 2;
  className?: string;
}

/** Label + amount pairs used inside panels; keeps tabular alignment consistent. */
export function FigureGrid({ figures, columns = 2, className }: FigureGridProps) {
  return (
    <dl className={classNames(styles.grid, columns === 1 && styles.single, className)}>
      {figures.map((figure) => {
        return (
          <div key={figure.id} className={styles.item}>
            <dt className={styles.label}>
              {figure.label}
              {figure.badge}
            </dt>
            <dd className={styles.value}>
              <Amount
                value={figure.value}
                size={figure.size ?? 'secondary'}
                signed={figure.signed ?? false}
                tone={figure.tone ?? 'neutral'}
              />
              {figure.hint === undefined ? null : (
                <span className={styles.hint}>{figure.hint}</span>
              )}
              {figure.onBreakdown === undefined ? null : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.breakdown}
                  aria-label={`Ver desglose de ${figure.label}`}
                  onClick={figure.onBreakdown}
                >
                  Ver desglose
                  <ChevronRightIcon size={14} />
                </Button>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
