import { KPICard } from './KPICard';
import type { DashboardData } from '@/hooks/useDashboardData';
import styles from './KPIGrid.module.scss';

type KPIGridProps = {
  data: DashboardData;
};

export function KPIGrid({ data }: KPIGridProps) {
  return (
    <section className={styles.grid} aria-label="Indicadores clave">
      <KPICard label="Total incidencias" value={data.total} variant="blue" icon="📋" />
      <KPICard label="Abiertas" value={data.open} variant="green" icon="🟢" />
      <KPICard label="Cerradas" value={data.closed} variant="gray" icon="✅" />
      <KPICard label="Vencidas" value={data.overdue} variant="red" icon="⚠️" />
      <KPICard label="Tiempo promedio" value={data.avgResolutionLabel} variant="purple" icon="⏱️" />
    </section>
  );
}
