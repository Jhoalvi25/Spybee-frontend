import type { LucideIcon } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './KPICard.module.scss';

type KPICardProps = {
  label: string;
  value: string | number;
  variant?: 'yellow' | 'green' | 'gray' | 'red' | 'purple' | 'orange';
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  large?: boolean;
  tooltip?: string;
  delay?: number;
};

export function KPICard({ label, value, variant = 'yellow', icon: Icon, trend, large, tooltip, delay }: KPICardProps) {
  const card = (
    <article
      className={`${styles.card} ${styles[variant]} ${large ? styles.large : ''}`}
      style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}
    >
      {Icon && (
        <div className={styles.iconWrap}>
          <Icon size={large ? 22 : 18} />
        </div>
      )}
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {trend && (
          <span className={`${styles.trend} ${trend.positive ? styles.trendUp : styles.trendDown}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </article>
  );

  if (tooltip) {
    return <Tooltip label={tooltip}>{card}</Tooltip>;
  }

  return card;
}
