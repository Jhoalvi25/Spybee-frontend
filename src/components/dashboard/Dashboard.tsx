'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useIncidents,
  useLoadIncidents,
  useIsLoading,
  useError,
  useFilters,
  useResetFilters,
} from '@/domain/incident/hooks';
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

export function Dashboard() {
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();
  const error = useError();
  const allIncidents = useIncidents();
  const data = useDashboardData();
  const filters = useFilters();
  const resetFilters = useResetFilters();

  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

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

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen general de incidencias</p>
        </header>
        <div className={styles.skeleton}>Cargando indicadores…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen general de incidencias</p>
        </header>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (allIncidents.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen general de incidencias</p>
        </header>
        <EmptyState
          icon={<span>📋</span>}
          title="No hay incidencias"
          description="Aún no se han registrado incidencias. Crea la primera para comenzar."
          action={{ label: 'Crear incidencia', onClick: handleCreate }}
        />
        <CreateIncidentModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    );
  }

  if (filtersActive && data.total === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen general de incidencias</p>
        </header>
        <FilterBar />
        <EmptyState
          icon={<span>🔍</span>}
          title="Sin resultados"
          description="No se encontraron incidencias con los filtros seleccionados. Intenta con otros criterios."
          action={{ label: 'Limpiar filtros', onClick: handleClearFilters }}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen general de incidencias</p>
      </header>

      <FilterBar />

      <KPIGrid data={data} />

      <section className={styles.charts}>
        <StatusDonut data={data.statusData} />
        <PriorityDonut data={data.priorityData} />
        <CategoryBar data={data.categoryData} />
        <TrendLine data={data.trendData} />
      </section>
    </div>
  );
}
