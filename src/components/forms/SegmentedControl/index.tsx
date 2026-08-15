import { useId } from 'react';
import { classNames } from '../../../utils/classNames';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SegmentedControlProps<TValue extends string> {
  legend: string;
  options: SegmentOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
}

/** Radio group under the hood: arrow keys and roving focus come from the browser. */
export function SegmentedControl<TValue extends string>({
  legend,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<TValue>) {
  const name = useId();

  return (
    <fieldset className={classNames(styles.fieldset, className)}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.group}>
        {options.map((option) => {
          return (
            <label
              key={option.value}
              className={classNames(styles.option, option.value === value && styles.selected)}
            >
              <input
                type="radio"
                name={name}
                className={styles.input}
                value={option.value}
                checked={option.value === value}
                onChange={() => {
                  onChange(option.value);
                }}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
