'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Map, Layers, Satellite, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import styles from './MapControls.module.scss';

const STYLE_OPTIONS = [
  { id: 'streets', label: 'Calles', url: 'mapbox://styles/mapbox/streets-v12', icon: Map },
  { id: 'light', label: 'Luz', url: 'mapbox://styles/mapbox/light-v11', icon: Layers },
  { id: 'satellite', label: 'Satélite', url: 'mapbox://styles/mapbox/satellite-streets-v12', icon: Satellite },
] as const;

const ZOOM_BUTTONS = [
  { id: 'in', label: 'Acercar', icon: ZoomIn, action: 'zoomIn' as const },
  { id: 'out', label: 'Alejar', icon: ZoomOut, action: 'zoomOut' as const },
  { id: 'reset', label: 'Reset', icon: RotateCw, action: 'reset' as const },
];

type MapControlsProps = {
  map: mapboxgl.Map | null;
  isLoaded: boolean;
};

export function MapControls({ map, isLoaded }: MapControlsProps) {
  const [activeStyle, setActiveStyle] = useState('light');
  const [isSwitching, setIsSwitching] = useState(false);
  const controlsAdded = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded || controlsAdded.current) return;
    controlsAdded.current = true;
  }, [map, isLoaded]);

  const handleStyleChange = useCallback((styleId: string, styleUrl: string) => {
    if (styleId === activeStyle || !map || isSwitching) return;
    setIsSwitching(true);
    setActiveStyle(styleId);
    map.setStyle(styleUrl);
    map.once('style.load', () => setIsSwitching(false));
  }, [activeStyle, isSwitching, map]);

  const handleZoom = useCallback((action: 'zoomIn' | 'zoomOut' | 'reset') => {
    if (!map) return;
    if (action === 'zoomIn') map.zoomIn({ duration: 200 });
    else if (action === 'zoomOut') map.zoomOut({ duration: 200 });
    else map.flyTo({ center: [-74.0721, 4.7110], zoom: 12, duration: 600 });
  }, [map]);

  return (
    <div className={styles.controls}>
      {/* Style switcher */}
      <div className={styles.card} role="radiogroup" aria-label="Estilo de mapa">
        {STYLE_OPTIONS.map((s) => {
          const Icon = s.icon;
          return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={activeStyle === s.id}
                className={`${styles.btn} ${activeStyle === s.id ? styles.btnActive : ''}`}
                onClick={() => handleStyleChange(s.id, s.url)}
                disabled={isSwitching}
                title={s.label}
              >
              <Icon size={15} />
              <span>{s.label}</span>
            </button>
          );
        })}
        {isSwitching && <span className={styles.spinner} />}
      </div>

      {/* Zoom controls */}
      <div className={styles.card}>
        {ZOOM_BUTTONS.map((z, i) => {
          const Icon = z.icon;
          return (
            <span key={z.id}>
              {i > 0 && <div className={styles.divider} />}
              <button
                type="button"
                className={styles.btn}
                onClick={() => handleZoom(z.action)}
                title={z.label}
              >
                <Icon size={15} />
                <span>{z.label}</span>
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
