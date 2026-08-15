import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useToast } from '../../hooks/useToast';
import type { Movement } from '../../types/finance';
import { formatYearMonth } from '../../utils/dates';
import { Amount } from '../../components/finance/Amount';
import { AccountSummaryCard } from '../../components/finance/AccountSummaryCard';
import { BreakdownDialog } from '../../components/finance/BreakdownDialog';
import { CategoryBudgetRow } from '../../components/finance/CategoryBudgetRow';
import { FigureGrid } from '../../components/finance/FigureGrid';
import { MetricCard } from '../../components/finance/MetricCard';
import { PeriodTimeline } from '../../components/finance/PeriodTimeline';
import { PlanVsReal } from '../../components/finance/PlanVsReal';
import { SavingsHero } from '../../components/finance/SavingsHero';
import { CoverageBadge } from '../../components/finance/StatusBadge';
import { SuggestionList } from '../../components/finance/SuggestionList';
import { WorldPanel } from '../../components/finance/WorldPanel';
import { Banner } from '../../components/feedback/Banner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { SkeletonList } from '../../components/feedback/Skeleton';
import { PageHeader } from '../../components/layout/PageHeader';
import { CashIcon } from '../../components/icons';
import styles from './DashboardPage.module.css';

interface BreakdownRequest {
  title: string;
  description: string;
  movements: Movement[];
}

export function DashboardPage() {
  const { periodId, setPeriod, year, month, summary, summaryZone, timelineZone } = useDashboardData();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState<BreakdownRequest | null>(null);
  const periodLabel =
    year !== undefined && month !== undefined ? formatYearMonth(year, month) : undefined;

  const loading = summaryZone.status === 'loading';

  const creditPayments = useMemo(() => {
    if (summary === null) {
      return [];
    }

    return summary.credit.flatMap((card) => {
      return card.payments;
    });
  }, [summary]);

  const paymentsTotal = useMemo(() => {
    return creditPayments.reduce((total, payment) => {
      return total + payment.amount;
    }, 0);
  }, [creditPayments]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Resumen del mes"
        description={`Cómo cierra ${periodLabel ?? 'el periodo'} si el plan se cumple.`}
      />

      {/* Focal first in reading order at every breakpoint. */}
      <SavingsHero
        periodId={periodId}
        periodLabel={periodLabel}
        expected={summary?.expectedSavings ?? 0}
        real={summary?.realSavings ?? 0}
        status={summaryZone.status}
        onRetry={summaryZone.retry}
        onConfigure={() => {
          navigate(`/mes?periodo=${periodId}`);
        }}
      />

      {summary !== null && summary.alerts.length > 0 ? (
        <section className={styles.alerts} aria-label="Advertencias relevantes">
          {summary.alerts.map((alert) => {
            return (
              <Banner
                key={alert.id}
                tone={alert.level === 'negative' ? 'negative' : 'warning'}
                title={alert.title}
                description={alert.detail}
              />
            );
          })}
        </section>
      ) : null}

      <div className={styles.columns}>
        <div className={styles.main}>
          <section className={styles.metrics} aria-label="Métricas del periodo">
            <MetricCard
              label="Efectivo disponible"
              value={summary?.availableCash ?? 0}
              status={summaryZone.status}
              world="cash"
              icon={<CashIcon size={18} />}
              subtitle="Débito + Efectivo. No incluye crédito ni fondo de ahorro."
              onRetry={summaryZone.retry}
              onBreakdown={() => {
                setBreakdown({
                  title: 'Efectivo disponible',
                  description: 'Movimientos que componen el disponible del periodo.',
                  movements:
                    summary?.credit[0]?.purchases.filter((movement) => {
                      return movement.kind !== 'credit-purchase';
                    }) ?? [],
                });
              }}
            />

            <PlanVsReal
              label="Ingreso del periodo"
              totals={summary?.income ?? { expected: 0, real: 0 }}
              status={summaryZone.status}
            />

            <PlanVsReal
              label="Gasto del periodo"
              totals={summary?.expense ?? { expected: 0, real: 0 }}
              status={summaryZone.status}
              favourable="lower-real"
            />
          </section>

          <section className={styles.worlds} aria-label="Crédito, efectivo y fondo de ahorro">
            {loading ? <SkeletonList rows={3} height="140px" /> : null}

            {summary === null ? null : (
              <>
                <WorldPanel
                  world="credit"
                  title="Crédito"
                  caption="Deuda y disponible de tarjeta. No forma parte del efectivo."
                >
                  {summary.credit.length === 0 ? (
                    <EmptyState
                      compact
                      title="Sin tarjetas registradas"
                      description="Agrega una cuenta de tipo Crédito para seguir tu deuda y disponible."
                    />
                  ) : (
                    summary.credit.map((card) => {
                      return (
                        <FigureGrid
                          key={card.accountId}
                          figures={[
                            { id: `${card.accountId}-used`, label: 'Crédito utilizado', value: card.used },
                            {
                              id: `${card.accountId}-available`,
                              label: 'Crédito disponible',
                              value: card.available,
                              hint:
                                card.availableProjected === null
                                  ? undefined
                                  : 'Proyectado con compras planeadas',
                            },
                            {
                              id: `${card.accountId}-payments`,
                              label: 'Pagos de tarjeta',
                              value: paymentsTotal,
                              onBreakdown: () => {
                                setBreakdown({
                                  title: 'Pagos de tarjeta',
                                  description:
                                    'Pagos del periodo. Reducen la deuda; no vuelven a contar como gasto.',
                                  movements: creditPayments,
                                });
                              },
                            },
                          ]}
                        />
                      );
                    })
                  )}
                </WorldPanel>

                <WorldPanel
                  world="cash"
                  title="Efectivo"
                  caption="El retiro es una transferencia interna, no un gasto."
                >
                  {summary.withdrawal === null ? (
                    <EmptyState
                      compact
                      title="Sin retiro planeado"
                      description="Cuando definas un retiro para este periodo aparecerá aquí."
                    />
                  ) : (
                    <>
                      <FigureGrid
                        figures={[
                          {
                            id: 'withdrawal',
                            label: 'Retiro de efectivo',
                            value: summary.withdrawal.amount,
                            badge: <CoverageBadge coverage={summary.withdrawal.coverage} />,
                          },
                          {
                            id: 'cash-remaining',
                            label: 'Efectivo restante',
                            value: summary.withdrawal.cashRemaining,
                            signed: true,
                            tone: 'auto',
                          },
                        ]}
                      />
                      <p className={styles.transferNote}>
                        {summary.withdrawal.sourceAccountLabel} →{' '}
                        {summary.withdrawal.targetAccountLabel}
                      </p>
                    </>
                  )}
                </WorldPanel>

                <WorldPanel
                  world="savings"
                  title="Fondo de ahorro"
                  caption="Saldo acumulado del fondo; distinto del ahorro del mes."
                >
                  {summary.savingsFund === null ? (
                    <EmptyState
                      compact
                      title="Sin fondo de ahorro"
                      description="Agrega una cuenta de tipo Fondo de ahorro para seguir tu saldo acumulado."
                    />
                  ) : (
                    <FigureGrid
                      columns={1}
                      figures={[
                        {
                          id: 'fund-balance',
                          label: 'Saldo acumulado',
                          value: summary.savingsFund.accumulatedBalance,
                          size: 'primary',
                          onBreakdown: () => {
                            setBreakdown({
                              title: 'Movimientos del fondo',
                              description: 'Depósitos, retiros y pagos hechos desde el fondo.',
                              movements: summary.savingsFund?.movements ?? [],
                            });
                          },
                        },
                      ]}
                    />
                  )}
                </WorldPanel>
              </>
            )}
          </section>

          <section className={styles.categories} aria-labelledby="categorias-title">
            <h2 className={styles.sectionTitle} id="categorias-title">
              Presupuesto por categoría
            </h2>

            {loading ? <SkeletonList rows={4} height="96px" /> : null}

            {summary === null ? null : (
              <ul className={styles.categoryList}>
                {summary.categories.map((category) => {
                  return (
                    <CategoryBudgetRow
                      key={category.id}
                      category={category}
                      periodId={periodId}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className={styles.aside}>
          <PeriodTimeline
            entries={timelineZone.data ?? []}
            status={timelineZone.status}
            selectedPeriod={periodId}
            onSelect={setPeriod}
            onCreatePeriod={() => {
              notify('info', 'La creación de periodos se habilita con la capa de datos.');
            }}
            onRetry={timelineZone.retry}
          />
        </aside>
      </div>

      {summary === null ? null : (
        <SuggestionList
          suggestions={summary.suggestions}
          onReview={(suggestion) => {
            notify('info', `Revisa "${suggestion.title}" en el detalle del mes.`);
            navigate(`/mes?periodo=${periodId}`);
          }}
        />
      )}

      <section className={styles.accounts} aria-labelledby="cuentas-title">
        <h2 className={styles.sectionTitle} id="cuentas-title">
          Resumen por cuenta
        </h2>

        {loading ? <SkeletonList rows={2} height="120px" /> : null}

        {summary !== null && summary.accounts.length === 0 ? (
          <EmptyState
            compact
            title="Sin cuentas activas"
            description="Configura tus cuentas para ver saldos y movimientos por cuenta."
          />
        ) : null}

        {summary === null ? null : (
          <ul className={styles.accountGrid}>
            {summary.accounts
              .filter((account) => {
                return account.active;
              })
              .map((account) => {
                return (
                  <AccountSummaryCard key={account.id} account={account} periodId={periodId} />
                );
              })}
          </ul>
        )}
      </section>

      <p className={styles.footnote}>
        Ahorro del mes{' '}
        <Amount value={summary?.expectedSavings ?? 0} size="derived" signed /> y saldo del fondo
        son cifras distintas: una es el resultado del periodo, la otra el acumulado.
      </p>

      <BreakdownDialog
        open={breakdown !== null}
        title={breakdown?.title ?? ''}
        description={breakdown?.description}
        movements={breakdown?.movements ?? []}
        onClose={() => {
          setBreakdown(null);
        }}
      />
    </div>
  );
}
