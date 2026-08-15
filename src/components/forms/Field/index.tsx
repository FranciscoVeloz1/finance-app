import { useId, type ReactNode } from 'react';
import { classNames } from '../../../utils/classNames';
import { WarningIcon } from '../../icons';
import styles from './Field.module.css';

interface FieldRenderArgs {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Receives the wiring so the control keeps its own semantics. */
  children: (args: FieldRenderArgs) => ReactNode;
}

/**
 * Label, control, hint and error in one accessible unit. Placeholders never
 * replace the label (15-ux-ui-responsive-and-accessibility).
 */
export function Field({ label, hint, error, required = false, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = error !== undefined && error.length > 0;

  const describedByParts: string[] = [];

  if (hint !== undefined) {
    describedByParts.push(hintId);
  }

  if (invalid) {
    describedByParts.push(errorId);
  }

  return (
    <div className={classNames(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children({
        id,
        describedBy: describedByParts.length > 0 ? describedByParts.join(' ') : undefined,
        invalid,
      })}

      {hint === undefined ? null : (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}

      {invalid ? (
        <p className={styles.error} id={errorId}>
          <WarningIcon size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
