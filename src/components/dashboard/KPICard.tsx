import styles from './KPICard.module.scss';

type KPICardProps = {
  label: string;
  value: string | number;
  variant?: 'blue' | 'green' | 'gray' | 'red' | 'purple';
  icon?: string;
};

export function KPICard({ label, value, variant = 'blue', icon }: KPICardProps) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      {icon && (
        <div className={styles.iconWrap}>
          <span className={styles.icon}>{icon}</span>
        </div>
      )}
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </article>
  );
}
