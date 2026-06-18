import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('zustand/middleware', () => ({
  devtools: (fn: any) => fn,
  persist: (fn: any) => fn,
}));

vi.mock('@/lib/utils', () => ({
  generateId: vi.fn(),
}));

vi.mock('./incidents.mock.json', () => ({
  default: [],
}));

import { useIncidentStore } from './store';
import { generateId } from '@/lib/utils';

const NOW_ISO = '2025-06-17T10:00:00.000Z';
const NOW_TS = new Date(NOW_ISO).getTime();

const BASE_DTO = {
  title: 'Fisura en losa',
  description: 'Fisura estructural en losa del sector B',
  typeKey: 'structural',
  priority: 'high' as const,
  projectId: '01',
  lat: -33.4489,
  lng: -70.6693,
  locationDescription: 'Sector B',
};

describe('useIncidentStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_TS);
    vi.clearAllMocks();
    vi.mocked(generateId).mockReturnValue('inc_abc123');

    useIncidentStore.setState({
      incidents: [],
      selectedId: null,
      filters: {},
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tiene el estado inicial correcto', () => {
    const state = useIncidentStore.getState();
    expect(state.incidents).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.filters).toEqual({});
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('createIncident', () => {
    it('asigna id, createdAt y updatedAt, y agrega al array', () => {
      const store = useIncidentStore.getState();
      const incident = store.createIncident(BASE_DTO);

      expect(generateId).toHaveBeenCalledOnce();
      expect(incident.id).toBe('inc_abc123');
      expect(incident.createdAt).toBe(NOW_ISO);
      expect(incident.updatedAt).toBe(NOW_ISO);

      const state = useIncidentStore.getState();
      expect(state.incidents).toHaveLength(1);
      expect(state.incidents[0]).toEqual(incident);
    });

    it('mapea los campos del DTO correctamente', () => {
      const incident = useIncidentStore.getState().createIncident(BASE_DTO);

      expect(incident.title).toBe(BASE_DTO.title);
      expect(incident.description).toBe(BASE_DTO.description);
      expect(incident.priority).toBe(BASE_DTO.priority);
      expect(incident.status).toBe('open');
      expect(incident.coordinates).toEqual({ lat: BASE_DTO.lat, lng: BASE_DTO.lng });
      expect(incident.project.id).toBe(BASE_DTO.projectId);
      expect(incident.type.key).toBe(BASE_DTO.typeKey);
    });

    it('status por defecto es open si no se especifica', () => {
      const incident = useIncidentStore.getState().createIncident(BASE_DTO);
      expect(incident.status).toBe('open');
    });

    it('status se asigna correctamente si se pasa', () => {
      const incident = useIncidentStore.getState().createIncident({
        ...BASE_DTO,
        status: 'closed',
      });
      expect(incident.status).toBe('closed');
      expect(incident.closingDate).toBe(NOW_ISO);
    });
  });

  describe('updateIncident', () => {
    it('actualiza solo la incidencia indicada', () => {
      const store = useIncidentStore.getState();
      const first = store.createIncident(BASE_DTO);

      vi.mocked(generateId).mockReturnValue('inc_def456');
      const second = store.createIncident({ ...BASE_DTO, title: 'Otra incidencia' });

      vi.setSystemTime(NOW_TS + 3600000);

      useIncidentStore.getState().updateIncident(first.id, {
        title: 'Título actualizado',
        priority: 'low',
      });

      const state = useIncidentStore.getState();
      expect(state.incidents).toHaveLength(2);

      const updated = state.incidents.find((i) => i.id === first.id)!;
      expect(updated.title).toBe('Título actualizado');
      expect(updated.priority).toBe('low');
      expect(updated.updatedAt).toBe(new Date(NOW_TS + 3600000).toISOString());

      const unchanged = state.incidents.find((i) => i.id === second.id)!;
      expect(unchanged.title).toBe('Otra incidencia');
      expect(unchanged.priority).toBe('high');
      expect(unchanged.updatedAt).toBe(NOW_ISO);
    });

    it('no hace nada si el id no existe', () => {
      useIncidentStore.getState().createIncident(BASE_DTO);

      useIncidentStore.getState().updateIncident('no-existe', {
        title: 'Nunca se aplica',
      });

      expect(useIncidentStore.getState().incidents).toHaveLength(1);
      expect(useIncidentStore.getState().incidents[0].title).toBe(BASE_DTO.title);
    });

    it('asigna closingDate al cerrar', () => {
      const incident = useIncidentStore.getState().createIncident(BASE_DTO);
      expect(incident.closingDate).toBeNull();

      vi.setSystemTime(NOW_TS + 7200000);
      useIncidentStore.getState().updateIncident(incident.id, { status: 'closed' });

      const updated = useIncidentStore.getState().incidents.find((i) => i.id === incident.id)!;
      expect(updated.status).toBe('closed');
      expect(updated.closingDate).toBe(new Date(NOW_TS + 7200000).toISOString());
    });
  });

  describe('selectIncident', () => {
    it('actualiza selectedId', () => {
      expect(useIncidentStore.getState().selectedId).toBeNull();

      useIncidentStore.getState().selectIncident('abc');
      expect(useIncidentStore.getState().selectedId).toBe('abc');

      useIncidentStore.getState().selectIncident('xyz');
      expect(useIncidentStore.getState().selectedId).toBe('xyz');

      useIncidentStore.getState().selectIncident(null);
      expect(useIncidentStore.getState().selectedId).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('actualiza los filtros', () => {
      useIncidentStore.getState().setFilters({ status: 'open' });
      expect(useIncidentStore.getState().filters).toEqual({ status: 'open' });
    });

    it('fusiona filtros anteriores con los nuevos', () => {
      useIncidentStore.getState().setFilters({ status: 'open', priority: 'high' });
      useIncidentStore.getState().setFilters({ search: 'fisura' });

      expect(useIncidentStore.getState().filters).toEqual({
        status: 'open',
        priority: 'high',
        search: 'fisura',
      });
    });
  });

  describe('resetFilters', () => {
    it('restaura filtros al estado inicial', () => {
      useIncidentStore.getState().setFilters({ status: 'open', priority: 'high' });
      useIncidentStore.getState().resetFilters();

      expect(useIncidentStore.getState().filters).toEqual({});
    });
  });

  describe('createIncident - visibilidad inmediata', () => {
    it('la incidencia aparece en el estado inmediatamente después de crearla', () => {
      const incident = useIncidentStore.getState().createIncident(BASE_DTO);

      const incidents = useIncidentStore.getState().incidents;
      expect(incidents).toContainEqual(incident);
      expect(incidents[incidents.length - 1]).toBe(incident);
    });
  });
});
