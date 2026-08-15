import type { ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Breadcrumb or "back" control rendered above the title. */
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={classNames(styles.header, className)}>
      {breadcrumb === undefined ? null : <div className={styles.breadcrumb}>{breadcrumb}</div>}
      <div className={styles.row}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description === undefined ? null : <p className={styles.description}>{description}</p>}
        </div>
        {actions === undefined ? null : <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
