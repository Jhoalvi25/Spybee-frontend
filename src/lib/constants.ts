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

export const INCIDENT_TYPE_CATALOG: Record<string, { id: string; key: string; name: string; name_en: string }> = {
  structural: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
  electrical: { id: '02', key: 'electrical', name: 'Eléctrica', name_en: 'Electrical' },
  plumbing: { id: '03', key: 'plumbing', name: 'Fontanería', name_en: 'Plumbing' },
  safety: { id: '04', key: 'safety', name: 'Seguridad', name_en: 'Safety' },
  quality: { id: '05', key: 'quality', name: 'Calidad', name_en: 'Quality' },
  logistics: { id: '06', key: 'logistics', name: 'Logística', name_en: 'Logistics' },
  environmental: { id: '07', key: 'environmental', name: 'Medio Ambiente', name_en: 'Environmental' },
};

export const INCIDENT_TYPE_OPTIONS = Object.values(INCIDENT_TYPE_CATALOG).map((t) => ({
  key: t.key,
  label: t.name,
}));

export const MAPBOX_DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693];
export const MAPBOX_DEFAULT_ZOOM = 13;

export const MAP_STYLE_URLS: Record<string, string> = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

export const PROJECT_OPTIONS = [
  { value: '01', label: 'Edificio Torres del Parque' },
  { value: '02', label: 'Centro Comercial Los Dominicos' },
  { value: '03', label: 'Hospital Clínico La Florida' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Abierta' },
  { value: 'on_pause', label: 'En pausa' },
  { value: 'closed', label: 'Cerrada' },
];

export const PEOPLE_OPTIONS = [
  { id: 'usr_001', name: 'Carlos Muñoz', email: 'carlos.munoz@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=carlos.munoz@constructoraspybee.cl' },
  { id: 'usr_002', name: 'Laura González', email: 'laura.gonzalez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=laura.gonzalez@constructoraspybee.cl' },
  { id: 'usr_003', name: 'Roberto Vargas', email: 'roberto.vargas@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=roberto.vargas@constructoraspybee.cl' },
  { id: 'usr_004', name: 'María Soto', email: 'maria.soto@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=maria.soto@constructoraspybee.cl' },
  { id: 'usr_005', name: 'Jorge Faúndez', email: 'jorge.faundez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=jorge.faundez@constructoraspybee.cl' },
  { id: 'usr_006', name: 'Daniela Rojas', email: 'daniela.rojas@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=daniela.rojas@constructoraspybee.cl' },
  { id: 'usr_007', name: 'Pedro Ramírez', email: 'pedro.ramirez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=pedro.ramirez@constructoraspybee.cl' },
  { id: 'usr_008', name: 'Felipe Torres', email: 'felipe.torres@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=felipe.torres@constructoraspybee.cl' },
  { id: 'usr_009', name: 'Carmen Díaz', email: 'carmen.diaz@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=carmen.diaz@constructoraspybee.cl' },
  { id: 'usr_010', name: 'Ana Martínez', email: 'ana.martinez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=ana.martinez@constructoraspybee.cl' },
];

export const TAG_OPTIONS = [
  { id: 'tag_001', name: 'estructural', color: '#EF4444' },
  { id: 'tag_002', name: 'fontanería', color: '#3B82F6' },
  { id: 'tag_003', name: 'urgente', color: '#F97316' },
  { id: 'tag_004', name: 'reparado', color: '#22C55E' },
  { id: 'tag_005', name: 'eléctrico', color: '#F59E0B' },
  { id: 'tag_006', name: 'humedad', color: '#06B6D4' },
  { id: 'tag_007', name: 'calidad', color: '#14B8A6' },
  { id: 'tag_008', name: 'seguridad', color: '#DC2626' },
  { id: 'tag_009', name: 'grúa', color: '#8B5CF6' },
  { id: 'tag_010', name: 'proveedores', color: '#EC4899' },
  { id: 'tag_011', name: 'gas', color: '#F97316' },
  { id: 'tag_012', name: 'inventario', color: '#8B5CF6' },
  { id: 'tag_013', name: 'materiales', color: '#6B7280' },
  { id: 'tag_014', name: 'ruido', color: '#A855F7' },
  { id: 'tag_015', name: 'comunidad', color: '#06B6D4' },
  { id: 'tag_016', name: 'EPP', color: '#22C55E' },
];
