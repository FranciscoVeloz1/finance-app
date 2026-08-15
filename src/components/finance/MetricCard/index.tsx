import type { ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import type { ZoneStatus } from '../../../types/finance';
import { Amount, type AmountSize } from '../Amount';
import { Skeleton } from '../../feedback/Skeleton';
import { Button } from '../../forms/Button';
import { ChevronRightIcon } from '../../icons';
import styles from './MetricCard.module.css';

export type MetricWorld = 'neutral' | 'credit' | 'cash' | 'savings';

interface MetricCardProps {
  label: string;
  value: number;
  status?: ZoneStatus;
  size?: AmountSize;
  signed?: boolean;
  tone?: 'auto' | 'neutral';
  subtitle?: ReactNode;
  world?: MetricWorld;
  icon?: ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  /** Opens the explanatory breakdown for this aggregate. */
  onBreakdown?: () => void;
  breakdownLabel?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  status = 'ready',
  size = 'primary',
  signed = false,
  tone = 'auto',
  subtitle,
  world = 'neutral',
  icon,
  emptyMessage = 'Sin información para este periodo.',
  errorMessage = 'No pudimos calcular este dato.',
  onRetry,
  onBreakdown,
  breakdownLabel,
  className,
}: MetricCardProps) {
  return (
    <article className={classNames(styles.card, styles[world], className)}>
      <header className={styles.header}>
        {icon === undefined ? null : <span className={styles.icon}>{icon}</span>}
        <h3 className={styles.label}>{label}</h3>
      </header>

      {status === 'loading' ? (
        <div className={styles.body}>
          <Skeleton height="1.75rem" width="60%" />
          <Skeleton height="0.875rem" width="40%" />
        </div>
      ) : null}

      {status === 'empty' ? <p className={styles.muted}>{emptyMessage}</p> : null}

      {status === 'error' ? (
        <div className={styles.body}>
          <p className={styles.error}>{errorMessage}</p>
          {onRetry === undefined ? null : (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      ) : null}

      {status === 'ready' ? (
        <div className={styles.body}>
          <Amount value={value} size={size} signed={signed} tone={tone} />
          {subtitle === undefined ? null : <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      ) : null}

      {status === 'ready' && onBreakdown !== undefined ? (
        <Button
          variant="ghost"
          size="sm"
          className={styles.breakdown}
          onClick={onBreakdown}
          aria-label={`Ver desglose de ${label}`}
        >
          {breakdownLabel ?? 'Ver desglose'}
          <ChevronRightIcon size={14} />
        </Button>
      ) : null}
    </article>
  );
}
