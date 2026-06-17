'use client';

import { useEffect, useMemo, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';
import { MAPBOX_DEFAULT_CENTER, MAPBOX_DEFAULT_ZOOM } from '@/lib/constants';

interface IncidentCoords {
  coordinates: { lat: number; lng: number };
}

type ViewBounds =
  | { type: 'single'; center: [number, number] }
  | { type: 'multiple'; bounds: [[number, number], [number, number]] }
  | null;

function computeBounds(incidents: IncidentCoords[]): ViewBounds {
  if (incidents.length === 0) return null;

  if (incidents.length === 1) {
    const { lat, lng } = incidents[0].coordinates;
    return { type: 'single', center: [lng, lat] };
  }

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  for (let i = 0; i < incidents.length; i++) {
    const { lat, lng } = incidents[i].coordinates;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  if (minLat === maxLat && minLng === maxLng) {
    return { type: 'single', center: [minLng, minLat] };
  }

  return {
    type: 'multiple',
    bounds: [[minLng, minLat], [maxLng, maxLat]],
  };
}

export function useMapAutoFit({
  map,
  isLoaded,
  incidents,
}: {
  map: mapboxgl.Map | null;
  isLoaded: boolean;
  incidents: IncidentCoords[];
}) {
  const lastKeyRef = useRef<string | null>(null);

  const view = useMemo(() => computeBounds(incidents), [incidents]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const key = view ? JSON.stringify(view) : 'null';
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    if (!view) {
      map.flyTo({
        center: [MAPBOX_DEFAULT_CENTER[1], MAPBOX_DEFAULT_CENTER[0]],
        zoom: MAPBOX_DEFAULT_ZOOM,
        duration: 1000,
      });
    } else if (view.type === 'single') {
      map.flyTo({
        center: view.center,
        zoom: 15,
        duration: 1000,
      });
    } else {
      map.fitBounds(view.bounds, {
        padding: 80,
        duration: 1000,
      });
    }
  }, [map, isLoaded, view]);
}
