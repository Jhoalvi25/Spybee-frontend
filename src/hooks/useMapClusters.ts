'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Incident } from '@/domain/incident/types';

const SOURCE_ID = 'incidents-source';
const CLUSTER_LAYER = 'incidents-cluster';
const CLUSTER_COUNT_LAYER = 'incidents-cluster-count';
const POINT_RING_LAYER = 'incidents-point-ring';
const POINT_LAYER = 'incidents-point';

function buildGeoJSON(incidents: Incident[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: incidents.map((inc) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [inc.coordinates.lng, inc.coordinates.lat],
      },
      properties: {
        id: inc.id,
        title: inc.title,
        status: inc.status,
        priority: inc.priority,
        sequenceId: inc.sequenceId,
        typeName: inc.type.name,
        projectName: inc.project.name,
      },
    })),
  };
}

function addLayers(map: mapboxgl.Map) {
  if (map.getSource(SOURCE_ID)) {
    [CLUSTER_LAYER, CLUSTER_COUNT_LAYER, POINT_RING_LAYER, POINT_LAYER].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    map.removeSource(SOURCE_ID);
  }

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 14,
  });

  map.addLayer({
    id: CLUSTER_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#F4C400',
        5,
        '#F97316',
        15,
        '#EF4444',
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        22,
        5,
        28,
        15,
        36,
      ],
      'circle-opacity': 0.9,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 14,
    },
    paint: {
      'text-color': '#ffffff',
    },
  });

  map.addLayer({
    id: POINT_RING_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'status'], 'closed'],
        '#22C55E',
        ['==', ['get', 'priority'], 'high'],
        '#EF4444',
        '#F4C400',
      ],
      'circle-radius': 14,
      'circle-opacity': 0.35,
      'circle-blur': 0.5,
    },
  });

  map.addLayer({
    id: POINT_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'status'], 'closed'],
        '#22C55E',
        ['==', ['get', 'priority'], 'high'],
        '#EF4444',
        '#F4C400',
      ],
      'circle-radius': 7,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
    },
  });
}

export function useMapClusters({
  map,
  isLoaded,
  incidents,
  onSelect,
}: {
  map: mapboxgl.Map | null;
  isLoaded: boolean;
  incidents: Incident[];
  onSelect: (id: string) => void;
}) {
  const incidentsRef = useRef(incidents);
  incidentsRef.current = incidents;

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const animRef = useRef<number | null>(null);

  const stopPulse = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  const startPulse = useCallback(() => {
    stopPulse();
    if (!map) return;

    const period = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      if (!map) {
        animRef.current = null;
        return;
      }

      let layerExists = false;
      try {
        layerExists = !!map.getLayer(POINT_RING_LAYER);
      } catch {
        animRef.current = null;
        return;
      }

      if (!layerExists) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - start;
      const t = (Math.sin((elapsed % period) / period * Math.PI * 2) + 1) / 2;

      try {
        map.setPaintProperty(
          POINT_RING_LAYER,
          'circle-radius',
          12 + t * 8
        );
        map.setPaintProperty(
          POINT_RING_LAYER,
          'circle-opacity',
          0.15 + (1 - t) * 0.35
        );
      } catch {}

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [map, stopPulse]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const setup = () => {
      try {
        addLayers(map);
        const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
        if (source) {
          source.setData(buildGeoJSON(incidentsRef.current));
        }
        startPulse();
      } catch {
        // style may still be loading — layers will be added on next style.load
      }
    };

    setup();

    map.on('style.load', setup);

    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [CLUSTER_LAYER],
      });
      if (!features.length || !features[0].properties) return;
      const clusterId = features[0].properties.cluster_id;
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        const geom = features[0].geometry as GeoJSON.Point;
        map.easeTo({
          center: geom.coordinates as [number, number],
          zoom: zoom as number,
          duration: 800,
        });
      });
    };

    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [POINT_LAYER],
      });
      if (!features.length || !features[0].properties) return;
      const id = features[0].properties.id as string;
      onSelectRef.current(id);
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', CLUSTER_LAYER, handleClusterClick);
    map.on('click', POINT_LAYER, handlePointClick);
    map.on('mouseenter', CLUSTER_LAYER, handleMouseEnter);
    map.on('mouseleave', CLUSTER_LAYER, handleMouseLeave);
    map.on('mouseenter', POINT_LAYER, handleMouseEnter);
    map.on('mouseleave', POINT_LAYER, handleMouseLeave);

    return () => {
      stopPulse();
      map.off('style.load', setup);
      map.off('click', CLUSTER_LAYER, handleClusterClick);
      map.off('click', POINT_LAYER, handlePointClick);
      map.off('mouseenter', CLUSTER_LAYER, handleMouseEnter);
      map.off('mouseleave', CLUSTER_LAYER, handleMouseLeave);
      map.off('mouseenter', POINT_LAYER, handleMouseEnter);
      map.off('mouseleave', POINT_LAYER, handleMouseLeave);

      try {
        [CLUSTER_LAYER, CLUSTER_COUNT_LAYER, POINT_RING_LAYER, POINT_LAYER].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {} // map instance may already be destroyed
    };
  }, [map, isLoaded, startPulse, stopPulse]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(buildGeoJSON(incidents));
  }, [map, isLoaded, incidents]);
}
