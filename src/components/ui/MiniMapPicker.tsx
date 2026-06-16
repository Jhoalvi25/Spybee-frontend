'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '@/hooks/useMapbox';
import styles from './MiniMapPicker.module.scss';

type MiniMapPickerProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export function MiniMapPicker({ lat, lng, onChange }: MiniMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, isLoaded, error } = useMapbox({
    container: containerRef,
    center: [lng, lat],
    zoom: 14,
  });
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const marker = new mapboxgl.Marker({ draggable: true, color: '#2563eb' })
      .setLngLat([lng, lat])
      .addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      onChange(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      onChange(e.lngLat.lat, e.lngLat.lng);
    });

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, isLoaded]);

  useEffect(() => {
    if (markerRef.current && isLoaded && map) {
      markerRef.current.setLngLat([lng, lat]);
      map.flyTo({ center: [lng, lat], duration: 400 });
    }
  }, [lat, lng, isLoaded, map]);

  if (error) {
    return <div className={styles.wrapper}><div className={styles.error}>Error al cargar el mapa: {error}</div></div>;
  }

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.map} />
      {!isLoaded && <div className={styles.loading}>Cargando mapa…</div>}
    </div>
  );
}
