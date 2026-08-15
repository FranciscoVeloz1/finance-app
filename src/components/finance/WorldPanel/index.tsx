import type { ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import { CashIcon, CreditCardIcon, PiggyBankIcon } from '../../icons';
import styles from './WorldPanel.module.css';

export type FinancialWorld = 'credit' | 'cash' | 'savings';

const WORLD_ICON: Record<FinancialWorld, ReactNode> = {
  credit: <CreditCardIcon size={18} />,
  cash: <CashIcon size={18} />,
  savings: <PiggyBankIcon size={18} />,
};

interface WorldPanelProps {
  world: FinancialWorld;
  title: string;
  /** Says out loud what this panel is not, so the worlds never blur. */
  caption?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Container for credit, cash and savings-fund. Each world keeps its own icon,
 * label and token so no aggregate can be mistaken for another.
 */
export function WorldPanel({
  world,
  title,
  caption,
  actions,
  children,
  className,
}: WorldPanelProps) {
  return (
    <section className={classNames(styles.panel, styles[world], className)}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>{WORLD_ICON[world]}</span>
          {title}
        </h2>
        {actions === undefined ? null : <div className={styles.actions}>{actions}</div>}
      </header>
      {caption === undefined ? null : <p className={styles.caption}>{caption}</p>}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
