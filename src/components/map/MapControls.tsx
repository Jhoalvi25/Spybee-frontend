'use client';

import { useCallback, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';
import { Sun, Moon, Satellite, Mountain, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { MAPBOX_DEFAULT_CENTER, MAPBOX_DEFAULT_ZOOM, MAP_STYLE_URLS } from '@/lib/constants';
import { useMapStyle, useSetMapStyle } from '@/domain/ui/hooks';
import styles from './MapControls.module.scss';

const STYLE_OPTIONS = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'satellite', label: 'Satélite', icon: Satellite },
  { id: 'outdoors', label: 'Relieve', icon: Mountain },
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
  const activeStyle = useMapStyle();
  const setMapStyle = useSetMapStyle();
  const switching = useRef(false);

  const handleStyleChange = useCallback((styleId: string) => {
    if (styleId === activeStyle || !map || switching.current) return;
    switching.current = true;
    setMapStyle(styleId as 'light' | 'dark' | 'satellite');
    map.setStyle(MAP_STYLE_URLS[styleId]);
    map.once('style.load', () => { switching.current = false; });
  }, [activeStyle, map, setMapStyle]);

  const handleZoom = useCallback((action: 'zoomIn' | 'zoomOut' | 'reset') => {
    if (!map) return;
    if (action === 'zoomIn') map.zoomIn({ duration: 200 });
    else if (action === 'zoomOut') map.zoomOut({ duration: 200 });
    else map.flyTo({ center: [MAPBOX_DEFAULT_CENTER[1], MAPBOX_DEFAULT_CENTER[0]], zoom: MAPBOX_DEFAULT_ZOOM, duration: 600 });
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
                onClick={() => handleStyleChange(s.id)}
                disabled={switching.current}
                title={s.label}
              >
              <Icon size={15} />
              <span>{s.label}</span>
            </button>
          );
        })}
        {switching.current && <span className={styles.spinner} />}
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
