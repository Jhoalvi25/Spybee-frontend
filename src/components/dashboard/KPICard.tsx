import type { LucideIcon } from 'lucide-react';
import styles from './KPICard.module.scss';

type KPICardProps = {
  label: string;
  value: string | number;
  variant?: 'yellow' | 'green' | 'gray' | 'red' | 'purple' | 'orange';
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  large?: boolean;
};

export function KPICard({ label, value, variant = 'yellow', icon: Icon, trend, large }: KPICardProps) {
  return (
    <article className={`${styles.card} ${styles[variant]} ${large ? styles.large : ''}`}>
      {Icon && (
        <div className={styles.iconWrap}>
          <Icon size={large ? 24 : 20} />
        </div>
      )}
      <div className={styles.body}>
        <span className={`${styles.value} ${large ? styles.valueLarge : ''}`}>{value}</span>
        <span className={styles.label}>{label}</span>
        {trend && (
          <span className={`${styles.trend} ${trend.positive ? styles.trendUp : styles.trendDown}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </article>
  );
}
