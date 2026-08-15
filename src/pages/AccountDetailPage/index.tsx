import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMovements } from '../../hooks/useFinanceData';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { formatPeriodLabel } from '../../utils/dates';
import { Amount } from '../../components/finance/Amount';
import { FigureGrid } from '../../components/finance/FigureGrid';
import { ItemList } from '../../components/finance/ItemList';
import { PlainBadge } from '../../components/finance/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { SkeletonList } from '../../components/feedback/Skeleton';
import { Button } from '../../components/forms/Button';
import { ACCOUNT_TYPE_LABEL } from '../../utils/labels';
import { AccountTypeIcon, ChevronLeftIcon } from '../../components/icons';
import { PLACEHOLDER_ACCOUNTS } from '../../data/placeholder';
import styles from './AccountDetailPage.module.css';

export function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [searchParams] = useSearchParams();
  const { periodId } = useSelectedPeriod();
  const navigate = useNavigate();
  const movementsZone = useMovements(periodId ?? '');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const fromSummary = searchParams.get('origen') !== 'cuentas';

  const account = PLACEHOLDER_ACCOUNTS.find((item) => {
    return item.id === accountId;
  });

  const movements = useMemo(() => {
    return (movementsZone.data ?? []).filter((movement) => {
      return movement.accountId === accountId;
    });
  }, [movementsZone.data, accountId]);

  // Landing here from the dashboard should put the reader at the account name.
  useEffect(() => {
    headingRef.current?.focus();
  }, [accountId]);

  if (account === undefined) {
    return (
      <EmptyState
        title="Cuenta no encontrada"
        description="Es posible que se haya eliminado o que el enlace esté incompleto."
        action={
          <Link className={styles.back} to="/cuentas">
            Volver a Cuentas
          </Link>
        }
      />
    );
  }

  const periodTotal = movements.reduce((total, movement) => {
    return total + movement.amount;
  }, 0);

  return (
    <div className={styles.page}>
      <Link
        className={styles.back}
        to={fromSummary ? `/resumen${periodId ? `?periodo=${periodId}` : ''}` : '/cuentas'}
      >
        <ChevronLeftIcon size={16} />
        {fromSummary ? 'Volver al resumen' : 'Volver a Cuentas'}
      </Link>

      <header className={styles.header}>
        <span className={styles.icon} data-type={account.type}>
          <AccountTypeIcon type={account.type} size={22} />
        </span>
        <div>
          <h1 className={styles.title} tabIndex={-1} ref={headingRef}>
            {account.label}
          </h1>
          <div className={styles.badges}>
            <PlainBadge>{ACCOUNT_TYPE_LABEL[account.type]}</PlainBadge>
            {account.active ? null : <PlainBadge tone="muted">Inactiva</PlainBadge>}
            {fromSummary ? <PlainBadge tone="muted">{formatPeriodLabel(periodId ?? '')}</PlainBadge> : null}
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className={styles.edit}
          onClick={() => {
            // Editing lives on the accounts screen; this keeps one form to maintain.
            void navigate('/cuentas');
          }}
        >
          Editar cuenta
        </Button>
      </header>

      <FigureGrid
        figures={[
          { id: 'opening', label: 'Saldo inicial', value: account.openingBalance },
          { id: 'period', label: 'Movimientos del periodo', value: periodTotal, signed: true },
          {
            id: 'derived',
            label: 'Saldo derivado',
            value: account.derivedBalance,
            size: 'primary',
          },
        ]}
      />

      <section className={styles.section} aria-labelledby="account-movements">
        <h2 className={styles.sectionTitle} id="account-movements">
          Movimientos del periodo
          <Amount
            className={styles.sectionTotal}
            value={periodTotal}
            size="derived"
            signed
            tone="auto"
          />
        </h2>

        {movementsZone.status === 'loading' ? (
          <SkeletonList rows={4} height="52px" />
        ) : (
          <ItemList
            items={movements}
            onEdit={() => {
              // Movement editing lives in the period detail, next to its context.
              void navigate(periodId ? `/mes?periodo=${periodId}` : '/mes');
            }}
            emptyState={
              <EmptyState
                compact
                title="Sin movimientos en este periodo para esta cuenta"
                description="Cuando registres algo con esta cuenta aparecerá aquí."
                action={
                  <Link className={styles.back} to={periodId ? `/mes?periodo=${periodId}` : '/mes'}>
                    Ir al detalle del periodo
                  </Link>
                }
              />
            }
          />
        )}
      </section>
    </div>
  );
}
