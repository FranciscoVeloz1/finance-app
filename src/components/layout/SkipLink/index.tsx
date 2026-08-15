import styles from './SkipLink.module.css';

export const MAIN_CONTENT_ID = 'contenido-principal';

/** First tab stop of the authenticated shell. */
export function SkipLink() {
  return (
    <a className={styles.link} href={`#${MAIN_CONTENT_ID}`}>
      Saltar al contenido
    </a>
  );
}
