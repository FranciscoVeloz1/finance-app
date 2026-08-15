import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RecurringRule } from '../../types/finance';
import { classNames } from '../../utils/classNames';
import { BUDGET_GROUP_LABEL } from '../../utils/labels';
import { useToast } from '../../hooks/useToast';
import { formatPeriodLabel } from '../../utils/dates';
import { Amount } from '../../components/finance/Amount';
import { PlainBadge } from '../../components/finance/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Button } from '../../components/forms/Button';
import { ConfirmDialog } from '../../components/forms/ConfirmDialog';
import { RowMenu } from '../../components/forms/RowMenu';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChevronLeftIcon, PlusIcon, TransferIcon } from '../../components/icons';
import { PLACEHOLDER_RULES } from '../../data/placeholder';
import styles from './RecurringRulesPage.module.css';

const KIND_LABEL: Record<RecurringRule['kind'], string> = {
  service: 'Servicio recurrente',
  'base-budget': 'Presupuesto base',
  withdrawal: 'Retiro programado',
};


export function RecurringRulesPage() {
  const { notify } = useToast();
  const [rules, setRules] = useState<RecurringRule[]>(PLACEHOLDER_RULES);
  const [pending, setPending] = useState<RecurringRule | null>(null);

  const kinds = Object.keys(KIND_LABEL) as RecurringRule['kind'][];

  const togglePause = (rule: RecurringRule) => {
    setRules((current) => {
      return current.map((item) => {
        return item.id === rule.id ? { ...item, paused: !item.paused } : item;
      });
    });

    notify('success', rule.paused ? 'Regla reactivada.' : 'Regla pausada.');
  };

  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumb={
          <Link className={styles.back} to="/configuracion">
            <ChevronLeftIcon size={16} />
            Configuración
          </Link>
        }
        title="Reglas recurrentes"
        description="Plantillas que siembran cada periodo nuevo. Editarlas puede afectar periodos futuros."
        actions={<Button icon={<PlusIcon size={16} />}>Agregar regla</Button>}
      />

      {rules.length === 0 ? (
        <EmptyState
          title="Aún no tienes reglas recurrentes"
          description="Crea una plantilla para que tus servicios y presupuestos base aparezcan solos cada mes."
          action={<Button icon={<PlusIcon size={16} />}>Agregar primera regla</Button>}
        />
      ) : (
        kinds.map((kind) => {
          const ofKind = rules.filter((rule) => {
            return rule.kind === kind;
          });

          if (ofKind.length === 0) {
            return null;
          }

          return (
            <section key={kind} className={styles.group} aria-labelledby={`kind-${kind}`}>
              <h2 className={styles.groupTitle} id={`kind-${kind}`}>
                {KIND_LABEL[kind]}
              </h2>

              <ul className={styles.list}>
                {ofKind.map((rule) => {
                  return (
                    <li
                      key={rule.id}
                      className={classNames(styles.card, rule.paused && styles.paused)}
                    >
                      <div className={styles.text}>
                        <span className={styles.label}>
                          {rule.label}
                          {rule.paused ? (
                            <PlainBadge tone="muted">Pausada</PlainBadge>
                          ) : (
                            <PlainBadge>Activa</PlainBadge>
                          )}
                        </span>
                        <span className={styles.meta}>
                          {BUDGET_GROUP_LABEL[rule.group]} · vigente desde{' '}
                          {formatPeriodLabel(rule.effectiveFrom)}
                        </span>
                      </div>

                      <span
                        className={styles.futureHint}
                        title="Los cambios pueden alcanzar periodos futuros"
                      >
                        <TransferIcon size={16} />
                        <span className="visually-hidden">
                          Editar esta regla puede afectar periodos futuros
                        </span>
                      </span>

                      <Amount value={rule.baseAmount} size="secondary" tone="neutral" />

                      <RowMenu
                        label={rule.label}
                        actions={[
                          { id: 'edit', label: 'Editar', onSelect: () => undefined },
                          {
                            id: 'pause',
                            label: rule.paused ? 'Reactivar' : 'Pausar',
                            onSelect: () => {
                              togglePause(rule);
                            },
                          },
                          {
                            id: 'deactivate',
                            label: 'Desactivar',
                            destructive: true,
                            onSelect: () => {
                              setPending(rule);
                            },
                          },
                        ]}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      <ConfirmDialog
        open={pending !== null}
        title="Desactivar regla recurrente"
        description="Dejará de sembrar periodos nuevos. Los movimientos que ya generó en periodos existentes se conservan tal como están."
        confirmLabel="Desactivar"
        destructive
        onClose={() => {
          setPending(null);
        }}
        onConfirm={() => {
          const target = pending;
          setPending(null);

          if (target === null) {
            return;
          }

          setRules((current) => {
            return current.filter((rule) => {
              return rule.id !== target.id;
            });
          });

          notify('success', 'Regla desactivada.');
        }}
      />
    </div>
  );
}
