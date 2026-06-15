import type { ReactNode } from 'react';
import styles from './ChartCard.module.scss';

type ChartCardProps = {
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export function ChartCard({ title, children, fullWidth }: ChartCardProps) {
  return (
    <article className={`${styles.card} ${fullWidth ? styles.full : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>{children}</div>
    </article>
  );
}
