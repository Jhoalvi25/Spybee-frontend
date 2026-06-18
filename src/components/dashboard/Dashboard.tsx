'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useIncidents,
  useLoadIncidents,
  useIsLoading,
  useError,
  useFilters,
  useResetFilters,
} from '@/domain/incident/hooks';
import { useProjectStore } from '@/domain/project/store';
import { FilterBar } from '@/components/layout/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CreateIncidentModal } from '@/components/incident/CreateIncidentModal';
import { KPIGrid } from './KPIGrid';
import { StatusDonut } from './StatusDonut';
import { PriorityDonut } from './PriorityDonut';
import { CategoryBar } from './CategoryBar';
import { TrendLine } from './TrendLine';
import styles from './Dashboard.module.scss';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'Activo', className: 'badgeActive' },
  completed: { label: 'Completado', className: 'badgeCompleted' },
  on_hold: { label: 'En pausa', className: 'badgeHold' },
};

function useLastUpdate() {
  const [label, setLabel] = useState('Hace unos segundos');
  const tsRef = useRef(Date.now());

  useEffect(() => {
    tsRef.current = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - tsRef.current) / 1000);
      if (elapsed < 5) setLabel('Hace unos segundos');
      else if (elapsed < 60) setLabel(`Hace ${elapsed} segundos`);
      else if (elapsed < 120) setLabel('Hace 1 minuto');
      else setLabel(`Hace ${Math.floor(elapsed / 60)} minutos`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  return label;
}

export function Dashboard() {
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();
  const error = useError();
  const allIncidents = useIncidents();
  const data = useDashboardData();
  const filters = useFilters();
  const resetFilters = useResetFilters();
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const stats = useProjectStore((s) => s.stats);

  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const lastUpdateLabel = useLastUpdate();

  const filtersActive =
    !!filters.status || !!filters.priority || !!filters.typeKey || !!filters.search || !!filters.projectId;

  const handleRetry = useCallback(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const badge = selectedProject ? STATUS_BADGE[selectedProject.status] : null;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroBody}>
            <div className={styles.heroTop}>
              <span className={styles.heroEyebrow}>Supervisión inteligente de obra</span>
            </div>
            <h1 className={styles.heroTitle}>Centro de Operaciones</h1>
            <p className={styles.heroSub}>Monitoreo de incidencias en tiempo real</p>
            <div className={styles.heroLive}>
              <span className={styles.liveDot} />
              <span>Monitoreo en tiempo real</span>
            </div>
          </div>
        </div>
        <div className={styles.skeletonGrid}>
          <div className={styles.skelCard} style={{ animationDelay: '0s' }} />
          <div className={styles.skelCard} style={{ animationDelay: '0.06s' }} />
          <div className={styles.skelCard} style={{ animationDelay: '0.12s' }} />
          <div className={styles.skelCard} style={{ animationDelay: '0.18s' }} />
          <div className={styles.skelCard} style={{ animationDelay: '0.24s' }} />
        </div>
        <div className={styles.skelCharts}>
          <div className={styles.skelChart} />
          <div className={styles.skelChart} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroBody}>
            <div className={styles.heroTop}>
              <span className={styles.heroEyebrow}>Supervisión inteligente de obra</span>
            </div>
            <h1 className={styles.heroTitle}>Centro de Operaciones</h1>
            <p className={styles.heroSub}>Monitoreo de incidencias en tiempo real</p>
          </div>
        </div>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (allIncidents.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroBody}>
            <div className={styles.heroTop}>
              <span className={styles.heroEyebrow}>Supervisión inteligente de obra</span>
              {badge && (
                <span className={`${styles.heroBadge} ${styles[badge.className]}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <h1 className={styles.heroTitle}>
              {selectedProject ? selectedProject.name : 'Centro de Operaciones'}
            </h1>
            {selectedProject && (
              <p className={styles.heroMeta}>
                <MapPin size={14} />
                {selectedProject.address}
              </p>
            )}
            <p className={styles.heroSub}>Monitoreo de incidencias en tiempo real</p>
            <div className={styles.heroLive}>
              <span className={styles.liveDot} />
              <span>Monitoreo en tiempo real</span>
            </div>
          </div>
        </div>
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="No hay incidencias"
          description="Aún no se han registrado incidencias en esta obra. Crea la primera para comenzar."
          action={{ label: 'Crear incidencia', onClick: handleCreate }}
        />
        <CreateIncidentModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    );
  }

  if (filtersActive && data.total === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroBody}>
            <div className={styles.heroTop}>
              <span className={styles.heroEyebrow}>Supervisión inteligente de obra</span>
              {badge && (
                <span className={`${styles.heroBadge} ${styles[badge.className]}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <h1 className={styles.heroTitle}>
              {selectedProject ? selectedProject.name : 'Centro de Operaciones'}
            </h1>
            {selectedProject && (
              <p className={styles.heroMeta}>
                <MapPin size={14} />
                {selectedProject.address}
              </p>
            )}
            <p className={styles.heroSub}>Monitoreo de incidencias en tiempo real</p>
            <div className={styles.heroLive}>
              <span className={styles.liveDot} />
              <span>Monitoreo en tiempo real</span>
            </div>
          </div>
        </div>
        <FilterBar />
        <EmptyState
          icon={<AlertTriangle size={40} />}
          title="Sin resultados"
          description="No se encontraron incidencias con los filtros seleccionados. Intenta con otros criterios."
          action={{ label: 'Limpiar filtros', onClick: handleClearFilters }}
        />
      </div>
    );
  }

  return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroBody}>
            <div className={styles.heroTop}>
              <span className={styles.heroEyebrow}>Supervisión inteligente de obra</span>
              {badge && (
                <span className={`${styles.heroBadge} ${styles[badge.className]}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <h1 className={styles.heroTitle}>
              {selectedProject ? selectedProject.name : 'Centro de Operaciones'}
            </h1>
            {selectedProject && (
              <p className={styles.heroMeta}>
                <MapPin size={14} />
                {selectedProject.address}
              </p>
            )}
            <p className={styles.heroSub}>
              Monitoreo de incidencias en tiempo real
            </p>
            <div className={styles.heroLive}>
              <span className={styles.liveDot} />
              <span>Monitoreo en tiempo real</span>
            </div>
            <p className={styles.heroUpdated}>
              Última actualización: {lastUpdateLabel}
            </p>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroQuickItem}>
              <span className={styles.heroQuickValue}>{data.total}</span>
              <span className={styles.heroQuickLabel}>Total</span>
            </div>
            <div className={styles.heroQuickSep} />
            <div className={styles.heroQuickItem}>
              <span className={styles.heroQuickValue}>{data.open}</span>
              <span className={styles.heroQuickLabel}>Abiertas</span>
            </div>
            <div className={styles.heroQuickSep} />
            <div className={styles.heroQuickItem}>
              <span className={styles.heroQuickValue}>{data.closed}</span>
              <span className={styles.heroQuickLabel}>Cerradas</span>
            </div>
          </div>
        </div>

      <div className={styles.toolbar}>
        <FilterBar />
        <button type="button" className={styles.addBtn} onClick={handleCreate}>
          <Plus size={16} />
          Nueva incidencia
        </button>
      </div>

      <KPIGrid data={data} />

      <section className={styles.charts}>
        <StatusDonut data={data.statusData} />
        <PriorityDonut data={data.priorityData} />
        <CategoryBar data={data.categoryData} />
        <TrendLine data={data.trendData} />
      </section>

      <CreateIncidentModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
