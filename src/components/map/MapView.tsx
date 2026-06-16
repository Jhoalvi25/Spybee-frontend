'use client';

import { useEffect, useRef, useState, useCallback, useId, useMemo } from 'react';
import {
  Search,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useMapbox } from '@/hooks/useMapbox';
import { MapContext } from './MapContext';
import { IncidentMarker, IncidentPopup } from './IncidentMarker';
import { MapControls } from './MapControls';
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
import type { Incident } from '@/domain/incident/types';
import styles from './MapView.module.scss';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error: mapError } = useMapbox({ container: containerRef });
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

  const [popupIncident, setPopupIncident] = useState<Incident | null>(null);
  const [sideOpen, setSideOpen] = useState(true);

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
    loadIncidents();
  }, [loadIncidents]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} className={styles.map}>
        {/* ─── Floating Side Panel ─────────── */}
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
              {/* Stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <ClipboardList size={16} />
                  <span className={styles.statValue}>{allIncidents.length}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.statCard}>
                  <AlertCircle size={16} />
                  <span className={styles.statValue}>{openCount}</span>
                  <span className={styles.statLabel}>Abiertas</span>
                </div>
                <div className={styles.statCard}>
                  <CheckCircle2 size={16} />
                  <span className={styles.statValue}>{closedCount}</span>
                  <span className={styles.statLabel}>Cerradas</span>
                </div>
              </div>

              {/* Filters */}
              <div className={styles.filtersSection}>
                <div className={styles.filterField}>
                  <Search size={14} className={styles.filterIcon} />
                  <input
                    type="text"
                    placeholder="Buscar…"
                    value={filters.search ?? ''}
                    onChange={(e) => setFilters({ search: e.target.value || undefined })}
                    className={styles.filterInput}
                    aria-label="Buscar incidencias"
                  />
                </div>

                <select
                  value={filters.status ?? ''}
                  onChange={(e) => setFilters({ status: (e.target.value || undefined) as never })}
                  className={styles.filterSelect}
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  {(Object.entries(INCIDENT_STATUS_LABELS) as [string, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <select
                  value={filters.priority ?? ''}
                  onChange={(e) => setFilters({ priority: (e.target.value || undefined) as never })}
                  className={styles.filterSelect}
                  aria-label="Filtrar por prioridad"
                >
                  <option value="">Todas las prioridades</option>
                  {(Object.entries(INCIDENT_PRIORITY_LABELS) as [string, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                {filtersActive && (
                  <button type="button" onClick={handleClearFilters} className={styles.clearBtn}>
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Incident list */}
              <div className={styles.incidentList}>
                {incidents.length === 0 && (
                  <p className={styles.emptyList}>Sin incidencias</p>
                )}
                {incidents.slice(0, 20).map((inc) => (
                  <button
                    key={inc.id}
                    type="button"
                    className={`${styles.incidentItem} ${popupIncident?.id === inc.id ? styles.incidentItemActive : ''}`}
                    onClick={() => handleMarkerClick(inc.id)}
                  >
                    <span
                      className={styles.incidentDot}
                      style={{
                        background:
                          inc.status === 'closed' ? '#22C55E' :
                          inc.priority === 'high' ? '#EF4444' : '#F4C400',
                      }}
                    />
                    <div className={styles.incidentInfo}>
                      <span className={styles.incidentTitle}>{inc.title}</span>
                      <span className={styles.incidentSub}>
                        {inc.type.name} · {inc.sequenceId}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* ─── Map Controls ──────────────── */}
        {isLoaded && <MapControls map={map} isLoaded={isLoaded} />}

        {/* ─── Error / Loading States ────── */}
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

        {/* ─── Markers ──────────────────── */}
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
