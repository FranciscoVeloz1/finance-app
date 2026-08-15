import type { ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div className={classNames(styles.empty, compact && styles.compact, className)}>
      {icon === undefined ? null : <span className={styles.icon}>{icon}</span>}
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {action === undefined ? null : <div className={styles.action}>{action}</div>}
    </div>
  );
}
