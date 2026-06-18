'use client';

import { useEffect, useRef, useState, useCallback, useId, useMemo } from 'react';
import {
  Search,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useMapbox } from '@/hooks/useMapbox';
import { useMapAutoFit } from '@/hooks/useMapAutoFit';
import { useMapClusters } from '@/hooks/useMapClusters';
import { MapContext } from './MapContext';
import { IncidentPopup } from './IncidentMarker';
import { MapControls } from './MapControls';
import { useTheme, useMapStyle } from '@/domain/ui/hooks';
import { MAP_STYLE_URLS } from '@/lib/constants';
import {
  selectFilteredIncidents,
  useIncidents,
  useSelectIncident,
  useLoadIncidents,
  useIsLoading,
  useError,
  useFilters,
  useSetFilters,
  useResetFilters,
} from '@/domain/incident/hooks';
import {
  INCIDENT_STATUS_LABELS,
  INCIDENT_PRIORITY_LABELS,
} from '@/lib/constants';
import { CreateIncidentModal } from '@/components/incident/CreateIncidentModal';
import type { Incident } from '@/domain/incident/types';
import styles from './MapView.module.scss';

function useLastSync() {
  const [label, setLabel] = useState('hace unos segundos');
  const [ts, setTs] = useState(Date.now());

  const touch = useCallback(() => setTs(Date.now()), []);

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - ts) / 1000);
      if (elapsed < 5) setLabel('hace unos segundos');
      else if (elapsed < 60) setLabel(`hace ${elapsed} segundos`);
      else setLabel(`hace ${Math.floor(elapsed / 60)} min`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [ts]);

  return { label, touch };
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapStyle = useMapStyle();
  const { map, isLoaded, error: mapError } = useMapbox({
    container: containerRef,
    style: MAP_STYLE_URLS[mapStyle],
  });
  const prefix = useId();

  const allIncidents = useIncidents();
  const filters = useFilters();
  const setFilters = useSetFilters();
  const incidents = useMemo(
    () => selectFilteredIncidents({ incidents: allIncidents, filters }),
    [allIncidents, filters]
  );
  const selectIncident = useSelectIncident();
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();
  const storeError = useError();
  const resetFilters = useResetFilters();

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const theme = useTheme();

  const { label: syncLabel, touch: touchSync } = useLastSync();

  const [popupIncident, setPopupIncident] = useState<Incident | null>(null);
  const [sideOpen, setSideOpen] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCoords, setCreateCoords] = useState<[number, number] | null>(null);

  const filtersActive =
    !!filters.status || !!filters.priority || !!filters.typeKey || !!filters.search || !!filters.projectId;

  const openCount = allIncidents.filter((i) => i.status === 'open').length;
  const closedCount = allIncidents.filter((i) => i.status === 'closed').length;

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
    touchSync();
    loadIncidents();
  }, [loadIncidents, touchSync]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleOpenCreate = useCallback(() => {
    if (popupIncident) {
      setCreateCoords([popupIncident.coordinates.lat, popupIncident.coordinates.lng]);
    } else if (map) {
      const center = map.getCenter();
      setCreateCoords([center.lat, center.lng]);
    } else {
      setCreateCoords(null);
    }
    setCreateOpen(true);
  }, [map, popupIncident]);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateCoords(null);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters({ [key]: value || undefined } as any);
  }, [setFilters]);

  useMapAutoFit({ map, isLoaded, incidents });
  useMapClusters({ map, isLoaded, incidents, onSelect: handleMarkerClick });

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} className={styles.map}>
        <aside className={`${styles.sidePanel} ${sideOpen ? styles.sidePanelOpen : styles.sidePanelClosed}`}>
          <button
            type="button"
            className={styles.sideToggle}
            onClick={() => setSideOpen((o) => !o)}
            aria-label={sideOpen ? 'Cerrar panel' : 'Abrir panel'}
          >
            {sideOpen ? '◀' : '▶'}
          </button>

          {sideOpen && (
            <>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Incidencias</span>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{allIncidents.length}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{openCount}</span>
                  <span className={styles.statLabel}>Abiertas</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{closedCount}</span>
                  <span className={styles.statLabel}>Cerradas</span>
                </div>
              </div>

              <div className={styles.systemStatus}>
                <span className={styles.statusDot} />
                <span className={styles.statusLabel}>Monitoreo activo</span>
                <span className={styles.statusSync}>{syncLabel}</span>
              </div>

              <div className={styles.filtersSection}>
                <div className={styles.filterField}>
                  <Search size={14} className={styles.filterIcon} />
                  <input
                    type="text"
                    placeholder="Buscar incidencias…"
                    value={filters.search ?? ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className={styles.filterInput}
                    aria-label="Buscar incidencias"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      className={styles.filterClearIcon}
                      onClick={() => handleFilterChange('search', '')}
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className={styles.filterRow}>
                  <select
                    value={filters.status ?? ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Filtrar por estado"
                  >
                    <option value="">Estado</option>
                    {(Object.entries(INCIDENT_STATUS_LABELS) as [string, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>

                  <select
                    value={filters.priority ?? ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className={styles.filterSelect}
                    aria-label="Filtrar por prioridad"
                  >
                    <option value="">Prioridad</option>
                    {(Object.entries(INCIDENT_PRIORITY_LABELS) as [string, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {filtersActive && (
                  <button type="button" onClick={handleClearFilters} className={styles.clearBtn}>
                    <X size={12} />
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className={styles.incidentList}>
                {incidents.length === 0 && (
                  <p className={styles.emptyList}>Sin incidencias</p>
                )}
                {incidents.slice(0, 20).map((inc, i) => {
                  const dotColor =
                    inc.status === 'closed' ? '#22C55E' :
                    inc.priority === 'high' ? '#EF4444' : '#F4C400';
                  return (
                    <button
                      key={inc.id}
                      type="button"
                      className={`${styles.incidentCard} ${popupIncident?.id === inc.id ? styles.incidentCardActive : ''}`}
                      style={{ '--bar-color': dotColor, '--delay': `${i * 0.04}s` } as React.CSSProperties}
                      onClick={() => handleMarkerClick(inc.id)}
                    >
                      <div className={styles.incidentBody}>
                        <span className={styles.incidentTitle}>{inc.title}</span>
                        <span className={styles.incidentMeta}>
                          <span className={styles.incidentCategory}>{inc.type.name}</span>
                          <span className={styles.incidentId}>{inc.sequenceId}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {isLoaded && <MapControls map={map} isLoaded={isLoaded} onReport={handleOpenCreate} />}
        {mapError && <div className={styles.overlay}><span className={styles.error}>{mapError}</span></div>}

        {!isLoaded && !mapError && (
          <div className={styles.overlay}><span className={styles.loading}>Cargando mapa…</span></div>
        )}

        {isLoaded && isLoading && !storeError && (
          <div className={styles.overlay}><span className={styles.loading}>Cargando incidencias…</span></div>
        )}

        {isLoaded && !mapError && storeError && (
          <div className={styles.overlay}>
            <div className={styles.stateCard}>
              <div className={styles.errorBlock}>
                <p>{storeError}</p>
                <button type="button" onClick={handleRetry}>Reintentar</button>
              </div>
            </div>
          </div>
        )}

        {isLoaded && !mapError && !isLoading && !storeError && allIncidents.length === 0 && (
          <div className={styles.overlay}>
            <div className={styles.stateCard}>
              <p>No hay incidencias registradas.</p>
            </div>
          </div>
        )}

        {isLoaded && !mapError && !isLoading && !storeError && allIncidents.length > 0 && incidents.length === 0 && (
          <div className={styles.overlay}>
            <div className={styles.stateCard}>
              <p>Sin resultados con los filtros actuales.</p>
              {filtersActive && (
                <button type="button" onClick={handleClearFilters}>Limpiar filtros</button>
              )}
            </div>
          </div>
        )}

        {popupIncident && (
          <IncidentPopup
            key={`${prefix}-popup-${popupIncident.id}`}
            incident={popupIncident}
            onClose={handlePopupClose}
          />
        )}

        {createOpen && (
          <CreateIncidentModal
            open={createOpen}
            onClose={handleCloseCreate}
            initialLat={createCoords?.[0]}
            initialLng={createCoords?.[1]}
            initialMapStyle={mapStyle}
          />
        )}
      </div>
    </MapContext.Provider>
  );
}
