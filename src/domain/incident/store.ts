import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { INCIDENT_TYPE_CATALOG } from '@/lib/constants';
import MOCK_INCIDENTS from './incidents.mock.json';
import type {
  Incident,
  CreateIncidentDTO,
  UpdateIncidentDTO,
  IncidentsFilters,
} from './types';

interface IncidentState {
  incidents: Incident[];
  selectedId: string | null;
  filters: IncidentsFilters;
  isLoading: boolean;
  error: string | null;
}

interface IncidentActions {
  loadIncidents: () => Promise<void>;
  createIncident: (dto: CreateIncidentDTO) => Incident;
  updateIncident: (id: string, dto: UpdateIncidentDTO) => void;
  removeIncident: (id: string) => void;
  selectIncident: (id: string | null) => void;
  setFilters: (filters: Partial<IncidentsFilters>) => void;
  resetFilters: () => void;
}

type IncidentStore = IncidentState & IncidentActions;

const PROJECT_NAMES: Record<string, string> = {
  '01': 'Edificio Torres del Parque',
  '02': 'Centro Comercial Los Dominicos',
  '03': 'Hospital Clínico La Florida',
};

const TAG_MAP: Record<string, { id: string; name: string; color: string }> = {
  tag_001: { id: 'tag_001', name: 'estructural', color: '#EF4444' },
  tag_002: { id: 'tag_002', name: 'fontanería', color: '#3B82F6' },
  tag_003: { id: 'tag_003', name: 'urgente', color: '#F97316' },
  tag_004: { id: 'tag_004', name: 'reparado', color: '#22C55E' },
  tag_005: { id: 'tag_005', name: 'eléctrico', color: '#F59E0B' },
  tag_006: { id: 'tag_006', name: 'humedad', color: '#06B6D4' },
  tag_007: { id: 'tag_007', name: 'calidad', color: '#14B8A6' },
  tag_008: { id: 'tag_008', name: 'seguridad', color: '#DC2626' },
  tag_009: { id: 'tag_009', name: 'grúa', color: '#8B5CF6' },
  tag_010: { id: 'tag_010', name: 'proveedores', color: '#EC4899' },
  tag_011: { id: 'tag_011', name: 'gas', color: '#F97316' },
  tag_012: { id: 'tag_012', name: 'inventario', color: '#8B5CF6' },
  tag_013: { id: 'tag_013', name: 'materiales', color: '#6B7280' },
  tag_014: { id: 'tag_014', name: 'ruido', color: '#A855F7' },
  tag_015: { id: 'tag_015', name: 'comunidad', color: '#06B6D4' },
  tag_016: { id: 'tag_016', name: 'EPP', color: '#22C55E' },
};

const PERSON_MAP: Record<string, { id: string; name: string; email: string; avatarUrl: string }> = {
  usr_001: { id: 'usr_001', name: 'Carlos Muñoz', email: 'carlos.munoz@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=carlos.munoz@constructoraspybee.cl' },
  usr_002: { id: 'usr_002', name: 'Laura González', email: 'laura.gonzalez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=laura.gonzalez@constructoraspybee.cl' },
  usr_003: { id: 'usr_003', name: 'Roberto Vargas', email: 'roberto.vargas@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=roberto.vargas@constructoraspybee.cl' },
  usr_004: { id: 'usr_004', name: 'María Soto', email: 'maria.soto@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=maria.soto@constructoraspybee.cl' },
  usr_005: { id: 'usr_005', name: 'Jorge Faúndez', email: 'jorge.faundez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=jorge.faundez@constructoraspybee.cl' },
  usr_006: { id: 'usr_006', name: 'Daniela Rojas', email: 'daniela.rojas@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=daniela.rojas@constructoraspybee.cl' },
  usr_007: { id: 'usr_007', name: 'Pedro Ramírez', email: 'pedro.ramirez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=pedro.ramirez@constructoraspybee.cl' },
  usr_008: { id: 'usr_008', name: 'Felipe Torres', email: 'felipe.torres@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=felipe.torres@constructoraspybee.cl' },
  usr_009: { id: 'usr_009', name: 'Carmen Díaz', email: 'carmen.diaz@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=carmen.diaz@constructoraspybee.cl' },
  usr_010: { id: 'usr_010', name: 'Ana Martínez', email: 'ana.martinez@constructoraspybee.cl', avatarUrl: 'https://i.pravatar.cc/150?u=ana.martinez@constructoraspybee.cl' },
};

const MOCK = MOCK_INCIDENTS as Incident[];

function generateSequenceId(order: number): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `INC-${y}${m}-${String(order).padStart(3, '0')}`;
}

const INITIAL_STATE: IncidentState = {
  incidents: MOCK,
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const useIncidentStore = create<IncidentStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        loadIncidents: async () => {
          // Data is initialized from MOCK + persisted user incidents via merge.
          // This function is preserved for API compatibility.
        },

      createIncident: (dto) => {
        const now = new Date().toISOString();
        const order = get().incidents.length + 1;
        const incident: Incident = {
          id: generateId(),
          sequenceId: generateSequenceId(order),
          order,
          title: dto.title,
          description: dto.description,
          type: INCIDENT_TYPE_CATALOG[dto.typeKey] ?? { id: dto.typeKey, key: dto.typeKey, name: dto.typeKey, name_en: dto.typeKey },
          priority: dto.priority,
          status: dto.status ?? 'open',
          approval: false,
          project: { id: dto.projectId, name: PROJECT_NAMES[dto.projectId] ?? '' },
          owner: dto.ownerId ? (PERSON_MAP[dto.ownerId] ?? { id: dto.ownerId, name: '', email: '', avatarUrl: '' }) : null,
          whatsappOwner: null,
          assignees: (dto.assigneeIds ?? []).map((id) => PERSON_MAP[id] ?? { id, name: '', email: '', avatarUrl: '' }),
          observers: (dto.observerIds ?? []).map((id) => PERSON_MAP[id] ?? { id, name: '', email: '', avatarUrl: '' }),
          coordinates: { lat: dto.lat, lng: dto.lng },
          locationDescription: dto.locationDescription ?? '',
          dueDate: dto.dueDate ?? null,
          closingDate: dto.status === 'closed' ? now : null,
          media: (dto.media ?? []).map((m, i) => ({
            id: `med_new_${i}`,
            name: m.name,
            type: 'image' as const,
            format: m.url.match(/\.mp4$/i) ? 'video/mp4' : 'image/jpeg',
            size: 0,
            status: 'approved',
            url: m.url,
          })),
          tags: (dto.tagIds ?? []).map((id) => {
            const tag = TAG_MAP[id];
            return tag ? { ...tag } : { id, name: id, color: '#6B7280' };
          }),
          deleted: null,
          createdAt: now,
          updatedAt: now,
        };

        set(
          (state) => ({ incidents: [...state.incidents, incident] }),
          false,
          'incidents/createIncident'
        );

        return incident;
      },

      updateIncident: (id, dto) => {
        const now = new Date().toISOString();
        const current = get().incidents.find((i) => i.id === id);
        if (!current) return;

        const updated: Incident = { ...current, ...dto, updatedAt: now };

        if (dto.status === 'closed' && current.status !== 'closed') {
          updated.closingDate = now;
        }

        set(
          (state) => ({
            incidents: state.incidents.map((i) => (i.id === id ? updated : i)),
          }),
          false,
          'incidents/updateIncident'
        );
      },

      removeIncident: (id) => {
        set(
          (state) => ({
            incidents: state.incidents.filter((i) => i.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
          }),
          false,
          'incidents/removeIncident'
        );
      },

      selectIncident: (id) => {
        set({ selectedId: id }, false, 'incidents/selectIncident');
      },

      setFilters: (filters) => {
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          'incidents/setFilters'
        );
      },

      resetFilters: () => {
        set({ filters: {} }, false, 'incidents/resetFilters');
      },
    }),
    {
      name: 'spybee-incidents',
      version: 1,
      partialize: (state) => ({
        incidents: state.incidents,
        selectedId: state.selectedId,
        filters: state.filters,
      }),
      migrate: (persistedState, version) => {
        if (version >= 1) return persistedState as object;
        const state = persistedState as { incidents?: Incident[] } | undefined;
        if (!state?.incidents) return persistedState as object;

        return {
          ...state,
          incidents: state.incidents.map((incident) => {
            if (!incident.type?.key) return incident;
            const catalogType = INCIDENT_TYPE_CATALOG[incident.type.key];
            if (!catalogType) return incident;
            if (
              incident.type.name === catalogType.name &&
              incident.type.name_en === catalogType.name_en
            ) {
              return incident;
            }
            return { ...incident, type: catalogType };
          }),
        };
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<IncidentState> | undefined;
        const persistedIncidents: Incident[] = p?.incidents ?? [];
        const seen = new Set(MOCK.map((i) => i.id));
        const userIncidents = persistedIncidents.filter((i) => !seen.has(i.id));
        return {
          ...current,
          ...p,
          incidents: [...MOCK, ...userIncidents],
          isLoading: false,
          error: null,
        };
      },
    }
  ),
  { name: 'IncidentStore' }
));
