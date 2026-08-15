import { classNames } from '../../../utils/classNames';
import { amountTone, describeAmount, formatMXN, formatSignedMXN } from '../../../utils/money';
import styles from './Amount.module.css';

export type AmountSize = 'display' | 'primary' | 'secondary' | 'derived';

interface AmountProps {
  value: number;
  size?: AmountSize;
  /** Renders `+`/`−` and colors by sign; use for deltas and savings. */
  signed?: boolean;
  /** Forces a neutral tone even when signed, for magnitudes that carry no verdict. */
  tone?: 'auto' | 'neutral';
  className?: string;
}

export function Amount({
  value,
  size = 'primary',
  signed = false,
  tone = 'auto',
  className,
}: AmountProps) {
  const resolvedTone = tone === 'neutral' ? 'neutral' : amountTone(value);
  const text = signed ? formatSignedMXN(value) : formatMXN(value);

  return (
    <span
      className={classNames('tabular', styles.amount, styles[size], styles[resolvedTone], className)}
    >
      <span aria-hidden="true">{text}</span>
      {/* "+" and "−" are read inconsistently by screen readers. */}
      <span className="visually-hidden">{describeAmount(value)}</span>
    </span>
  );
}
