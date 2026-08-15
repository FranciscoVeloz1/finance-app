import { Link } from 'react-router-dom';
import type { PeriodId, TimelineEntry, ZoneStatus } from '../../../types/finance';
import { formatYearMonth } from '../../../utils/dates';
import { classNames } from '../../../utils/classNames';
import { Amount } from '../Amount';
import { Banner } from '../../feedback/Banner';
import { EmptyState } from '../../feedback/EmptyState';
import { SkeletonList } from '../../feedback/Skeleton';
import { Button } from '../../forms/Button';
import { PlusIcon, WarningIcon } from '../../icons';
import styles from './PeriodTimeline.module.css';

interface PeriodTimelineProps {
  entries: TimelineEntry[];
  status: ZoneStatus;
  selectedPeriod: PeriodId;
  onSelect: (periodId: PeriodId) => void;
  onCreatePeriod: () => void;
  onRetry: () => void;
}

/** Chronological ascending; the current period keeps a distinct emphasis. */
export function PeriodTimeline({
  entries,
  status,
  selectedPeriod,
  onSelect,
  onCreatePeriod,
  onRetry,
}: PeriodTimelineProps) {
  return (
    <section className={styles.section} aria-labelledby="timeline-title">
      <h2 className={styles.title} id="timeline-title">
        Línea de tiempo
      </h2>

      {status === 'loading' ? <SkeletonList rows={5} height="56px" /> : null}

      {status === 'error' ? (
        <Banner
          tone="negative"
          title="No pudimos cargar los periodos"
          action={
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          }
        />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          compact
          title="Aún no hay periodos"
          description="Crea tu primer mes para empezar a planear ingresos, gastos y ahorro."
          action={
            <Button variant="primary" icon={<PlusIcon size={16} />} onClick={onCreatePeriod}>
              Crear periodo
            </Button>
          }
        />
      ) : null}

      {status === 'ready' ? (
        <>
          <ul className={styles.list}>
            {entries.map((entry) => {
              const label =
                entry.year !== undefined && entry.month !== undefined
                  ? formatYearMonth(entry.year, entry.month)
                  : entry.periodId;
              const selected = entry.periodId === selectedPeriod;

              return (
                <li
                  key={entry.periodId}
                  className={classNames(styles.row, selected && styles.selectedRow)}
                >
                  <button
                    type="button"
                    className={styles.rowButton}
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => {
                      onSelect(entry.periodId);
                    }}
                  >
                    <span className={styles.rowHead}>
                      <span className={styles.period}>{label}</span>
                      {entry.hasAlert ? (
                        <span className={styles.warning}>
                          <WarningIcon size={14} />
                          <span className="visually-hidden">Periodo con alertas</span>
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.rowMeta}>
                      <span className={styles.metaLabel}>Ahorro esperado</span>
                      <Amount value={entry.expectedSavings} size="derived" signed />
                    </span>
                  </button>

                  <Link
                    className={styles.detail}
                    to={`/mes?periodo=${entry.periodId}`}
                    aria-label={`Ver detalle de ${label}`}
                  >
                    Ver detalle
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button
            variant="secondary"
            className={styles.create}
            icon={<PlusIcon size={16} />}
            onClick={onCreatePeriod}
          >
            Crear periodo futuro
          </Button>
        </>
      ) : null}
    </section>
  );
}
