'use client';

import { createContext, useContext } from 'react';
import type mapboxgl from 'mapbox-gl';

export const MapContext = createContext<mapboxgl.Map | null>(null);

export function useMapInstance(): mapboxgl.Map | null {
  return useContext(MapContext);
}
