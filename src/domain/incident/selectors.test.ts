import { describe, it, expect } from 'vitest';
import { selectFilteredIncidents } from './selectors';
import type { Incident, IncidentsFilters } from './types';

function mockIncident(overrides: Partial<Incident>): Incident {
  return {
    id: 'test_1',
    sequenceId: 'INC-202506-001',
    order: 1,
    title: 'Fisura en losa',
    description: 'Fisura en losa del sector B, requiere evaluación estructural.',
    type: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
    priority: 'medium',
    status: 'open',
    approval: false,
    project: { id: '01', name: 'Proyecto Alpha' },
    owner: null,
    whatsappOwner: null,
    assignees: [],
    observers: [],
    coordinates: { lat: -33.4489, lng: -70.6693 },
    locationDescription: 'Sector B, piso 5',
    dueDate: null,
    closingDate: null,
    media: [],
    tags: [],
    deleted: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const incidents: Incident[] = [
  mockIncident({
    id: '1',
    sequenceId: 'INC-202506-001',
    title: 'Fisura en losa',
    description: 'Fisura estructural en losa del sector B.',
    priority: 'high',
    status: 'open',
    type: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
    project: { id: '01', name: 'Proyecto Alpha' },
  }),
  mockIncident({
    id: '2',
    sequenceId: 'INC-202506-002',
    title: 'Fallo eléctrico',
    description: 'Corto circuito en tablero general.',
    priority: 'high',
    status: 'open',
    type: { id: '02', key: 'electrical', name: 'Eléctrica', name_en: 'Electrical' },
    project: { id: '01', name: 'Proyecto Alpha' },
  }),
  mockIncident({
    id: '3',
    sequenceId: 'INC-202506-003',
    title: 'Fuga de agua',
    description: 'Fuga en tubería de baño del sector A.',
    priority: 'low',
    status: 'closed',
    type: { id: '03', key: 'plumbing', name: 'Fontanería', name_en: 'Plumbing' },
    project: { id: '02', name: 'Proyecto Beta' },
  }),
  mockIncident({
    id: '4',
    sequenceId: 'INC-202506-004',
    title: 'Señalización faltante',
    description: 'Falta señalética de seguridad en acceso norte.',
    priority: 'medium',
    status: 'on_pause',
    type: { id: '04', key: 'safety', name: 'Seguridad', name_en: 'Safety' },
    project: { id: '02', name: 'Proyecto Beta' },
  }),
  mockIncident({
    id: '5',
    sequenceId: 'INC-202506-005',
    title: 'Calidad de materiales',
    description: 'Lote de cemento no cumple especificaciones.',
    priority: 'medium',
    status: 'closed',
    type: { id: '05', key: 'quality', name: 'Calidad', name_en: 'Quality' },
    project: { id: '01', name: 'Proyecto Alpha' },
  }),
];

describe('selectFilteredIncidents', () => {
  it('devuelve todas las incidencias si no hay filtros', () => {
    const filters: IncidentsFilters = {};
    const result = selectFilteredIncidents({ incidents, filters });
    expect(result).toEqual(incidents);
  });

  describe('filtrar por estado', () => {
    it('solo las abiertas', () => {
      const filters: IncidentsFilters = { status: 'open' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.status === 'open')).toBe(true);
    });

    it('solo las cerradas', () => {
      const filters: IncidentsFilters = { status: 'closed' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.status === 'closed')).toBe(true);
    });

    it('solo las en pausa', () => {
      const filters: IncidentsFilters = { status: 'on_pause' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('on_pause');
    });
  });

  describe('filtrar por prioridad', () => {
    it('solo prioridad alta', () => {
      const filters: IncidentsFilters = { priority: 'high' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.priority === 'high')).toBe(true);
    });

    it('solo prioridad media', () => {
      const filters: IncidentsFilters = { priority: 'medium' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.priority === 'medium')).toBe(true);
    });

    it('solo prioridad baja', () => {
      const filters: IncidentsFilters = { priority: 'low' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('low');
    });
  });

  describe('filtrar por categoría (typeKey)', () => {
    it('solo estructurales', () => {
      const filters: IncidentsFilters = { typeKey: 'structural' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].type.key).toBe('structural');
    });

    it('solo eléctricas', () => {
      const filters: IncidentsFilters = { typeKey: 'electrical' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].type.key).toBe('electrical');
    });
  });

  describe('filtrar por proyecto', () => {
    it('solo las del proyecto Alpha', () => {
      const filters: IncidentsFilters = { projectId: '01' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(3);
      expect(result.every((i) => i.project.id === '01')).toBe(true);
    });
  });

  describe('búsqueda por texto', () => {
    it('encuentra por título', () => {
      const filters: IncidentsFilters = { search: 'fisura' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('encuentra por descripción', () => {
      const filters: IncidentsFilters = { search: 'señalética' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });

    it('encuentra por sequenceId', () => {
      const filters: IncidentsFilters = { search: 'INC-202506-003' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('no discrimina mayúsculas/minúsculas', () => {
      const filters: IncidentsFilters = { search: 'FISURA' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('coincide con palabras incompletas', () => {
      const filters: IncidentsFilters = { search: 'fisu' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('filtros combinados', () => {
    it('estado abierta + prioridad alta', () => {
      const filters: IncidentsFilters = { status: 'open', priority: 'high' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.status === 'open' && i.priority === 'high')).toBe(true);
    });

    it('estado cerrada + categoría fontanería', () => {
      const filters: IncidentsFilters = { status: 'closed', typeKey: 'plumbing' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('proyecto + prioridad + búsqueda', () => {
      const filters: IncidentsFilters = {
        projectId: '01',
        priority: 'high',
        search: 'eléctrico',
      };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('estado cerrada + proyecto + categoría calidad', () => {
      const filters: IncidentsFilters = {
        status: 'closed',
        projectId: '01',
        typeKey: 'quality',
      };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('5');
    });
  });

  describe('sin resultados', () => {
    it('estado + prioridad que no combinan', () => {
      const filters: IncidentsFilters = { status: 'closed', priority: 'high' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(0);
    });

    it('texto que no existe', () => {
      const filters: IncidentsFilters = { search: 'xyz-non-existent-999' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(0);
    });

    it('categoría que no existe', () => {
      const filters: IncidentsFilters = { typeKey: 'logistics' };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(0);
    });

    it('filtros que se excluyen entre sí', () => {
      const filters: IncidentsFilters = {
        status: 'on_pause',
        priority: 'high',
      };
      const result = selectFilteredIncidents({ incidents, filters });
      expect(result).toHaveLength(0);
    });
  });
});
