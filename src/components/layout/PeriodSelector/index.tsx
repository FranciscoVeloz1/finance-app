import { useFinancePeriods } from '../../../hooks/useFinancePeriods';
import { useSelectedPeriod } from '../../../hooks/useSelectedPeriod';
import { formatYearMonth } from '../../../utils/dates';
import { Button } from '../../forms/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons';
import styles from './PeriodSelector.module.css';

interface PeriodSelectorProps {
  missing?: boolean;
  onCreatePeriod?: () => void;
  showTemporalBadge?: boolean;
}

export function PeriodSelector({ missing = false, onCreatePeriod }: PeriodSelectorProps) {
  const { periodId, setPeriod } = useSelectedPeriod();
  const periodsQuery = useFinancePeriods();
  const options = periodsQuery.data?.periods ?? [];
  const index = options.findIndex((period) => period.id === periodId);
  const current = index >= 0 ? options[index] : undefined;

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Periodo anterior"
          disabled={index <= 0}
          onClick={() => {
            const previous = options[index - 1];
            if (previous) {
              setPeriod(previous.id);
            }
          }}
        >
          <ChevronLeftIcon size={20} />
        </Button>

        <div className={styles.current}>
          <select
            className={styles.select}
            aria-label="Periodo"
            value={current?.id ?? ''}
            onChange={(event) => {
              setPeriod(event.currentTarget.value);
            }}
          >
            {options.map((option) => {
              return (
                <option key={option.id} value={option.id}>
                  {formatYearMonth(option.year, option.month)}
                </option>
              );
            })}
          </select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Periodo siguiente"
          disabled={index < 0 || index >= options.length - 1}
          onClick={() => {
            const next = options[index + 1];
            if (next) {
              setPeriod(next.id);
            }
          }}
        >
          <ChevronRightIcon size={20} />
        </Button>
      </div>

      {missing ? (
        <p className={styles.missing}>
          <span>Este periodo aún no existe.</span>
          {onCreatePeriod === undefined ? null : (
            <Button variant="ghost" size="sm" onClick={onCreatePeriod}>
              Crear periodo
            </Button>
          )}
        </p>
      ) : null}
    </div>
  );
}
