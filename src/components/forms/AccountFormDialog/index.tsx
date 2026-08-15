import { useEffect, useState } from 'react';
import type { Account, AccountType } from '../../../types/finance';
import { ACCOUNT_TYPE_LABEL } from '../../../utils/labels';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { Field } from '../Field';
import { Switch } from '../Switch';
import styles from './AccountFormDialog.module.css';

export interface AccountDraft {
  label: string;
  type: AccountType;
  openingBalance: string;
  creditLimit: string;
  creditDebt: string;
  statementDay: string;
  paymentDay: string;
  includedInProjections: boolean;
}

interface AccountFormDialogProps {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSubmit: (draft: AccountDraft) => void;
}

const EMPTY: AccountDraft = {
  label: '',
  type: 'debit',
  openingBalance: '',
  creditLimit: '',
  creditDebt: '',
  statementDay: '',
  paymentDay: '',
  includedInProjections: true,
};

function toDraft(account: Account | null): AccountDraft {
  if (account === null) {
    return EMPTY;
  }

  return {
    label: account.label,
    type: account.type,
    openingBalance: String(account.openingBalance),
    creditLimit: account.creditLimit === undefined ? '' : String(account.creditLimit),
    creditDebt: account.creditDebt === undefined ? '' : String(account.creditDebt),
    statementDay: account.statementDay === undefined ? '' : String(account.statementDay),
    paymentDay: account.paymentDay === undefined ? '' : String(account.paymentDay),
    includedInProjections: account.includedInProjections,
  };
}

export function AccountFormDialog({ open, account, onClose, onSubmit }: AccountFormDialogProps) {
  const [draft, setDraft] = useState<AccountDraft>(() => {
    return toDraft(account);
  });
  const [error, setError] = useState<string | null>(null);

  // Reopening the dialog for another row must not keep the previous values.
  useEffect(() => {
    if (open) {
      setDraft(toDraft(account));
      setError(null);
    }
  }, [open, account]);

  const update = <TKey extends keyof AccountDraft>(key: TKey, value: AccountDraft[TKey]) => {
    setDraft((current) => {
      return { ...current, [key]: value };
    });
  };

  return (
    <Dialog
      open={open}
      title={account === null ? 'Agregar cuenta' : `Editar ${account.label}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="account-form">
            Guardar
          </Button>
        </>
      }
    >
      <form
        id="account-form"
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();

          if (draft.label.trim() === '') {
            setError('Escribe un nombre para la cuenta.');
            return;
          }

          onSubmit(draft);
        }}
      >
        <Field label="Nombre" required error={error ?? undefined}>
          {({ id, describedBy, invalid }) => {
            return (
              <input
                className="control"
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                value={draft.label}
                onChange={(event) => {
                  update('label', event.target.value);
                }}
              />
            );
          }}
        </Field>

        <Field label="Tipo" required>
          {({ id }) => {
            return (
              <select
                className="control"
                id={id}
                value={draft.type}
                onChange={(event) => {
                  update('type', event.target.value as AccountType);
                }}
              >
                {Object.entries(ACCOUNT_TYPE_LABEL).map(([value, label]) => {
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            );
          }}
        </Field>

        <Field label="Saldo inicial" hint="Punto de partida para el saldo derivado.">
          {({ id, describedBy }) => {
            return (
              <input
                className="control tabular"
                id={id}
                aria-describedby={describedBy}
                inputMode="decimal"
                value={draft.openingBalance}
                onChange={(event) => {
                  update('openingBalance', event.target.value);
                }}
              />
            );
          }}
        </Field>

        {draft.type === 'credit' ? (
          <fieldset className={styles.creditPanel}>
            <legend className={styles.legend}>Datos de crédito</legend>

            <div className={styles.grid}>
              <Field label="Límite">
                {({ id }) => {
                  return (
                    <input
                      className="control tabular"
                      id={id}
                      inputMode="decimal"
                      value={draft.creditLimit}
                      onChange={(event) => {
                        update('creditLimit', event.target.value);
                      }}
                    />
                  );
                }}
              </Field>

              <Field label="Deuda inicial">
                {({ id }) => {
                  return (
                    <input
                      className="control tabular"
                      id={id}
                      inputMode="decimal"
                      value={draft.creditDebt}
                      onChange={(event) => {
                        update('creditDebt', event.target.value);
                      }}
                    />
                  );
                }}
              </Field>

              <Field label="Día de corte">
                {({ id }) => {
                  return (
                    <input
                      className="control tabular"
                      id={id}
                      type="number"
                      min={1}
                      max={31}
                      value={draft.statementDay}
                      onChange={(event) => {
                        update('statementDay', event.target.value);
                      }}
                    />
                  );
                }}
              </Field>

              <Field label="Día de pago">
                {({ id }) => {
                  return (
                    <input
                      className="control tabular"
                      id={id}
                      type="number"
                      min={1}
                      max={31}
                      value={draft.paymentDay}
                      onChange={(event) => {
                        update('paymentDay', event.target.value);
                      }}
                    />
                  );
                }}
              </Field>
            </div>
          </fieldset>
        ) : null}

        <Switch
          label="Participa en proyecciones"
          hint="Si se apaga, la cuenta no suma al efectivo disponible ni al ahorro esperado."
          checked={draft.includedInProjections}
          onChange={(checked) => {
            update('includedInProjections', checked);
          }}
        />
      </form>
    </Dialog>
  );
}
