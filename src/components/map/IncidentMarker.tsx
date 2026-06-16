'use client';

import { memo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import { useMapInstance } from './MapContext';
import type { Incident } from '@/domain/incident/types';
import { getStatusLabel, getPriorityLabel } from '@/domain/incident/hooks';

function getMarkerColor(incident: Incident): string {
  if (incident.status === 'closed') return '#22C55E';
  if (incident.priority === 'high') return '#EF4444';
  return '#F4C400';
}

function getMarkerShadow(color: string): string {
  return `0 2px 8px ${color}66, 0 0 0 3px rgba(255,255,255,0.6)`;
}

function popupHTML(incident: Incident): string {
  const statusLabel = getStatusLabel(incident.status);
  const priorityLabel = getPriorityLabel(incident.priority);
  const color = getMarkerColor(incident);

  return `
    <div class="incident-popup">
      <div class="incident-popup__bar" style="background:${color}"></div>
      <h3 class="incident-popup__title">${incident.title}</h3>
      <div class="incident-popup__meta">
        <span class="incident-popup__badge incident-popup__badge--${incident.priority}">${priorityLabel}</span>
        <span class="incident-popup__badge incident-popup__badge--${incident.status}">${statusLabel}</span>
      </div>
      <p class="incident-popup__detail"><strong>Tipo:</strong> ${incident.type.name}</p>
      <p class="incident-popup__detail"><strong>Proyecto:</strong> ${incident.project.name}</p>
      <span class="incident-popup__id">${incident.sequenceId}</span>
      <a href="/incidents/${incident.id}" class="incident-popup__link">Ver detalle</a>
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

    const color = getMarkerColor(incident);

    const el = document.createElement('div');
    el.className = 'incident-marker';

    el.innerHTML = `
      <div class="incident-marker__outer" style="
        width:28px;height:28px;
        display:flex;align-items:center;justify-content:center;
      ">
        <div class="incident-marker__pulse" style="
          position:absolute;inset:-4px;border-radius:50%;
          animation:pulse-marker 2s ease-out infinite;
          border:2px solid ${color};
          opacity:0.4;
        "></div>
        <div class="incident-marker__core" style="
          width:16px;height:16px;border-radius:50%;
          background:${color};
          box-shadow:${getMarkerShadow(color)};
          transition:transform 0.2s ease;
        "></div>
      </div>
    `;

    el.style.cssText = 'cursor:pointer;';

    el.addEventListener('mouseenter', () => {
      const core = el.querySelector('.incident-marker__core') as HTMLElement;
      if (core) core.style.transform = 'scale(1.35)';
    });

    el.addEventListener('mouseleave', () => {
      const core = el.querySelector('.incident-marker__core') as HTMLElement;
      if (core) core.style.transform = 'scale(1)';
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
  }, [map, incident]);

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
  const router = useRouter();
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const linkCleanupRef = useRef<(() => void) | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!map) return;

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      className: 'spybee-popup',
    })
      .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
      .setHTML(popupHTML(incident))
      .addTo(map);

    const handleLinkClick = (e: Event) => {
      e.preventDefault();
      router.push(`/incidents/${incident.id}`);
    };

    const popupEl = popup.getElement();
    const linkEl = popupEl?.querySelector<HTMLAnchorElement>('.incident-popup__link');
    if (linkEl) {
      linkEl.addEventListener('click', handleLinkClick);
      linkCleanupRef.current = () => linkEl.removeEventListener('click', handleLinkClick);
    }

    const handleClose = () => onCloseRef.current?.();
    popup.on('close', handleClose);

    popupRef.current = popup;

    return () => {
      linkCleanupRef.current?.();
      linkCleanupRef.current = null;
      popup.off('close', handleClose);
      popup.remove();
      popupRef.current = null;
    };
  }, [map, incident]);

  return null;
});
