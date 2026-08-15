import { useEffect, useState, type FormEvent } from 'react';
import type { Account, ItemStatus, Movement } from '../../../types/finance';
import { ACCOUNT_TYPE_LABEL } from '../../../utils/labels';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { Field } from '../Field';
import { SegmentedControl } from '../SegmentedControl';
import styles from './MovementFormDialog.module.css';

export type ChangeScope = 'period' | 'period-and-future';

export interface MovementDraft {
  concept: string;
  date: string;
  accountId: string;
  categoryId: string;
  status: ItemStatus;
  plannedAmount: string;
  realAmount: string;
  notes: string;
  scope: ChangeScope;
}

interface MovementFormDialogProps {
  open: boolean;
  movement: Movement | null;
  accounts: Account[];
  categories: { id: string; label: string; group: string }[];
  /** Templates drive this item, so the scope selector is meaningful. */
  templateDriven?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (draft: MovementDraft) => void;
}

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'planned', label: 'Planeado' },
  { value: 'realized', label: 'Realizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

function draftFrom(movement: Movement | null): MovementDraft {
  return {
    concept: movement?.concept ?? '',
    date: movement?.date ?? '',
    accountId: movement?.accountId ?? '',
    categoryId: movement?.categoryId ?? '',
    status: movement?.status ?? 'planned',
    plannedAmount: movement === null ? '' : String(movement.amount),
    realAmount: movement?.status === 'realized' ? String(movement.amount) : '',
    notes: movement?.notes ?? '',
    scope: 'period',
  };
}

export function MovementFormDialog({
  open,
  movement,
  accounts,
  categories,
  templateDriven = false,
  submitting = false,
  onClose,
  onSubmit,
}: MovementFormDialogProps) {
  const [draft, setDraft] = useState<MovementDraft>(() => {
    return draftFrom(movement);
  });
  const [conceptError, setConceptError] = useState<string | undefined>(undefined);
  const [notesOpen, setNotesOpen] = useState(false);

  // Reopening the editor for a different record must not keep the old values.
  useEffect(() => {
    if (open) {
      setDraft(draftFrom(movement));
      setConceptError(undefined);
      setNotesOpen((movement?.notes ?? '').length > 0);
    }
  }, [open, movement]);

  const update = <TKey extends keyof MovementDraft>(key: TKey, value: MovementDraft[TKey]) => {
    setDraft((current) => {
      return { ...current, [key]: value };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draft.concept.trim().length === 0) {
      setConceptError('Escribe un concepto para reconocer el movimiento.');
      return;
    }

    setConceptError(undefined);
    onSubmit(draft);
  };

  return (
    <Dialog
      open={open}
      busy={submitting}
      title={movement === null ? 'Nuevo movimiento' : 'Editar movimiento'}
      description="Los montos se guardan con dos decimales y la fecha es de calendario."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" disabled={submitting} onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" form="movement-form" type="submit" loading={submitting}>
            Guardar
          </Button>
        </>
      }
    >
      <form className={styles.form} id="movement-form" onSubmit={handleSubmit} noValidate>
        <Field label="Concepto" required error={conceptError}>
          {({ id, describedBy, invalid }) => {
            return (
              <input
                id={id}
                className="control"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={draft.concept}
                onChange={(event) => {
                  update('concept', event.currentTarget.value);
                }}
              />
            );
          }}
        </Field>

        <div className={styles.row}>
          <Field label="Fecha" required>
            {({ id }) => {
              return (
                <input
                  id={id}
                  className="control"
                  type="date"
                  value={draft.date}
                  onChange={(event) => {
                    update('date', event.currentTarget.value);
                  }}
                />
              );
            }}
          </Field>

          <Field label="Cuenta" required>
            {({ id }) => {
              return (
                <select
                  id={id}
                  className="control"
                  value={draft.accountId}
                  onChange={(event) => {
                    update('accountId', event.currentTarget.value);
                  }}
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts
                    .filter((account) => {
                      return account.active;
                    })
                    .map((account) => {
                      return (
                        <option key={account.id} value={account.id}>
                          {account.label} · {ACCOUNT_TYPE_LABEL[account.type]}
                        </option>
                      );
                    })}
                </select>
              );
            }}
          </Field>
        </div>

        <Field label="Categoría">
          {({ id }) => {
            return (
              <select
                id={id}
                className="control"
                value={draft.categoryId}
                onChange={(event) => {
                  update('categoryId', event.currentTarget.value);
                }}
              >
                <option value="">Sin categoría (transferencia)</option>
                {categories.map((category) => {
                  return (
                    <option key={category.id} value={category.id}>
                      {category.group} · {category.label}
                    </option>
                  );
                })}
              </select>
            );
          }}
        </Field>

        <SegmentedControl
          legend="Estado"
          options={STATUS_OPTIONS}
          value={draft.status}
          onChange={(value) => {
            update('status', value);
          }}
        />

        <div className={styles.row}>
          <Field label="Monto planeado">
            {({ id }) => {
              return (
                <input
                  id={id}
                  className="control control-numeric"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={draft.plannedAmount}
                  onChange={(event) => {
                    update('plannedAmount', event.currentTarget.value);
                  }}
                />
              );
            }}
          </Field>

          {/* The real amount only exists once the movement actually happened. */}
          {draft.status === 'realized' ? (
            <Field label="Monto real" required>
              {({ id }) => {
                return (
                  <input
                    id={id}
                    className="control control-numeric"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={draft.realAmount}
                    onChange={(event) => {
                      update('realAmount', event.currentTarget.value);
                    }}
                  />
                );
              }}
            </Field>
          ) : null}
        </div>

        {templateDriven ? (
          <SegmentedControl
            legend="Alcance del cambio"
            options={[
              { value: 'period', label: 'Solo este periodo' },
              { value: 'period-and-future', label: 'Este periodo y futuros' },
            ]}
            value={draft.scope}
            onChange={(value) => {
              update('scope', value);
            }}
          />
        ) : null}

        <div className={styles.notes}>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={notesOpen}
            onClick={() => {
              setNotesOpen((current) => {
                return !current;
              });
            }}
          >
            {notesOpen ? 'Ocultar observaciones' : 'Agregar observaciones'}
          </Button>

          {notesOpen ? (
            <Field label="Observaciones">
              {({ id }) => {
                return (
                  <textarea
                    id={id}
                    className="control"
                    rows={3}
                    value={draft.notes}
                    onChange={(event) => {
                      update('notes', event.currentTarget.value);
                    }}
                  />
                );
              }}
            </Field>
          ) : null}
        </div>
      </form>
    </Dialog>
  );
}
