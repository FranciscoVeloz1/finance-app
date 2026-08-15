import { useId } from 'react';
import { classNames } from '../../../utils/classNames';
import styles from './Switch.module.css';

interface SwitchProps {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/** Native checkbox underneath: keyboard, form semantics and label wiring for free. */
export function Switch({
  label,
  hint,
  checked,
  disabled = false,
  onChange,
  className,
}: SwitchProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className={classNames(styles.row, className)}>
      <div className={styles.text}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {hint === undefined ? null : (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        )}
      </div>

      <span className={styles.control}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={styles.input}
          checked={checked}
          aria-checked={checked}
          disabled={disabled}
          aria-describedby={hint === undefined ? undefined : hintId}
          onChange={(event) => {
            onChange(event.currentTarget.checked);
          }}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
    </div>
  );
}
