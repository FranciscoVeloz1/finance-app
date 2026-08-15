import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Account } from '../../types/finance';
import { classNames } from '../../utils/classNames';
import { useToast } from '../../hooks/useToast';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { Amount } from '../../components/finance/Amount';
import { PlainBadge } from '../../components/finance/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Button } from '../../components/forms/Button';
import { AccountFormDialog, type AccountDraft } from '../../components/forms/AccountFormDialog';
import { ACCOUNT_TYPE_LABEL } from '../../utils/labels';
import { ConfirmDialog } from '../../components/forms/ConfirmDialog';
import { RowMenu } from '../../components/forms/RowMenu';
import { PageHeader } from '../../components/layout/PageHeader';
import { AccountTypeIcon, PlusIcon, WalletIcon } from '../../components/icons';
import { PLACEHOLDER_ACCOUNTS } from '../../data/placeholder';
import styles from './AccountsPage.module.css';

type PendingAction = { kind: 'deactivate' | 'delete'; account: Account } | null;

export function AccountsPage() {
  const { periodId } = useSelectedPeriod();
  const { notify } = useToast();
  const [accounts, setAccounts] = useState<Account[]>(PLACEHOLDER_ACCOUNTS);
  const [editing, setEditing] = useState<Account | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

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
    setFormOpen(false);

    setAccounts((current) => {
      if (editing === null) {
        const created: Account = {
          id: `acc-${String(Date.now())}`,
          label: draft.label,
          type: draft.type,
          active: true,
          openingBalance: Number(draft.openingBalance) || 0,
          derivedBalance: Number(draft.openingBalance) || 0,
          includedInProjections: draft.includedInProjections,
        };

        return [...current, created];
      }

      return current.map((account) => {
        return account.id === editing.id
          ? {
              ...account,
              label: draft.label,
              type: draft.type,
              openingBalance: Number(draft.openingBalance) || 0,
              includedInProjections: draft.includedInProjections,
            }
          : account;
      });
    });

    notify('success', editing === null ? 'Cuenta agregada.' : 'Cuenta actualizada.');
  };

  const confirmPending = () => {
    if (pending === null) {
      return;
    }

    const { kind, account } = pending;
    setPending(null);

    setAccounts((current) => {
      return kind === 'delete'
        ? current.filter((item) => {
            return item.id !== account.id;
          })
        : current.map((item) => {
            return item.id === account.id ? { ...item, active: false } : item;
          });
    });

    notify('success', kind === 'delete' ? 'Cuenta eliminada.' : 'Cuenta desactivada.');
  };

  const renderRow = (account: Account) => {
    const hasHistory = account.derivedBalance !== account.openingBalance;

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
                      setPending({ kind: 'deactivate', account });
                    },
                  },
                ]
              : []),
            // Deleting is only offered while the account has no history to lose.
            ...(hasHistory
              ? []
              : [
                  {
                    id: 'delete',
                    label: 'Eliminar',
                    destructive: true,
                    onSelect: () => {
                      setPending({ kind: 'delete', account });
                    },
                  },
                ]),
          ]}
        />
      </li>
    );
  };

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

      {active.length === 0 ? (
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
      ) : (
        <ul className={styles.list}>{active.map(renderRow)}</ul>
      )}

      {inactive.length === 0 ? null : (
        <details className={styles.inactiveSection}>
          <summary className={styles.summary}>
            Cuentas inactivas ({inactive.length})
          </summary>
          <ul className={styles.list}>{inactive.map(renderRow)}</ul>
        </details>
      )}

      <AccountFormDialog
        open={formOpen}
        account={editing}
        onClose={() => {
          setFormOpen(false);
        }}
        onSubmit={saveDraft}
      />

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'delete' ? 'Eliminar cuenta' : 'Desactivar cuenta'}
        description={
          pending?.kind === 'delete'
            ? 'Esta cuenta no tiene movimientos registrados, así que se puede eliminar por completo. La acción no se puede deshacer.'
            : 'La cuenta dejará de aparecer en formularios nuevos, pero su historial y los periodos pasados se conservan tal como están.'
        }
        confirmLabel={pending?.kind === 'delete' ? 'Eliminar' : 'Desactivar'}
        destructive={pending?.kind === 'delete'}
        onClose={() => {
          setPending(null);
        }}
        onConfirm={confirmPending}
      />
    </div>
  );
}
