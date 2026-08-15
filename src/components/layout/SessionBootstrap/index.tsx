import { Skeleton } from '../../feedback/Skeleton';
import styles from './SessionBootstrap.module.css';

/** Full-screen shell placeholder: no financial value is painted before auth resolves. */
export function SessionBootstrap() {
  return (
    <div className={styles.screen} aria-busy="true">
      <output className="visually-hidden">Validando sesión…</output>
      <div className={styles.header}>
        <Skeleton width="140px" height="20px" />
        <Skeleton width="180px" height="20px" />
      </div>
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </div>
        <div className={styles.content}>
          <Skeleton height="120px" />
          <Skeleton height="72px" />
          <Skeleton height="72px" />
        </div>
      </div>
    </div>
  );
}
