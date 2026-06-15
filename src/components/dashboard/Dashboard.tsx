'use client';

import { useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLoadIncidents, useIsLoading } from '@/domain/incident/hooks';
import { FilterBar } from '@/components/layout/FilterBar';
import { KPIGrid } from './KPIGrid';
import { StatusDonut } from './StatusDonut';
import { PriorityDonut } from './PriorityDonut';
import { CategoryBar } from './CategoryBar';
import { TrendLine } from './TrendLine';
import styles from './Dashboard.module.scss';

export function Dashboard() {
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();
  const data = useDashboardData();

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

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
