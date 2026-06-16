import {
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { KPICard } from './KPICard';
import type { DashboardData } from '@/hooks/useDashboardData';
import styles from './KPIGrid.module.scss';

type KPIGridProps = {
  data: DashboardData;
};

export function KPIGrid({ data }: KPIGridProps) {
  return (
    <section className={styles.grid} aria-label="Indicadores clave">
      <KPICard
        label="Total incidencias"
        value={data.total}
        variant="yellow"
        icon={ClipboardList}
        large
      />
      <KPICard
        label="Abiertas"
        value={data.open}
        variant="orange"
        icon={AlertCircle}
      />
      <KPICard
        label="Cerradas"
        value={data.closed}
        variant="green"
        icon={CheckCircle2}
      />
      <KPICard
        label="Vencidas"
        value={data.overdue}
        variant="red"
        icon={AlertTriangle}
      />
      <KPICard
        label="Tiempo promedio"
        value={data.avgResolutionLabel}
        variant="purple"
        icon={Timer}
      />
    </section>
  );
}
