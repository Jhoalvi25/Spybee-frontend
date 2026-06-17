'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_DEFAULT_CENTER, MAPBOX_DEFAULT_ZOOM } from '@/lib/constants';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
const LOAD_TIMEOUT = 15_000;

export type UseMapboxOptions = {
  container: React.RefObject<HTMLDivElement | null>;
  center?: [number, number];
  zoom?: number;
  style?: string;
};

export function useMapbox({
  container,
  center = [MAPBOX_DEFAULT_CENTER[1], MAPBOX_DEFAULT_CENTER[0]],
  zoom = MAPBOX_DEFAULT_ZOOM,
  style = 'mapbox://styles/mapbox/light-v11',
}: UseMapboxOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!container.current || mapRef.current) return;

    if (!TOKEN) {
      setError('Token de Mapbox no configurado (NEXT_PUBLIC_MAPBOX_TOKEN)');
      return;
    }

    mapboxgl.accessToken = TOKEN;

    const instance = new mapboxgl.Map({
      container: container.current,
      style,
      center,
      zoom,
    });

    instance.on('load', () => {
      cleanup();
      setIsLoaded(true);
      setError(null);
    });

    instance.on('error', (e) => {
      setError(`Error al cargar el mapa: ${e.error?.message ?? 'desconocido'}`);
    });

    timerRef.current = setTimeout(() => {
      if (!mapRef.current?.loaded()) {
        setError('El mapa no pudo cargarse en el tiempo esperado. Verifica tu conexión y token de Mapbox.');
      }
    }, LOAD_TIMEOUT);

    mapRef.current = instance;
    setMap(instance);

    return () => {
      cleanup();
      instance.remove();
      mapRef.current = null;
      setMap(null);
      setIsLoaded(false);
      setError(null);
    };
  }, [cleanup]);

  return { map, isLoaded, error };
}
