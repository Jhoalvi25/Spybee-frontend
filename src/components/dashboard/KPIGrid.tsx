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

const KPI_CONFIG = [
  { label: 'Total incidencias', key: 'total' as const, variant: 'yellow' as const, icon: ClipboardList, large: true, tooltip: 'Todas las incidencias registradas en el proyecto' },
  { label: 'Abiertas', key: 'open' as const, variant: 'orange' as const, icon: AlertCircle, large: false, tooltip: 'Incidencias pendientes por resolver' },
  { label: 'Cerradas', key: 'closed' as const, variant: 'green' as const, icon: CheckCircle2, large: false, tooltip: 'Incidencias solucionadas y cerradas' },
  { label: 'Vencidas', key: 'overdue' as const, variant: 'red' as const, icon: AlertTriangle, large: false, tooltip: 'Incidencias que excedieron el plazo de resolución' },
  { label: 'Tiempo promedio', key: 'avgResolutionLabel' as const, variant: 'purple' as const, icon: Timer, large: false, tooltip: 'Tiempo medio de resolución de incidencias' },
] as const;

export function KPIGrid({ data }: KPIGridProps) {
  return (
    <section className={styles.grid} aria-label="Indicadores clave">
      {KPI_CONFIG.map((cfg, i) => (
        <KPICard
          key={cfg.key}
          label={cfg.label}
          value={data[cfg.key]}
          variant={cfg.variant}
          icon={cfg.icon}
          large={cfg.large}
          tooltip={cfg.tooltip}
          delay={i * 0.08}
        />
      ))}
    </section>
  );
}
