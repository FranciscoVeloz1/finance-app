import type { ZoneStatus } from '../../../types/finance';
import { formatPeriodLabel } from '../../../utils/dates';
import { Amount } from '../Amount';
import { Banner } from '../../feedback/Banner';
import { Button } from '../../forms/Button';
import { Skeleton } from '../../feedback/Skeleton';
import styles from './SavingsHero.module.css';

interface SavingsHeroProps {
  periodId: string;
  periodLabel?: string;
  expected: number;
  real: number;
  status: ZoneStatus;
  onRetry: () => void;
  onConfigure?: () => void;
}

/**
 * The one hero figure of the app: how much is left to save when the month
 * closes. It is first in reading order at every breakpoint.
 */
export function SavingsHero({
  periodId,
  periodLabel,
  expected,
  real,
  status,
  onRetry,
  onConfigure,
}: SavingsHeroProps) {
  const label = periodLabel ?? formatPeriodLabel(periodId);

  if (status === 'loading') {
    return (
      <section className={styles.hero} aria-busy="true">
        <Skeleton width="180px" height="1rem" />
        <Skeleton width="260px" height="2.5rem" />
        <Skeleton width="320px" height="1rem" />
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className={styles.hero}>
        <Banner
          tone="negative"
          title="No pudimos calcular tu ahorro"
          description="El resto del resumen puede seguir disponible."
          action={
            <Button variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          }
        />
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section className={styles.hero}>
        <h2 className={styles.label}>Ahorro esperado al cierre</h2>
        <p className={styles.emptyTitle}>Sin proyección para {label}</p>
        <p className={styles.emptyBody}>
          Configura los ingresos y presupuestos del periodo para ver tu ahorro estimado.
        </p>
        {onConfigure === undefined ? null : (
          <Button variant="primary" onClick={onConfigure}>
            Configurar mes
          </Button>
        )}
      </section>
    );
  }

  const difference = real - expected;

  return (
    <section className={styles.hero} aria-labelledby="hero-ahorro">
      <div className={styles.focal}>
        <h2 className={styles.label} id="hero-ahorro">
          Ahorro esperado al cierre · {label}
        </h2>
        <Amount value={expected} size="display" signed />
        <p className={styles.context}>
          Es lo que quedaría si se cumple el plan del periodo.
        </p>
      </div>

      <dl className={styles.pair}>
        <div className={styles.pairItem}>
          <dt className={styles.pairLabel}>Ahorro real</dt>
          <dd className={styles.pairValue}>
            <Amount value={real} size="primary" signed />
          </dd>
        </div>
        <div className={styles.pairItem}>
          <dt className={styles.pairLabel}>Diferencia</dt>
          <dd className={styles.pairValue}>
            <Amount value={difference} size="primary" signed />
          </dd>
        </div>
      </dl>

      {expected < 0 ? (
        <Banner
          tone="negative"
          title="Tu proyección de cierre es negativa"
          description="Con el plan actual el periodo cierra con déficit. Revisa presupuestos y compromisos planeados."
          className={styles.alert}
        />
      ) : null}
    </section>
  );
}
