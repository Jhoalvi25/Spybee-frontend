'use client';

import { memo, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapInstance } from './MapContext';
import type { Incident } from '@/domain/incident/types';
import { getStatusLabel, getPriorityLabel } from '@/domain/incident/hooks';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
};

const PRIORITY_SHADOWS: Record<string, string> = {
  high: '0 0 0 4px rgba(239,68,68,0.3)',
  medium: '0 0 0 4px rgba(245,158,11,0.3)',
  low: '0 0 0 4px rgba(59,130,246,0.3)',
};

function popupHTML(incident: Incident): string {
  const statusLabel = getStatusLabel(incident.status);
  const priorityLabel = getPriorityLabel(incident.priority);

  return `
    <div class="incident-popup">
      <h3 class="incident-popup__title">${incident.title}</h3>
      <div class="incident-popup__meta">
        <span class="incident-popup__badge incident-popup__badge--${incident.priority}">${priorityLabel}</span>
        <span class="incident-popup__badge incident-popup__badge--${incident.status}">${statusLabel}</span>
      </div>
      <p class="incident-popup__detail"><strong>Tipo:</strong> ${incident.type.name}</p>
      <p class="incident-popup__detail"><strong>Proyecto:</strong> ${incident.project.name}</p>
      <span class="incident-popup__id">${incident.sequenceId}</span>
      <a href="/incidents/${incident.id}" class="incident-popup__link">Ver detalle →</a>
    </div>
  `;
}

type IncidentMarkerProps = {
  incident: Incident;
  onSelect?: (id: string) => void;
};

export const IncidentMarker = memo(function IncidentMarker({
  incident,
  onSelect,
}: IncidentMarkerProps) {
  const map = useMapInstance();
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!map) return;

    const el = document.createElement('div');
    el.className = 'incident-marker';
    el.style.cssText = `
      cursor: pointer;
    `;

    const dot = document.createElement('div');
    dot.className = 'incident-marker__dot';
    dot.style.cssText = `
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: ${PRIORITY_COLORS[incident.priority] ?? '#6B7280'};
      border: 3px solid #fff;
      box-shadow: ${PRIORITY_SHADOWS[incident.priority] ?? '0 2px 6px rgba(0,0,0,0.3)'};
      transition: transform 0.15s ease;
    `;
    el.appendChild(dot);

    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(1.3)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'scale(1)';
    });
    el.addEventListener('click', () => onSelectRef.current?.(incident.id));

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, incident.id, incident.coordinates.lng, incident.coordinates.lat, incident.priority]);

  return null;
});

type IncidentPopupProps = {
  incident: Incident;
  onClose?: () => void;
};

export const IncidentPopup = memo(function IncidentPopup({
  incident,
  onClose,
}: IncidentPopupProps) {
  const map = useMapInstance();
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!map) return;

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
    })
      .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
      .setHTML(popupHTML(incident))
      .addTo(map);

    const handleClose = () => onCloseRef.current?.();
    popup.on('close', handleClose);

    popupRef.current = popup;

    return () => {
      popup.off('close', handleClose);
      popup.remove();
      popupRef.current = null;
    };
  }, [map, incident.coordinates.lng, incident.coordinates.lat, incident.id]);

  return null;
});
