import type { PeriodId, PropagationConflict, PropagationDelta } from '../../../types/finance';
import { formatPeriodLabel } from '../../../utils/dates';
import { Amount } from '../../finance/Amount';
import { Banner } from '../../feedback/Banner';
import { EmptyState } from '../../feedback/EmptyState';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import styles from './PropagationImpactDialog.module.css';

interface PropagationImpactDialogProps {
  open: boolean;
  originPeriod: PeriodId;
  originLabel?: string;
  deltas: PropagationDelta[];
  conflicts: PropagationConflict[];
  confirming: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Read-only preview. Nothing is written until the user confirms, and while the
 * confirmation runs the dialog refuses to close.
 */
export function PropagationImpactDialog({
  open,
  originPeriod,
  originLabel,
  deltas,
  conflicts,
  confirming,
  onClose,
  onConfirm,
}: PropagationImpactDialogProps) {
  const affectedPeriods = new Set(
    deltas.map((delta) => {
      return delta.periodId;
    }),
  );

  return (
    <Dialog
      open={open}
      size="lg"
      busy={confirming}
      title="Impacto en meses futuros"
      description="Revisa qué cambia antes de confirmar. Todavía no se guarda nada."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" disabled={confirming} onClick={onClose}>
            Descartar
          </Button>
          <Button variant="primary" loading={confirming} onClick={onConfirm}>
            Confirmar propagación
          </Button>
        </>
      }
    >
      <p className={styles.origin}>
        Periodo de origen: <strong>{originLabel ?? formatPeriodLabel(originPeriod)}</strong> ·{' '}
        {affectedPeriods.size} periodo(s) afectado(s)
      </p>

      {deltas.length === 0 ? (
        <EmptyState
          compact
          title="Sin impacto en periodos futuros"
          description="Este cambio solo afecta al periodo donde lo estás editando."
        />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <caption className="visually-hidden">
              Diferencias por periodo en gasto esperado, ahorro y saldo.
            </caption>
            <thead>
              <tr>
                <th scope="col">Periodo</th>
                <th scope="col">Concepto</th>
                <th scope="col" className={styles.numeric}>
                  Δ Gasto esperado
                </th>
                <th scope="col" className={styles.numeric}>
                  Δ Ahorro
                </th>
                <th scope="col" className={styles.numeric}>
                  Δ Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {deltas.map((delta) => {
                return (
                  <tr key={`${delta.periodId}-${delta.concept}`}>
                    <td data-label="Periodo">
                      {delta.periodId.length === 36 ? delta.concept : formatPeriodLabel(delta.periodId)}
                    </td>
                    <td data-label="Concepto">{delta.concept}</td>
                    <td className={styles.numeric} data-label="Δ Gasto esperado">
                      <Amount value={delta.expenseDelta} size="derived" signed />
                    </td>
                    <td className={styles.numeric} data-label="Δ Ahorro">
                      <Amount value={delta.savingsDelta} size="derived" signed />
                    </td>
                    <td className={styles.numeric} data-label="Δ Saldo">
                      <Amount value={delta.balanceDelta} size="derived" signed />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {conflicts.length > 0 ? (
        <div className={styles.conflicts}>
          <Banner
            tone="warning"
            title="Se sobrescribirían valores editados a mano"
            description="Estos periodos tienen ajustes puntuales que la propagación reemplazaría."
          />
          <ul className={styles.conflictList}>
            {conflicts.map((conflict) => {
              return (
                <li key={`${conflict.periodId}-${conflict.concept}`} className={styles.conflict}>
                  <span className={styles.conflictPeriod}>
                    {formatPeriodLabel(conflict.periodId)}
                  </span>
                  <span>{conflict.concept}</span>
                  <span className={styles.conflictReason}>{conflict.reason}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Dialog>
  );
}
