import { useShallow } from 'zustand/react/shallow';
import { useIncidentStore } from './store';
import type { Incident, IncidentsFilters } from './types';
import type { ProjectStats } from '@/domain/project/types';
import { INCIDENT_STATUS_LABELS, INCIDENT_PRIORITY_LABELS } from '@/lib/constants';

export const selectIncidents = (state: { incidents: Incident[] }) => state.incidents;

export const selectSelectedId = (state: { selectedId: string | null }) => state.selectedId;

export const selectFilters = (state: { filters: IncidentsFilters }) => state.filters;

export const selectIsLoading = (state: { isLoading: boolean }) => state.isLoading;

export const selectError = (state: { error: string | null }) => state.error;

export const selectSelectedIncident = (state: {
  incidents: Incident[];
  selectedId: string | null;
}): Incident | null =>
  state.incidents.find((i) => i.id === state.selectedId) ?? null;

export const selectFilteredIncidents = (state: {
  incidents: Incident[];
  filters: IncidentsFilters;
}): Incident[] => {
  const { incidents, filters } = state;

  if (!filters.status && !filters.priority && !filters.typeKey && !filters.search && !filters.projectId) {
    return incidents;
  }

  return incidents.filter((incident) => {
    if (filters.status && incident.status !== filters.status) return false;
    if (filters.priority && incident.priority !== filters.priority) return false;
    if (filters.typeKey && incident.type.key !== filters.typeKey) return false;
    if (filters.projectId && incident.project.id !== filters.projectId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        incident.title.toLowerCase().includes(q) ||
        incident.description.toLowerCase().includes(q) ||
        incident.sequenceId.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
};

export const selectIncidentsByProject = (projectId: string) => (state: {
  incidents: Incident[];
}): Incident[] => state.incidents.filter((i) => i.project.id === projectId);

export const selectProjectStats = (projectId: string) => (state: {
  incidents: Incident[];
}): ProjectStats => {
  const projectIncidents = state.incidents.filter((i) => i.project.id === projectId);
  return {
    totalIncidents: projectIncidents.length,
    openIncidents: projectIncidents.filter((i) => i.status === 'open').length,
    closedIncidents: projectIncidents.filter((i) => i.status === 'closed').length,
    highPriorityIncidents: projectIncidents.filter((i) => i.priority === 'high' && i.status !== 'closed').length,
  };
};

export function getStatusLabel(status: string): string {
  return INCIDENT_STATUS_LABELS[status] ?? status;
}

export function getPriorityLabel(priority: string): string {
  return INCIDENT_PRIORITY_LABELS[priority] ?? priority;
}

export const useIncidents = () => useIncidentStore(selectIncidents);

export const useSelectedId = () => useIncidentStore(selectSelectedId);

export const useFilters = () => useIncidentStore(selectFilters);

export const useIsLoading = () => useIncidentStore(selectIsLoading);

export const useError = () => useIncidentStore(selectError);

export const useSelectedIncident = () =>
  useIncidentStore(useShallow(selectSelectedIncident));

export const useFilteredIncidents = () =>
  useIncidentStore(useShallow(selectFilteredIncidents));

export const useIncidentsByProject = (projectId: string) =>
  useIncidentStore(useShallow(selectIncidentsByProject(projectId)));

export const useProjectStats = (projectId: string) =>
  useIncidentStore(useShallow(selectProjectStats(projectId)));

export const useLoadIncidents = () => useIncidentStore((s) => s.loadIncidents);
export const useCreateIncident = () => useIncidentStore((s) => s.createIncident);
export const useUpdateIncident = () => useIncidentStore((s) => s.updateIncident);
export const useRemoveIncident = () => useIncidentStore((s) => s.removeIncident);
export const useSelectIncident = () => useIncidentStore((s) => s.selectIncident);
export const useSetFilters = () => useIncidentStore((s) => s.setFilters);
export const useResetFilters = () => useIncidentStore((s) => s.resetFilters);
