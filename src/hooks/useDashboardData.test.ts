import { describe, it, expect } from 'vitest';
import { computeDashboardData } from './useDashboardData';
import type { Incident } from '@/domain/incident/types';

function mockIncident(overrides: Partial<Incident>): Incident {
  return {
    id: 'test_1',
    sequenceId: 'INC-202506-001',
    order: 1,
    title: 'Test',
    description: 'Test',
    type: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
    priority: 'medium',
    status: 'open',
    approval: false,
    project: { id: '01', name: 'Proyecto Test' },
    owner: null,
    whatsappOwner: null,
    assignees: [],
    observers: [],
    coordinates: { lat: -33.4489, lng: -70.6693 },
    locationDescription: '',
    dueDate: null,
    closingDate: null,
    media: [],
    tags: [],
    deleted: null,
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
    ...overrides,
  };
}

const NOW = new Date('2025-06-17T12:00:00.000Z');

const incidents: Incident[] = [
  mockIncident({
    id: '1',
    status: 'open',
    priority: 'high',
    type: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
    createdAt: '2025-01-15T10:00:00.000Z',
    dueDate: '2025-06-01T00:00:00.000Z',
    closingDate: null,
  }),
  mockIncident({
    id: '2',
    status: 'open',
    priority: 'medium',
    type: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
    createdAt: '2025-01-20T10:00:00.000Z',
    dueDate: null,
    closingDate: null,
  }),
  mockIncident({
    id: '3',
    status: 'closed',
    priority: 'low',
    type: { id: '02', key: 'electrical', name: 'Eléctrica', name_en: 'Electrical' },
    createdAt: '2025-02-01T10:00:00.000Z',
    closingDate: '2025-02-15T10:00:00.000Z',
    dueDate: '2025-06-01T00:00:00.000Z',
  }),
  mockIncident({
    id: '4',
    status: 'on_pause',
    priority: 'high',
    type: { id: '01', key: 'structural', name: 'Estructural', name_en: 'Structural' },
    createdAt: '2025-02-10T10:00:00.000Z',
    dueDate: '2025-06-01T00:00:00.000Z',
    closingDate: null,
  }),
  mockIncident({
    id: '5',
    status: 'open',
    priority: 'high',
    type: { id: '03', key: 'plumbing', name: 'Fontanería', name_en: 'Plumbing' },
    createdAt: '2025-03-01T10:00:00.000Z',
    dueDate: '2025-07-01T00:00:00.000Z',
    closingDate: null,
  }),
  mockIncident({
    id: '6',
    status: 'closed',
    priority: 'medium',
    type: { id: '02', key: 'electrical', name: 'Eléctrica', name_en: 'Electrical' },
    createdAt: '2025-03-15T10:00:00.000Z',
    closingDate: '2025-04-10T10:00:00.000Z',
    dueDate: null,
  }),
];

describe('computeDashboardData', () => {
  it('totalIncidents: cuenta todas las incidencias', () => {
    const result = computeDashboardData(incidents, NOW);
    expect(result.total).toBe(6);
  });

  it('openIncidents: solo las que tienen status open', () => {
    const result = computeDashboardData(incidents, NOW);
    expect(result.open).toBe(3);
  });

  it('closedIncidents: solo las que tienen status closed', () => {
    const result = computeDashboardData(incidents, NOW);
    expect(result.closed).toBe(2);
  });

  it('highPriorityIncidents: se refleja en priorityData', () => {
    const result = computeDashboardData(incidents, NOW);
    const alta = result.priorityData.find((p) => p.name === 'Alta')!;
    expect(alta.value).toBe(3);
  });

  it('overdueIncidents: con dueDate vencido y no cerradas', () => {
    const result = computeDashboardData(incidents, NOW);
    expect(result.overdue).toBe(2);
  });



  it('con array vacío devuelve todo en cero', () => {
    const result = computeDashboardData([], NOW);
    expect(result).toEqual({
      total: 0,
      open: 0,
      closed: 0,
      overdue: 0,
      avgResolutionLabel: '—',
      statusData: [
        { name: 'Abiertas', value: 0, color: '#22C55E' },
        { name: 'En pausa', value: 0, color: '#F59E0B' },
        { name: 'Cerradas', value: 0, color: '#A3A3A3' },
      ],
      priorityData: [
        { name: 'Alta', value: 0, color: '#EF4444' },
        { name: 'Media', value: 0, color: '#F59E0B' },
        { name: 'Baja', value: 0, color: '#F4C400' },
      ],
      categoryData: [],
      trendData: [],
    });
  });

  describe('statusDistribution', () => {
    it('agrupa y rotula por estado', () => {
      const result = computeDashboardData(incidents, NOW);
      expect(result.statusData).toEqual([
        { name: 'Abiertas', value: 3, color: '#22C55E' },
        { name: 'En pausa', value: 1, color: '#F59E0B' },
        { name: 'Cerradas', value: 2, color: '#A3A3A3' },
      ]);
    });
  });

  describe('priorityDistribution', () => {
    it('agrupa y rotula por prioridad', () => {
      const result = computeDashboardData(incidents, NOW);
      expect(result.priorityData).toEqual([
        { name: 'Alta', value: 3, color: '#EF4444' },
        { name: 'Media', value: 2, color: '#F59E0B' },
        { name: 'Baja', value: 1, color: '#F4C400' },
      ]);
    });
  });

  describe('categoryDistribution', () => {
    it('agrupa por type.name ordenado de mayor a menor', () => {
      const result = computeDashboardData(incidents, NOW);
      expect(result.categoryData).toEqual([
        { name: 'Estructural', value: 3 },
        { name: 'Eléctrica', value: 2 },
        { name: 'Fontanería', value: 1 },
      ]);
    });

    it('tipos con 0 ocurrencias no aparecen', () => {
      const soloEstructural = incidents.filter(
        (i) => i.type.name === 'Estructural'
      );
      const result = computeDashboardData(soloEstructural, NOW);
      expect(result.categoryData).toEqual([
        { name: 'Estructural', value: 3 },
      ]);
    });
  });

  describe('monthlyTrend', () => {
    it('agrupa created y closed por mes-año ordenado cronológicamente', () => {
      const result = computeDashboardData(incidents, NOW);
      expect(result.trendData).toEqual([
        { month: 'Ene 2025', created: 2, closed: 0 },
        { month: 'Feb 2025', created: 2, closed: 1 },
        { month: 'Mar 2025', created: 2, closed: 0 },
        { month: 'Abr 2025', created: 0, closed: 1 },
      ]);
    });

    it('mes sin actividad no aparece en trend', () => {
      const sinMayo = computeDashboardData(incidents, NOW);
      const meses = sinMayo.trendData.map((t) => t.month);
      expect(meses).not.toContain('May 2025');
    });
  });

  describe('avgResolutionLabel', () => {
    it('calcula promedio días/horas de incidencias cerradas', () => {
      const result = computeDashboardData(incidents, NOW);
      expect(result.avgResolutionLabel).toBe('20d 0h');
    });

    it('sin incidencias cerradas devuelve —', () => {
      const abiertas = incidents.filter((i) => i.status !== 'closed');
      const result = computeDashboardData(abiertas, NOW);
      expect(result.avgResolutionLabel).toBe('—');
    });
  });

  describe('overdue con casos específicos', () => {
    it('dueDate futuro no cuenta como overdue', () => {
      const data = [
        mockIncident({
          status: 'open',
          dueDate: '2025-07-01T00:00:00.000Z',
          createdAt: '2025-06-01T00:00:00.000Z',
        }),
      ];
      const result = computeDashboardData(data, NOW);
      expect(result.overdue).toBe(0);
    });

    it('cerrada con dueDate vencido no cuenta como overdue', () => {
      const data = [
        mockIncident({
          status: 'closed',
          dueDate: '2025-06-01T00:00:00.000Z',
          closingDate: '2025-06-10T00:00:00.000Z',
          createdAt: '2025-05-01T00:00:00.000Z',
        }),
      ];
      const result = computeDashboardData(data, NOW);
      expect(result.overdue).toBe(0);
    });

    it('abierta sin dueDate no cuenta como overdue', () => {
      const data = [
        mockIncident({
          status: 'open',
          dueDate: null,
          createdAt: '2025-01-01T00:00:00.000Z',
        }),
      ];
      const result = computeDashboardData(data, NOW);
      expect(result.overdue).toBe(0);
    });
  });
});
