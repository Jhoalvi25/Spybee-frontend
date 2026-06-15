'use client';

import { useFilters, useSetFilters, useResetFilters } from '@/domain/incident/hooks';
import { INCIDENT_STATUS_LABELS, INCIDENT_PRIORITY_LABELS, INCIDENT_TYPE_OPTIONS } from '@/lib/constants';
import styles from './FilterBar.module.scss';

export function FilterBar() {
  const filters = useFilters();
  const setFilters = useSetFilters();
  const resetFilters = useResetFilters();

  const hasFilters = !!filters.status || !!filters.priority || !!filters.search || !!filters.typeKey;

  return (
    <div className={styles.bar} role="search" aria-label="Filtrar incidencias">
      <div className={styles.field}>
        <input
          type="text"
          placeholder="Buscar por título, descripción o ID…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className={styles.input}
          aria-label="Buscar incidencias"
        />
      </div>

      <div className={styles.field}>
        <select
          value={filters.status ?? ''}
          onChange={(e) => setFilters({ status: (e.target.value || undefined) as never })}
          className={styles.select}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {(Object.entries(INCIDENT_STATUS_LABELS) as [string, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <select
          value={filters.priority ?? ''}
          onChange={(e) => setFilters({ priority: (e.target.value || undefined) as never })}
          className={styles.select}
          aria-label="Filtrar por prioridad"
        >
          <option value="">Todas las prioridades</option>
          {(Object.entries(INCIDENT_PRIORITY_LABELS) as [string, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <select
          value={filters.typeKey ?? ''}
          onChange={(e) => setFilters({ typeKey: (e.target.value || undefined) as never })}
          className={styles.select}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {INCIDENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" onClick={resetFilters} className={styles.clear}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
