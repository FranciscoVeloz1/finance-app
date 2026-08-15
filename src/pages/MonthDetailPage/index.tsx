import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EXTRAS_TX_ID } from '../../api/finance-types';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { useFinanceAccounts } from '../../hooks/useFinanceAccounts';
import { useFinanceSummary } from '../../hooks/useFinanceSummary';
import { useFinanceTransactions } from '../../hooks/useFinanceTransactions';
import { useFinanceMutations } from '../../hooks/useFinanceMutations';
import { useProjectionPreview } from '../../hooks/useProjectionPreview';
import { usePreferences } from '../../hooks/usePreferences';
import { useToast } from '../../hooks/useToast';
import type { BudgetGroupId, Movement } from '../../types/finance';
import { classNames } from '../../utils/classNames';
import { formatYearMonth } from '../../utils/dates';
import { mapPeriodSummary, mapTransaction } from '../../utils/map-finance';
import { ApiError } from '../../api/types';
import { BreakdownDialog } from '../../components/finance/BreakdownDialog';
import { BudgetProgress } from '../../components/finance/BudgetProgress';
import { CashWithdrawalBlock } from '../../components/finance/CashWithdrawalBlock';
import { FigureGrid } from '../../components/finance/FigureGrid';
import { ItemList } from '../../components/finance/ItemList';
import { MovementTable } from '../../components/finance/MovementTable';
import { PlanVsReal } from '../../components/finance/PlanVsReal';
import { SectionHeader } from '../../components/finance/SectionHeader';
import { TemporalBadge } from '../../components/finance/StatusBadge';
import { WorldPanel } from '../../components/finance/WorldPanel';
import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { SkeletonList } from '../../components/feedback/Skeleton';
import { Button } from '../../components/forms/Button';
import { MovementFormDialog } from '../../components/forms/MovementFormDialog';
import { PropagationImpactDialog } from '../../components/forms/PropagationImpactDialog';
import { ChevronLeftIcon, PlusIcon } from '../../components/icons';
import { PLACEHOLDER_CATEGORIES } from '../../data/placeholder';
import styles from './MonthDetailPage.module.css';

interface SectionDefinition {
  anchor: string;
  label: string;
  group?: BudgetGroupId;
}

const SECTIONS: SectionDefinition[] = [
  { anchor: 'servicios', label: 'Servicios', group: 'services' },
  { anchor: 'mandado', label: 'Mandado', group: 'groceries' },
  { anchor: 'salidas', label: 'Salidas', group: 'outings' },
  { anchor: 'extras', label: 'Extras', group: 'extras' },
  { anchor: 'retiro', label: 'Retiro' },
  { anchor: 'movimientos', label: 'Movimientos' },
  { anchor: 'credito', label: 'Crédito' },
  { anchor: 'klar', label: 'Fondo Klar' },
];

const GROUP_ANCHOR: Record<BudgetGroupId, string> = {
  services: 'servicios',
  groceries: 'mandado',
  outings: 'salidas',
  extras: 'extras',
};

const CATEGORY_OPTIONS = PLACEHOLDER_CATEGORIES.filter((category) => {
  return category.active;
}).map((category) => {
  return { id: category.id, label: category.label, group: category.group };
});

export function MonthDetailPage() {
  const { periodId, temporal } = useSelectedPeriod();
  const [searchParams] = useSearchParams();
  const summaryQuery = useFinanceSummary(periodId);
  const accountsQuery = useFinanceAccounts(
    { periodId, includeBalances: true },
    Boolean(periodId),
  );
  const transactionsQuery = useFinanceTransactions(periodId, { limit: 100 });
  const { confirm } = useFinanceMutations(periodId);
  const { preferences } = usePreferences();
  const { notify } = useToast();

  const [editing, setEditing] = useState<Movement | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    transactionId: string;
    amount: string;
    concept: string;
  } | null>(null);
  const [conflict, setConflict] = useState(false);

  const previewQuery = useProjectionPreview(
    periodId,
    pendingChange
      ? [
          {
            kind: 'UPDATE_TRANSACTION',
            transactionId: pendingChange.transactionId,
            patch: { amount: pendingChange.amount, concept: pendingChange.concept },
          },
        ]
      : null,
  );

  const focusedGroup = searchParams.get('seccion') as BudgetGroupId | null;
  const summary =
    summaryQuery.data && accountsQuery.data
      ? mapPeriodSummary(
          summaryQuery.data,
          accountsQuery.data.accounts,
          transactionsQuery.data?.transactions ?? [],
        )
      : null;
  const movements = useMemo(() => {
    if (!transactionsQuery.data || !accountsQuery.data) {
      return [];
    }
    return transactionsQuery.data.transactions.map((tx) => {
      return mapTransaction(tx, accountsQuery.data.accounts);
    });
  }, [transactionsQuery.data, accountsQuery.data]);
  const summaryZone = {
    status: summaryQuery.isPending
      ? 'loading'
      : summaryQuery.isError
        ? 'error'
        : summary
          ? 'ready'
          : 'empty',
    retry: () => {
      void summaryQuery.refetch();
    },
  } as const;
  const periodLabel =
    summaryQuery.data !== undefined
      ? formatYearMonth(summaryQuery.data.period.year, summaryQuery.data.period.month)
      : 'Periodo';

  const headingRefs = useRef<Record<string, HTMLHeadingElement | null>>({});

  // Arriving from the dashboard lands on the requested category, visible and focused.
  useEffect(() => {
    if (focusedGroup === null || !(focusedGroup in GROUP_ANCHOR)) {
      return;
    }

    const heading = headingRefs.current[GROUP_ANCHOR[focusedGroup]];

    if (heading === null || heading === undefined) {
      return;
    }

    heading.scrollIntoView({ block: 'start' });
    heading.focus({ preventScroll: true });
  }, [focusedGroup, summaryZone.status]);

  const itemsOfGroup = (group: BudgetGroupId) => {
    return movements.filter((movement) => {
      return movement.categoryId === group;
    });
  };

  const openEditor = (movement: Movement | null) => {
    setEditing(movement);
    setEditorOpen(true);
  };

  const loading = summaryZone.status === 'loading';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to={`/resumen?periodo=${periodId}`}>
          <ChevronLeftIcon size={16} />
          Volver al resumen
        </Link>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {periodLabel}
            {focusedGroup !== null && focusedGroup in GROUP_ANCHOR ? (
              <span className={styles.focusHint}>
                {' '}
                —{' '}
                {SECTIONS.find((section) => {
                  return section.group === focusedGroup;
                })?.label}
              </span>
            ) : null}
          </h1>
          {preferences.showTemporalClassifier ? <TemporalBadge temporal={temporal} /> : null}
        </div>
      </header>

      <section className={styles.compactSummary} aria-label="Resumen compacto del periodo">
        {loading ? (
          <SkeletonList rows={1} height="72px" />
        ) : summary === null ? null : (
          <FigureGrid
            figures={[
              {
                id: 'expected-savings',
                label: 'Ahorro esperado',
                value: summary.expectedSavings,
                signed: true,
                tone: 'auto',
              },
              { id: 'available', label: 'Efectivo disponible', value: summary.availableCash },
              { id: 'expense-real', label: 'Gasto real', value: summary.expense.real },
              { id: 'income-real', label: 'Ingreso recibido', value: summary.income.real },
            ]}
          />
        )}
      </section>

      <nav className={styles.sectionNav} aria-label="Secciones del periodo">
        <ul className={styles.sectionNavList}>
          {SECTIONS.map((section) => {
            return (
              <li key={section.anchor}>
                <a
                  className={classNames(
                    styles.sectionLink,
                    section.group !== undefined &&
                      section.group === focusedGroup &&
                      styles.sectionLinkActive,
                  )}
                  href={`#${section.anchor}`}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {conflict ? (
        <Banner
          tone="warning"
          title="Recargar periodo"
          description="Otro cambio actualizó este mes. Recarga antes de confirmar de nuevo."
        />
      ) : null}

      {summaryZone.status === 'error' ? (
        <Banner
          tone="negative"
          title="No pudimos cargar el periodo"
          action={
            <Button variant="secondary" size="sm" onClick={summaryZone.retry}>
              Reintentar
            </Button>
          }
        />
      ) : null}

      <section className={styles.section} id="ingreso" aria-labelledby="ingreso-title">
        <SectionHeader id="ingreso-title" title="Ingreso del periodo" />
        <PlanVsReal
          label="Ingreso esperado vs recibido"
          totals={summary?.income ?? { expected: 0, real: 0 }}
          status={summaryZone.status}
        />
      </section>

      {SECTIONS.filter((section) => {
        return section.group !== undefined;
      }).map((section) => {
        const group = section.group as BudgetGroupId;
        const budget = summary?.categories.find((category) => {
          return category.id === group;
        });
        const items = itemsOfGroup(group);

        return (
          <section
            key={section.anchor}
            className={styles.section}
            id={section.anchor}
            aria-labelledby={`${section.anchor}-title`}
          >
            <SectionHeader
              id={`${section.anchor}-title`}
              title={section.label}
              totals={
                budget === undefined
                  ? undefined
                  : {
                      planned: budget.planned,
                      real: budget.real,
                      remaining: budget.remainingReal,
                    }
              }
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<PlusIcon size={16} />}
                  onClick={() => {
                    openEditor(null);
                  }}
                >
                  Agregar
                </Button>
              }
            />

            {/* Focusable heading target for the dashboard handoff. */}
            <h3
              className="visually-hidden"
              tabIndex={-1}
              ref={(node) => {
                headingRefs.current[section.anchor] = node;
              }}
            >
              {section.label} — detalle del periodo
            </h3>

            {loading ? (
              <SkeletonList rows={3} height="52px" />
            ) : (
              <>
                <ItemList
                  items={items}
                  onEdit={openEditor}
                  markerOf={(item) => {
                    return item.status === 'cancelled' ? 'Pausado' : null;
                  }}
                  emptyState={
                    <EmptyState
                      compact
                      title={`Sin registros en ${section.label}`}
                      description="Agrega el primer ítem para comparar lo planeado con lo real."
                      action={
                        <Button
                          variant="primary"
                          icon={<PlusIcon size={16} />}
                          onClick={() => {
                            openEditor(null);
                          }}
                        >
                          Agregar
                        </Button>
                      }
                    />
                  }
                />

                {budget === undefined ? null : (
                  <BudgetProgress
                    className={styles.progress}
                    label={`Presupuesto de ${section.label}`}
                    consumed={budget.real}
                    limit={budget.limit}
                    remaining={budget.remainingReal}
                    projectedConsumed={
                      budget.remainingProjected === null ? null : budget.real + budget.planned
                    }
                  />
                )}
              </>
            )}
          </section>
        );
      })}

      <section className={styles.section} id="retiro" aria-label="Retiro de efectivo">
        {loading ? (
          <SkeletonList rows={1} height="140px" />
        ) : summary?.withdrawal === undefined || summary.withdrawal === null ? null : (
          <CashWithdrawalBlock
            withdrawal={summary.withdrawal}
            onEdit={() => {
              openEditor(null);
            }}
            onBreakdown={() => {
              setBreakdownOpen(true);
            }}
          />
        )}
      </section>

      <section className={styles.section} id="movimientos">
        <MovementTable
          movements={movements}
          status={summaryZone.status}
          density={preferences.density}
          hidePlannedDefault={preferences.hidePlannedByDefault}
          hideCancelledDefault={preferences.hideCancelledByDefault}
          onRetry={summaryZone.retry}
          onAdd={() => {
            openEditor(null);
          }}
          onEdit={openEditor}
        />
      </section>

      <section className={styles.section} id="credito" aria-label="Crédito">
        {loading ? (
          <SkeletonList rows={1} height="180px" />
        ) : summary === null ? null : (
          <WorldPanel
            world="credit"
            title="Crédito"
            caption="Las compras aumentan la deuda; los pagos la reducen y no vuelven a contar como gasto."
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    openEditor(null);
                  }}
                >
                  Agregar compra
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    openEditor(null);
                  }}
                >
                  Agregar pago
                </Button>
              </>
            }
          >
            {summary.credit.map((card) => {
              return (
                <div key={card.accountId} className={styles.creditCard}>
                  <FigureGrid
                    figures={[
                      { id: `${card.accountId}-limit`, label: 'Límite', value: card.limit },
                      { id: `${card.accountId}-debt`, label: 'Deuda', value: card.debt },
                      { id: `${card.accountId}-used`, label: 'Crédito utilizado', value: card.used },
                      {
                        id: `${card.accountId}-available`,
                        label: 'Crédito disponible',
                        value: card.available,
                        hint:
                          card.availableProjected === null
                            ? undefined
                            : 'Hay compras planeadas que reducirán este disponible.',
                      },
                    ]}
                  />

                  <h3 className={styles.subheading}>Compras</h3>
                  <ItemList
                    items={card.purchases}
                    onEdit={openEditor}
                    emptyState={
                      <EmptyState
                        compact
                        title="Sin compras registradas"
                        description="Las compras aparecerán aquí conforme las agregues."
                      />
                    }
                  />

                  <h3 className={styles.subheading}>Pagos</h3>
                  <ItemList
                    items={card.payments}
                    onEdit={openEditor}
                    emptyState={
                      <EmptyState
                        compact
                        title="Sin pagos registrados"
                        description="Registra un pago desde Débito o desde el fondo de ahorro."
                      />
                    }
                  />
                </div>
              );
            })}
          </WorldPanel>
        )}
      </section>

      <section className={styles.section} id="klar" aria-label="Fondo Klar">
        {loading ? (
          <SkeletonList rows={1} height="160px" />
        ) : summary?.savingsFund === undefined || summary.savingsFund === null ? null : (
          <WorldPanel
            world="savings"
            title="Fondo Klar"
            caption="El saldo acumulado no es el ahorro del mes."
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  openEditor(null);
                }}
              >
                Depositar o retirar
              </Button>
            }
          >
            <FigureGrid
              columns={1}
              figures={[
                {
                  id: 'fund-balance',
                  label: 'Saldo acumulado',
                  value: summary.savingsFund.accumulatedBalance,
                  size: 'primary',
                },
              ]}
            />
            <ItemList
              items={summary.savingsFund.movements}
              onEdit={openEditor}
              emptyState={
                <EmptyState
                  compact
                  title="Sin movimientos del fondo"
                  description="Deposita, retira o paga tu tarjeta desde el fondo para verlo aquí."
                />
              }
            />
          </WorldPanel>
        )}
      </section>

      <MovementFormDialog
        open={editorOpen}
        movement={editing}
        accounts={summary?.accounts ?? []}
        categories={CATEGORY_OPTIONS}
        templateDriven
        onClose={() => {
          setEditorOpen(false);
        }}
        onSubmit={(draft) => {
          setEditorOpen(false);
          const amount = Number(draft.realAmount || draft.plannedAmount).toFixed(2);
          const transactionId = editing?.id ?? EXTRAS_TX_ID;
          setPendingChange({
            transactionId,
            amount,
            concept: draft.concept,
          });
          setImpactOpen(true);
        }}
      />

      <PropagationImpactDialog
        open={impactOpen}
        originPeriod={periodId}
        originLabel={periodLabel}
        confirming={confirm.isPending}
        deltas={
          previewQuery.data?.diffs.map((diff) => {
            return {
              periodId: diff.periodId,
              concept: formatYearMonth(diff.year, diff.month),
              expenseDelta: Number(diff.deltaExpectedExpense),
              savingsDelta: Number(diff.deltaExpectedSavings),
              balanceDelta: Number(diff.deltaExpectedSavings),
            };
          }) ?? []
        }
        conflicts={[]}
        onClose={() => {
          setImpactOpen(false);
          setPendingChange(null);
        }}
        onConfirm={() => {
          if (pendingChange === null || summaryQuery.data === undefined) {
            return;
          }
          void confirm
            .mutateAsync({
              originPeriodId: periodId,
              expectedPeriodVersion: summaryQuery.data.period.version,
              changes: [
                {
                  kind: 'UPDATE_TRANSACTION',
                  transactionId: pendingChange.transactionId,
                  patch: { amount: pendingChange.amount, concept: pendingChange.concept },
                },
              ],
            })
            .then(() => {
              setImpactOpen(false);
              setPendingChange(null);
              setConflict(false);
              notify('success', 'Cambio confirmado y periodos actualizados.');
            })
            .catch((cause: unknown) => {
              if (cause instanceof ApiError && cause.status === 409) {
                setConflict(true);
                notify('warning', 'Recargar periodo');
                return;
              }
              notify('negative', 'No se pudo confirmar el cambio.');
            });
        }}
      />

      <BreakdownDialog
        open={breakdownOpen}
        title="Efectivo restante"
        description="Movimientos en efectivo del periodo."
        movements={movements.filter((movement) => {
          return movement.accountId === 'acc-cash';
        })}
        onClose={() => {
          setBreakdownOpen(false);
        }}
      />
    </div>
  );
}
