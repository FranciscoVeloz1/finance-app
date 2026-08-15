import { classNames } from '../../../utils/classNames';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  /** Any CSS length; skeletons must reserve the final layout, not a generic box. */
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1rem', className }: SkeletonProps) {
  return (
    <span
      className={classNames(styles.skeleton, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface SkeletonListProps {
  rows?: number;
  height?: string;
  className?: string;
}

export function SkeletonList({ rows = 3, height = '2.5rem', className }: SkeletonListProps) {
  return (
    <div className={classNames(styles.list, className)}>
      {Array.from({ length: rows }, (_unused, index) => {
        return <Skeleton key={index} height={height} />;
      })}
    </div>
  );
}
