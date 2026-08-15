import type { ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import { CheckIcon, InfoIcon, WarningIcon } from '../../icons';
import styles from './Banner.module.css';

export type BannerTone = 'info' | 'success' | 'warning' | 'negative';

const TONE_ICON: Record<BannerTone, ReactNode> = {
  info: <InfoIcon size={18} />,
  success: <CheckIcon size={18} />,
  warning: <WarningIcon size={18} />,
  negative: <WarningIcon size={18} />,
};

interface BannerProps {
  tone: BannerTone;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Zone-level feedback. Errors stay inside their zone so a failing panel never
 * blanks a dashboard that still has usable data.
 */
export function Banner({ tone, title, description, action, className }: BannerProps) {
  return (
    <div
      className={classNames(styles.banner, styles[tone], className)}
      role={tone === 'negative' ? 'alert' : 'status'}
    >
      <span className={styles.icon}>{TONE_ICON[tone]}</span>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {description === undefined ? null : <p className={styles.description}>{description}</p>}
      </div>
      {action === undefined ? null : <div className={styles.action}>{action}</div>}
    </div>
  );
}
