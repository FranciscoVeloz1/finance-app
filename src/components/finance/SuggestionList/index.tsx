import { useState } from 'react';
import type { Suggestion } from '../../../types/finance';
import { Button } from '../../forms/Button';
import { InfoIcon } from '../../icons';
import styles from './SuggestionList.module.css';

interface SuggestionListProps {
  suggestions: Suggestion[];
  /** "Aceptar" navigates or focuses; it never writes data on its own. */
  onReview: (suggestion: Suggestion) => void;
}

export function SuggestionList({ suggestions, onReview }: SuggestionListProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = suggestions.filter((suggestion) => {
    return !dismissed.includes(suggestion.id);
  });

  // The section disappears entirely rather than showing an empty placeholder.
  if (visible.length === 0) {
    return null;
  }

  return (
    <details className={styles.section}>
      <summary className={styles.summary}>
        <InfoIcon size={16} />
        Sugerencias informativas
        <span className={styles.count}>{visible.length}</span>
      </summary>

      <ul className={styles.list}>
        {visible.map((suggestion) => {
          return (
            <li key={suggestion.id} className={styles.card}>
              <h3 className={styles.title}>{suggestion.title}</h3>
              <p className={styles.explanation}>{suggestion.explanation}</p>
              <p className={styles.origin}>Origen: {suggestion.origin}</p>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onReview(suggestion);
                  }}
                >
                  Revisar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDismissed((current) => {
                      return [...current, suggestion.id];
                    });
                  }}
                >
                  Descartar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
