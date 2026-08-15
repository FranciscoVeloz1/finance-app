import type { CashWithdrawalSummary } from '../../../types/finance';
import { Amount } from '../Amount';
import { CoverageBadge, PlainBadge } from '../StatusBadge';
import { Banner } from '../../feedback/Banner';
import { Button } from '../../forms/Button';
import { TransferIcon } from '../../icons';
import styles from './CashWithdrawalBlock.module.css';

interface CashWithdrawalBlockProps {
  withdrawal: CashWithdrawalSummary;
  onEdit: () => void;
  onBreakdown: () => void;
}

/**
 * A withdrawal moves money between the user's own accounts. It is never styled
 * like a category expense, or the month would look spent twice.
 */
export function CashWithdrawalBlock({
  withdrawal,
  onEdit,
  onBreakdown,
}: CashWithdrawalBlockProps) {
  return (
    <section className={styles.block} aria-labelledby="retiro-title">
      <header className={styles.header}>
        <h2 className={styles.title} id="retiro-title">
          <TransferIcon size={18} />
          Transferencia a Efectivo
        </h2>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar retiro
        </Button>
      </header>

      <p className={styles.note}>
        Es un movimiento interno entre tus cuentas: no cuenta como gasto ni como ingreso.
      </p>

      <div className={styles.flow}>
        <span className={styles.node}>{withdrawal.sourceAccountLabel}</span>
        <TransferIcon size={18} />
        <span className={styles.node}>{withdrawal.targetAccountLabel}</span>
      </div>

      <div className={styles.figures}>
        <div className={styles.figure}>
          <span className={styles.figureLabel}>
            Monto del retiro
            {withdrawal.overridden ? <PlainBadge tone="override">Override</PlainBadge> : null}
          </span>
          <Amount value={withdrawal.amount} size="primary" tone="neutral" />
          <CoverageBadge coverage={withdrawal.coverage} />
        </div>

        <div className={styles.figure}>
          <span className={styles.figureLabel}>Efectivo restante</span>
          <Amount value={withdrawal.cashRemaining} size="secondary" signed />
          <Button variant="ghost" size="sm" className={styles.breakdown} onClick={onBreakdown}>
            Ver desglose
          </Button>
        </div>
      </div>

      {withdrawal.coverage === 'insufficient' ? (
        <Banner
          tone="negative"
          title="El retiro no cubre el consumo planeado"
          description="Aumenta el retiro o ajusta los presupuestos que se pagan en efectivo."
        />
      ) : null}

      {withdrawal.coverage === 'surplus' ? (
        <Banner
          tone="warning"
          title="Retiraste más de lo que planeas gastar"
          description="El excedente queda en Efectivo y no se refleja como ahorro del periodo."
        />
      ) : null}
    </section>
  );
}
