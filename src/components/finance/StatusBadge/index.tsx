import { classNames } from '../../../utils/classNames';
import type { CoverageStatus, ItemStatus, TemporalClass } from '../../../types/finance';
import { TransferIcon } from '../../icons';
import styles from './StatusBadge.module.css';

export type BadgeState = ItemStatus | 'transfer';

const STATUS_LABEL: Record<BadgeState, string> = {
  planned: 'Planeado',
  realized: 'Realizado',
  cancelled: 'Cancelado',
  transfer: 'Transferencia',
};

interface StatusBadgeProps {
  state: BadgeState;
  className?: string;
}

/** One badge per item state; color alone never carries the meaning. */
export function StatusBadge({ state, className }: StatusBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[state], className)}>
      {state === 'transfer' ? <TransferIcon size={12} /> : null}
      {STATUS_LABEL[state]}
    </span>
  );
}

const TEMPORAL_LABEL: Record<TemporalClass, string> = {
  past: 'Pasado',
  current: 'Actual',
  future: 'Futuro',
};

interface TemporalBadgeProps {
  temporal: TemporalClass;
  className?: string;
}

/** Informative classifier — it never restricts what the user may edit. */
export function TemporalBadge({ temporal, className }: TemporalBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[temporal], className)}>
      {TEMPORAL_LABEL[temporal]}
    </span>
  );
}

const COVERAGE_LABEL: Record<CoverageStatus, string> = {
  sufficient: 'Cobertura suficiente',
  insufficient: 'Cobertura insuficiente',
  surplus: 'Excedente',
};

interface CoverageBadgeProps {
  coverage: CoverageStatus;
  className?: string;
}

export function CoverageBadge({ coverage, className }: CoverageBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[coverage], className)}>
      {COVERAGE_LABEL[coverage]}
    </span>
  );
}

interface PlainBadgeProps {
  children: string;
  tone?: 'neutral' | 'muted' | 'custom' | 'override';
  className?: string;
}

export function PlainBadge({ children, tone = 'neutral', className }: PlainBadgeProps) {
  return <span className={classNames(styles.badge, styles[tone], className)}>{children}</span>;
}
