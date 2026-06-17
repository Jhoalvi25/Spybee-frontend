'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '@/hooks/useMapbox';
import { MapPin, Crosshair, Plus, Minus, Navigation } from 'lucide-react';
import styles from './MiniMapPicker.module.scss';

const STYLES = [
  { id: 'streets', label: 'Calles', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite', label: 'Satélite', url: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'hybrid', label: 'Híbrido', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
] as const;

type MiniMapPickerProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export function MiniMapPicker({ lat, lng, onChange }: MiniMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const coordsRef = useRef({ lat, lng });
  const lastCoordsRef = useRef({ lat, lng });
  const [activeStyle, setActiveStyle] = useState('hybrid');
  const [isReady, setIsReady] = useState(false);

  const { map, isLoaded, error } = useMapbox({
    container: containerRef,
    center: [lng, lat],
    zoom: 14,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
  });

  // Keep coordsRef in sync with props
  coordsRef.current = { lat, lng };

  /* ── Build marker element ── */
  const buildMarkerEl = useCallback(() => {
    const el = document.createElement('div');
    el.style.cssText = 'width:24px; height:24px; position:relative;';

    const inner = document.createElement('div');
    inner.style.cssText = `
      position:absolute; inset:0; border-radius:50%;
      background:#f4c400; border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      cursor:pointer; animation:drop 0.4s ease-out;
    `;
    el.appendChild(inner);

    const shadow = document.createElement('div');
    shadow.style.cssText = `
      position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
      width:10px; height:10px; border-radius:50%;
      background:rgba(244,196,0,0.3); filter:blur(3px);
      animation:shadow 0.4s ease-out;
    `;
    el.appendChild(shadow);

    return el;
  }, []);

  /* ── Create marker ── */
  const createMarker = useCallback((m: mapboxgl.Map, latlng: [number, number]) => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const el = buildMarkerEl();

    const marker = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat(latlng)
      .addTo(m);

    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      lastCoordsRef.current = { lat: pos.lat, lng: pos.lng };
      onChange(pos.lat, pos.lng);
    });

    markerRef.current = marker;
  }, [buildMarkerEl, onChange]);

  /* ── Init effect ── */
  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleStyleLoad = () => {
      const { lat: clat, lng: clng } = coordsRef.current;
      createMarker(map, [clng, clat]);
      lastCoordsRef.current = { lat: clat, lng: clng };
      setIsReady(true);
    };

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (!markerRef.current) return;
      const { lat: clickLat, lng: clickLng } = e.lngLat;
      markerRef.current.setLngLat([clickLng, clickLat]);
      lastCoordsRef.current = { lat: clickLat, lng: clickLng };
      onChange(clickLat, clickLng);
    };

    map.on('click', handleClick);
    map.on('style.load', handleStyleLoad);

    // Init marker
    createMarker(map, [lng, lat]);
    lastCoordsRef.current = { lat, lng };
    setIsReady(true);

    return () => {
      map.off('click', handleClick);
      map.off('style.load', handleStyleLoad);
      markerRef.current?.remove();
      markerRef.current = null;
    };
    // Intent: run once on map ready, use coordsRef for fresh values in closures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  /* ── Sync marker position when lat/lng change externally ── */
  useEffect(() => {
    if (!markerRef.current || !map || !isReady) return;

    const { lat: lastLat, lng: lastLng } = lastCoordsRef.current;
    if (lat === lastLat && lng === lastLng) return;

    markerRef.current.setLngLat([lng, lat]);
    map.flyTo({ center: [lng, lat], duration: 400 });
    lastCoordsRef.current = { lat, lng };
  }, [lat, lng, map, isReady]);

  /* ── Style switcher ── */
  const handleStyleChange = useCallback((styleUrl: string) => {
    if (!map) return;
    map.setStyle(styleUrl);
  }, [map]);

  /* ── Zoom / Center ── */
  const handleZoomIn = useCallback(() => map?.zoomIn({ duration: 200 }), [map]);
  const handleZoomOut = useCallback(() => map?.zoomOut({ duration: 200 }), [map]);
  const handleRecenter = useCallback(() => {
    if (!map) return;
    map.flyTo({ center: [lng, lat], zoom: 16, duration: 600 });
  }, [map, lng, lat]);

  /* ── Coordinate editing ── */
  const handleLatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(v, lng);
  }, [onChange, lng]);

  const handleLngChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(lat, v);
  }, [onChange, lat]);

  if (error) {
    return <div className={styles.wrapper}><div className={styles.errorBox}>Error al cargar el mapa: {error}</div></div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <MapPin size={16} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Ubicación de la incidencia</span>
        </div>
        <p className={styles.headerDesc}>Haz clic en el mapa para seleccionar la posición exacta.</p>
        <div className={styles.headerCoords}>
          <span className={styles.coordLabel}>Lat: {lat.toFixed(4)}</span>
          <span className={styles.coordSep}>·</span>
          <span className={styles.coordLabel}>Lng: {lng.toFixed(4)}</span>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <div className={styles.styleBar} role="radiogroup" aria-label="Estilo de mapa">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={activeStyle === s.id}
              className={`${styles.styleBtn} ${activeStyle === s.id ? styles.styleBtnActive : ''}`}
              onClick={() => {
                if (s.id === activeStyle) return;
                setActiveStyle(s.id);
                handleStyleChange(s.url);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div ref={containerRef} className={styles.map} />

        <div className={styles.floatControls}>
          <button type="button" className={styles.ctrlBtn} onClick={handleZoomIn} title="Acercar" aria-label="Acercar">
            <Plus size={16} />
          </button>
          <div className={styles.ctrlDivider} />
          <button type="button" className={styles.ctrlBtn} onClick={handleZoomOut} title="Alejar" aria-label="Alejar">
            <Minus size={16} />
          </button>
          <div className={styles.ctrlDivider} />
          <button type="button" className={styles.ctrlBtn} onClick={handleRecenter} title="Centrar" aria-label="Centrar">
            <Crosshair size={16} />
          </button>
        </div>

        {!isLoaded && (
          <div className={styles.loadingOverlay}>
            <Navigation size={20} className={styles.loadingSpin} />
            <span>Cargando mapa…</span>
          </div>
        )}
      </div>

      <div className={styles.coordRow}>
        <div className={styles.coordField}>
          <label htmlFor="pickerLat" className={styles.coordFieldLabel}>Latitud</label>
          <input
            id="pickerLat"
            type="number"
            step="any"
            className={styles.coordInput}
            value={lat}
            onChange={handleLatChange}
          />
        </div>
        <div className={styles.coordField}>
          <label htmlFor="pickerLng" className={styles.coordFieldLabel}>Longitud</label>
          <input
            id="pickerLng"
            type="number"
            step="any"
            className={styles.coordInput}
            value={lng}
            onChange={handleLngChange}
          />
        </div>
      </div>
    </div>
  );
}
