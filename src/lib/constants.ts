export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  open: 'Abierta',
  on_pause: 'En pausa',
  closed: 'Cerrada',
};

export const INCIDENT_PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const INCIDENT_TYPE_OPTIONS = [
  { key: 'structural', label: 'Estructural' },
  { key: 'electrical', label: 'Eléctrica' },
  { key: 'plumbing', label: 'Fontanería' },
  { key: 'safety', label: 'Seguridad' },
  { key: 'quality', label: 'Calidad' },
  { key: 'logistics', label: 'Logística' },
  { key: 'environmental', label: 'Medio Ambiente' },
];

export const MAPBOX_DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693];
export const MAPBOX_DEFAULT_ZOOM = 13;
