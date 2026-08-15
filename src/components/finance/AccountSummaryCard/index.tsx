import { Link } from 'react-router-dom';
import type { Account, PeriodId } from '../../../types/finance';
import { ACCOUNT_TYPE_LABEL } from '../../../utils/labels';
import { Amount } from '../Amount';
import { AccountTypeIcon, ChevronRightIcon } from '../../icons';
import styles from './AccountSummaryCard.module.css';

interface AccountSummaryCardProps {
  account: Account;
  periodId: PeriodId;
}

export function AccountSummaryCard({ account, periodId }: AccountSummaryCardProps) {
  return (
    <li>
      <Link
        className={styles.card}
        to={`/cuentas/${account.id}?periodo=${periodId}`}
        aria-label={`Ver detalle de ${account.label}`}
      >
        <span className={styles.head}>
          <span className={styles.icon} data-type={account.type}>
            <AccountTypeIcon type={account.type} size={18} />
          </span>
          <span className={styles.text}>
            <span className={styles.label}>{account.label}</span>
            <span className={styles.type}>{ACCOUNT_TYPE_LABEL[account.type]}</span>
          </span>
        </span>

        <span className={styles.figures}>
          <span className={styles.figureLabel}>Saldo inicial</span>
          <Amount value={account.openingBalance} size="derived" tone="neutral" />
        </span>

        <span className={styles.footer}>
          <Amount value={account.derivedBalance} size="secondary" signed />
          <span className={styles.chevron} aria-hidden="true">
            Ver detalle
            <ChevronRightIcon size={14} />
          </span>
        </span>
      </Link>
    </li>
  );
}
