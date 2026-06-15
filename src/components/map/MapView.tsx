'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { MapContext } from './MapContext';
import { IncidentMarker, IncidentPopup } from './IncidentMarker';
import { FilterBar } from '@/components/layout/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  useFilteredIncidents,
  useIncidents,
  useSelectIncident,
  useLoadIncidents,
  useIsLoading,
  useError,
  useFilters,
  useResetFilters,
} from '@/domain/incident/hooks';
import type { Incident } from '@/domain/incident/types';
import styles from './MapView.module.scss';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error: mapError } = useMapbox({ container: containerRef });
  const prefix = useId();

  const incidents = useFilteredIncidents();
  const allIncidents = useIncidents();
  const selectIncident = useSelectIncident();
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();
  const storeError = useError();
  const filters = useFilters();
  const resetFilters = useResetFilters();

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const [popupIncident, setPopupIncident] = useState<Incident | null>(null);

  const filtersActive =
    !!filters.status || !!filters.priority || !!filters.typeKey || !!filters.search || !!filters.projectId;

  const handleMarkerClick = useCallback(
    (id: string) => {
      const incident = incidents.find((i) => i.id === id) ?? null;
      setPopupIncident(incident);
      selectIncident(id);
    },
    [incidents, selectIncident]
  );

  const handlePopupClose = useCallback(() => {
    setPopupIncident(null);
    selectIncident(null);
  }, [selectIncident]);

  const handleRetry = useCallback(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} className={styles.map}>
        <div className={styles.filterBar}><FilterBar /></div>

        {/* Mapbox load error */}
        {mapError && <div className={styles.overlay}><span className={styles.error}>{mapError}</span></div>}

        {/* Mapbox loading */}
        {!isLoaded && !mapError && (
          <div className={styles.overlay}><span className={styles.loading}>Cargando mapa…</span></div>
        )}

        {/* Incidents loading after map */}
        {isLoaded && isLoading && !storeError && (
          <div className={styles.overlay}><span className={styles.loading}>Cargando incidencias…</span></div>
        )}

        {/* Incidents store error */}
        {isLoaded && !mapError && storeError && (
          <div className={styles.overlay}>
            <div className={styles.stateCard}>
              <ErrorState message={storeError} onRetry={handleRetry} />
            </div>
          </div>
        )}

        {/* No incidents at all */}
        {isLoaded && !mapError && !isLoading && !storeError && allIncidents.length === 0 && (
          <div className={styles.overlay}>
            <div className={styles.stateCard}>
              <EmptyState
                icon={<span>📋</span>}
                title="No hay incidencias"
                description="Aún no se han registrado incidencias en ningún proyecto."
              />
            </div>
          </div>
        )}

        {/* Filtered no results */}
        {isLoaded && !mapError && !isLoading && !storeError && allIncidents.length > 0 && incidents.length === 0 && (
          <div className={styles.overlay}>
            <div className={styles.stateCard}>
              <EmptyState
                icon={<span>🔍</span>}
                title="Sin resultados"
                description="No se encontraron incidencias con los filtros seleccionados en esta zona."
                action={filtersActive ? { label: 'Limpiar filtros', onClick: handleClearFilters } : undefined}
              />
            </div>
          </div>
        )}

        {incidents.map((incident) => (
          <IncidentMarker
            key={`${prefix}-marker-${incident.id}`}
            incident={incident}
            onSelect={handleMarkerClick}
          />
        ))}

        {popupIncident && (
          <IncidentPopup
            key={`${prefix}-popup-${popupIncident.id}`}
            incident={popupIncident}
            onClose={handlePopupClose}
          />
        )}
      </div>
    </MapContext.Provider>
  );
}
