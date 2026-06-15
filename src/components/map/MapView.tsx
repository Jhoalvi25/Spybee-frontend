'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { MapContext } from './MapContext';
import { IncidentMarker, IncidentPopup } from './IncidentMarker';
import { FilterBar } from '@/components/layout/FilterBar';
import {
  useFilteredIncidents,
  useSelectIncident,
  useLoadIncidents,
  useIsLoading,
} from '@/domain/incident/hooks';
import type { Incident } from '@/domain/incident/types';
import styles from './MapView.module.scss';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error } = useMapbox({ container: containerRef });
  const prefix = useId();

  const incidents = useFilteredIncidents();
  const selectIncident = useSelectIncident();
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const [popupIncident, setPopupIncident] = useState<Incident | null>(null);

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

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} className={styles.map}>
        <div className={styles.filterBar}><FilterBar /></div>
        {error && <div className={styles.overlay}><span className={styles.error}>{error}</span></div>}
        {!isLoaded && !error && <div className={styles.overlay}><span className={styles.loading}>Cargando mapa…</span></div>}
        {isLoaded && isLoading && <div className={styles.overlay}><span className={styles.loading}>Cargando incidencias…</span></div>}

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
