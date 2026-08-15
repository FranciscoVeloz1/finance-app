import { useMemo, useState } from 'react';
import type { ItemStatus, Movement, TableDensity, ZoneStatus } from '../../../types/finance';
import { classNames } from '../../../utils/classNames';
import { formatCalendarDate } from '../../../utils/dates';
import { Amount } from '../Amount';
import { StatusBadge } from '../StatusBadge';
import { Banner } from '../../feedback/Banner';
import { EmptyState } from '../../feedback/EmptyState';
import { SkeletonList } from '../../feedback/Skeleton';
import { Button } from '../../forms/Button';
import { Field } from '../../forms/Field';
import { EyeOffIcon, FilterIcon, PlusIcon } from '../../icons';
import styles from './MovementTable.module.css';

type StatusFilter = ItemStatus | 'all';

interface MovementTableProps {
  movements: Movement[];
  status: ZoneStatus;
  density: TableDensity;
  hidePlannedDefault: boolean;
  hideCancelledDefault: boolean;
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (movement: Movement) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'planned', label: 'Planeado' },
  { value: 'realized', label: 'Realizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function MovementTable({
  movements,
  status,
  density,
  hidePlannedDefault,
  hideCancelledDefault,
  onRetry,
  onAdd,
  onEdit,
}: MovementTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [hidePlanned, setHidePlanned] = useState(hidePlannedDefault);
  const [hideCancelled, setHideCancelled] = useState(hideCancelledDefault);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const accounts = useMemo(() => {
    const byId = new Map<string, string>();

    for (const movement of movements) {
      byId.set(movement.accountId, movement.accountLabel);
    }

    return [...byId.entries()];
  }, [movements]);

  const visible = useMemo(() => {
    return movements.filter((movement) => {
      if (statusFilter !== 'all' && movement.status !== statusFilter) {
        return false;
      }

      if (accountFilter !== 'all' && movement.accountId !== accountFilter) {
        return false;
      }

      if (fromDate !== '' && movement.date < fromDate) {
        return false;
      }

      if (hidePlanned && movement.status === 'planned') {
        return false;
      }

      if (hideCancelled && movement.status === 'cancelled') {
        return false;
      }

      return true;
    });
  }, [movements, statusFilter, accountFilter, fromDate, hidePlanned, hideCancelled]);

  const activeChips = [
    statusFilter === 'all' ? null : STATUS_OPTIONS.find((option) => {
      return option.value === statusFilter;
    })?.label,
    accountFilter === 'all'
      ? null
      : accounts.find(([id]) => {
          return id === accountFilter;
        })?.[1],
    fromDate === '' ? null : `Desde ${formatCalendarDate(fromDate)}`,
  ].filter((chip): chip is string => {
    return typeof chip === 'string';
  });

  return (
    <section className={styles.section} aria-labelledby="movimientos-title">
      <header className={styles.header}>
        <h2 className={styles.title} id="movimientos-title">
          Movimientos
        </h2>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            size="sm"
            icon={<FilterIcon size={16} />}
            aria-expanded={filtersOpen}
            onClick={() => {
              setFiltersOpen((current) => {
                return !current;
              });
            }}
          >
            Filtros
          </Button>
          <Button
            variant="primary"
            size="sm"
            className={styles.addDesktop}
            icon={<PlusIcon size={16} />}
            onClick={onAdd}
          >
            Agregar movimiento
          </Button>
        </div>
      </header>

      {activeChips.length > 0 ? (
        <ul className={styles.chips}>
          {activeChips.map((chip) => {
            return (
              <li key={chip} className={styles.chip}>
                {chip}
              </li>
            );
          })}
        </ul>
      ) : null}

      {filtersOpen ? (
        <div className={styles.filters}>
          <Field label="Estado">
            {({ id }) => {
              return (
                <select
                  id={id}
                  className="control"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.currentTarget.value as StatusFilter);
                  }}
                >
                  {STATUS_OPTIONS.map((option) => {
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
              );
            }}
          </Field>

          <Field label="Cuenta">
            {({ id }) => {
              return (
                <select
                  id={id}
                  className="control"
                  value={accountFilter}
                  onChange={(event) => {
                    setAccountFilter(event.currentTarget.value);
                  }}
                >
                  <option value="all">Todas las cuentas</option>
                  {accounts.map(([accountId, label]) => {
                    return (
                      <option key={accountId} value={accountId}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              );
            }}
          </Field>

          <Field label="Desde">
            {({ id }) => {
              return (
                <input
                  id={id}
                  className="control"
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.currentTarget.value);
                  }}
                />
              );
            }}
          </Field>
        </div>
      ) : null}

      <div className={styles.visibility}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={hidePlanned}
            onChange={(event) => {
              setHidePlanned(event.currentTarget.checked);
            }}
          />
          <EyeOffIcon size={14} />
          Ocultar planeados
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={hideCancelled}
            onChange={(event) => {
              setHideCancelled(event.currentTarget.checked);
            }}
          />
          <EyeOffIcon size={14} />
          Ocultar cancelados
        </label>
        <p className={styles.visibilityNote}>
          Ocultar registros solo cambia esta lista: los totales del resumen no se modifican.
        </p>
      </div>

      {status === 'loading' ? <SkeletonList rows={6} height="44px" /> : null}

      {status === 'error' ? (
        <Banner
          tone="negative"
          title="No pudimos cargar los movimientos"
          description="Puedes reintentar sin perder los filtros aplicados."
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
          title="Sin movimientos"
          description="Registra el primer movimiento del periodo para empezar a comparar plan y realidad."
          action={
            <Button variant="primary" icon={<PlusIcon size={16} />} onClick={onAdd}>
              Agregar movimiento
            </Button>
          }
        />
      ) : null}

      {status === 'ready' && visible.length === 0 ? (
        <EmptyState
          compact
          title="Ningún movimiento coincide"
          description="Ajusta los filtros o vuelve a mostrar los estados ocultos."
        />
      ) : null}

      {status === 'ready' && visible.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={classNames(styles.table, density === 'compact' && styles.compact)}>
            <caption className="visually-hidden">
              Movimientos del periodo con fecha, concepto, categoría, cuenta, monto y estado.
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.stickyColumn}>
                  Fecha
                </th>
                <th scope="col">Concepto</th>
                <th scope="col" className={styles.secondaryColumn}>
                  Categoría
                </th>
                <th scope="col" className={styles.secondaryColumn}>
                  Cuenta
                </th>
                <th scope="col" className={styles.numericColumn}>
                  Monto
                </th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((movement) => {
                const transfer = movement.kind === 'transfer';

                return (
                  <tr
                    key={movement.id}
                    className={classNames(
                      styles.row,
                      styles[movement.status],
                      transfer && styles.transferRow,
                    )}
                  >
                    <td className={classNames(styles.stickyColumn, 'tabular')} data-label="Fecha">
                      {formatCalendarDate(movement.date)}
                    </td>
                    <td data-label="Concepto">
                      <span className={styles.concept}>{movement.concept}</span>
                      {movement.overridden === true ? (
                        <span className={styles.override} title="Editado sobre la plantilla">
                          Override
                        </span>
                      ) : null}
                    </td>
                    {/* Transfers are not spending, so they never claim a spend category. */}
                    <td className={styles.secondaryColumn} data-label="Categoría">
                      {transfer ? '—' : (movement.categoryLabel ?? '—')}
                    </td>
                    <td className={styles.secondaryColumn} data-label="Cuenta">
                      {movement.accountLabel}
                    </td>
                    <td className={styles.numericColumn} data-label="Monto">
                      <Amount value={movement.amount} size="derived" tone="neutral" />
                    </td>
                    <td data-label="Estado">
                      <StatusBadge state={transfer ? 'transfer' : movement.status} />
                    </td>
                    <td className={styles.actionCell}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Editar ${movement.concept}`}
                        onClick={() => {
                          onEdit(movement);
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Mobile FAB keeps the primary action reachable with one thumb. */}
      <Button
        variant="primary"
        className={styles.fab}
        aria-label="Agregar movimiento"
        onClick={onAdd}
      >
        <PlusIcon size={20} />
      </Button>
    </section>
  );
}
