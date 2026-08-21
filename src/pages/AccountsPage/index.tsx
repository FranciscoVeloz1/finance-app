import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Account } from '../../types/finance';
import { classNames } from '../../utils/classNames';
import { mapAccounts } from '../../utils/map-finance';
import { useToast } from '../../hooks/useToast';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { useFinanceAccounts } from '../../hooks/useFinanceAccounts';
import { useFinancePeriods } from '../../hooks/useFinancePeriods';
import { useAccountMutations } from '../../hooks/useAccountMutations';
import { Amount } from '../../components/finance/Amount';
import { PlainBadge } from '../../components/finance/StatusBadge';
import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { SkeletonList } from '../../components/feedback/Skeleton';
import { Button } from '../../components/forms/Button';
import { AccountFormDialog, type AccountDraft } from '../../components/forms/AccountFormDialog';
import { ACCOUNT_TYPE_LABEL } from '../../utils/labels';
import { ConfirmDialog } from '../../components/forms/ConfirmDialog';
import { RowMenu } from '../../components/forms/RowMenu';
import { PageHeader } from '../../components/layout/PageHeader';
import { AccountTypeIcon, PlusIcon, WalletIcon } from '../../components/icons';
import styles from './AccountsPage.module.css';

function startsOnForSelectedPeriod(
  periods: Array<{ id: string; year: number; month: number }>,
  periodId: string | undefined,
  now: Date,
): string {
  const selected = periods.find((period) => {
    return period.id === periodId;
  });
  if (selected !== undefined) {
    return `${selected.year}-${String(selected.month).padStart(2, '0')}-01`;
  }

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function AccountsPage() {
  const { periodId } = useSelectedPeriod();
  const { notify } = useToast();
  const periodsQuery = useFinancePeriods();
  const accountsQuery = useFinanceAccounts(
    periodId ? { status: 'ALL', periodId, includeBalances: true } : { status: 'ALL' },
  );
  const { create, update, deactivate, mutationErrorMessage } = useAccountMutations();
  const [editing, setEditing] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pending, setPending] = useState<Account | null>(null);

  const accounts = useMemo(() => {
    return mapAccounts(accountsQuery.data?.accounts ?? []);
  }, [accountsQuery.data]);

  const { active, inactive } = useMemo(() => {
    const activeAccounts: Account[] = [];
    const inactiveAccounts: Account[] = [];

    for (const account of accounts) {
      if (account.active) {
        activeAccounts.push(account);
      } else {
        inactiveAccounts.push(account);
      }
    }

    return { active: activeAccounts, inactive: inactiveAccounts };
  }, [accounts]);

  const openForm = (account: Account | null) => {
    setEditing(account);
    setFormOpen(true);
  };

  const saveDraft = (draft: AccountDraft) => {
    const run = async () => {
      try {
        if (editing === null) {
          await create.mutateAsync({
            draft,
            startsOn: startsOnForSelectedPeriod(
              periodsQuery.data?.periods ?? [],
              periodId,
              new Date(),
            ),
          });
          notify('success', 'Cuenta agregada.');
        } else {
          await update.mutateAsync({ accountId: editing.id, draft });
          notify('success', 'Cuenta actualizada.');
        }
        setFormOpen(false);
      } catch (cause: unknown) {
        notify('negative', mutationErrorMessage(cause, 'No se pudo guardar la cuenta.'));
      }
    };

    void run();
  };

  const confirmDeactivate = () => {
    if (pending === null) {
      return;
    }

    const run = async () => {
      try {
        await deactivate.mutateAsync(pending.id);
        setPending(null);
        notify('success', 'Cuenta desactivada.');
      } catch (cause: unknown) {
        notify('negative', mutationErrorMessage(cause, 'No se pudo desactivar la cuenta.'));
      }
    };

    void run();
  };

  const renderRow = (account: Account) => {
    return (
      <li
        key={account.id}
        className={classNames(styles.row, !account.active && styles.inactiveRow)}
      >
        <span className={styles.icon} data-type={account.type}>
          <AccountTypeIcon type={account.type} size={18} />
        </span>

        <div className={styles.text}>
          <Link className={styles.label} to={`/cuentas/${account.id}?periodo=${periodId ?? ''}`}>
            {account.label}
          </Link>
          <span className={styles.type}>
            {ACCOUNT_TYPE_LABEL[account.type]}
            {account.includedInProjections ? '' : ' · fuera de proyecciones'}
          </span>
        </div>

        {account.active ? null : <PlainBadge tone="muted">Inactiva</PlainBadge>}

        <Amount value={account.derivedBalance} size="secondary" tone="neutral" />

        <RowMenu
          label={account.label}
          actions={[
            {
              id: 'edit',
              label: 'Editar',
              onSelect: () => {
                openForm(account);
              },
            },
            ...(account.active
              ? [
                  {
                    id: 'deactivate',
                    label: 'Desactivar',
                    onSelect: () => {
                      setPending(account);
                    },
                  },
                ]
              : []),
          ]}
        />
      </li>
    );
  };

  const loading = accountsQuery.isPending;
  const saving = create.isPending || update.isPending;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Cuentas"
        description="Configura dónde vive tu dinero. Desactivar conserva el historial."
        actions={
          <Button
            icon={<PlusIcon size={16} />}
            onClick={() => {
              openForm(null);
            }}
          >
            Agregar cuenta
          </Button>
        }
      />

      {accountsQuery.isError ? (
        <Banner
          tone="negative"
          title="No pudimos cargar las cuentas"
          action={
            <Button variant="secondary" size="sm" onClick={() => void accountsQuery.refetch()}>
              Reintentar
            </Button>
          }
        />
      ) : null}

      {loading ? <SkeletonList rows={4} height="60px" /> : null}

      {!loading && accountsQuery.isSuccess && active.length === 0 ? (
        <EmptyState
          icon={<WalletIcon size={28} />}
          title="Aún no tienes cuentas"
          description="Agrega tu primera cuenta para empezar a registrar movimientos y ver tu efectivo disponible."
          action={
            <Button
              icon={<PlusIcon size={16} />}
              onClick={() => {
                openForm(null);
              }}
            >
              Agregar primera cuenta
            </Button>
          }
        />
      ) : null}

      {!loading && active.length > 0 ? <ul className={styles.list}>{active.map(renderRow)}</ul> : null}

      {!loading && inactive.length > 0 ? (
        <details className={styles.inactiveSection}>
          <summary className={styles.summary}>Cuentas inactivas ({inactive.length})</summary>
          <ul className={styles.list}>{inactive.map(renderRow)}</ul>
        </details>
      ) : null}

      <AccountFormDialog
        open={formOpen}
        account={editing}
        submitting={saving}
        onClose={() => {
          if (!saving) {
            setFormOpen(false);
          }
        }}
        onSubmit={saveDraft}
      />

      <ConfirmDialog
        open={pending !== null}
        title="Desactivar cuenta"
        description="La cuenta dejará de aparecer en formularios nuevos, pero su historial y los periodos pasados se conservan tal como están."
        confirmLabel="Desactivar"
        busy={deactivate.isPending}
        onClose={() => {
          if (!deactivate.isPending) {
            setPending(null);
          }
        }}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
