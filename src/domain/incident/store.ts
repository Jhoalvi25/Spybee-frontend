import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
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

function generateSequenceId(order: number): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `INC-${y}${m}-${String(order).padStart(3, '0')}`;
}

export const useIncidentStore = create<IncidentStore>()(
  devtools(
    (set, get) => ({
      incidents: [],
      selectedId: null,
      filters: {},
      isLoading: false,
      error: null,

      loadIncidents: async () => {
        set({ isLoading: true, error: null }, false, 'incidents/loadIncidents');

        try {
          await new Promise((r) => setTimeout(r, 400));
          set({ incidents: MOCK_INCIDENTS as Incident[], isLoading: false });
        } catch {
          set({ error: 'Error al cargar las incidencias', isLoading: false });
        }
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
          type: { id: dto.typeKey, key: dto.typeKey, name: dto.typeKey, name_en: dto.typeKey },
          priority: dto.priority,
          status: 'open',
          approval: false,
          project: { id: dto.projectId, name: PROJECT_NAMES[dto.projectId] ?? '' },
          owner: dto.ownerId ? { id: dto.ownerId, name: '', email: '', avatarUrl: '' } : null,
          whatsappOwner: null,
          assignees: (dto.assigneeIds ?? []).map((id) => ({ id, name: '', email: '', avatarUrl: '' })),
          observers: (dto.observerIds ?? []).map((id) => ({ id, name: '', email: '', avatarUrl: '' })),
          coordinates: { lat: dto.lat, lng: dto.lng },
          locationDescription: dto.locationDescription,
          dueDate: dto.dueDate ?? null,
          closingDate: null,
          media: [],
          tags: (dto.tagIds ?? []).map((id) => ({ id, name: '', color: '' })),
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
    { name: 'IncidentStore' }
  )
);
